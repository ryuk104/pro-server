//import './MethodInvocationOverride';
//import './startup/settings';
//import './methods/checkCodesRemaining';
//import './methods/disable';
//import './methods/enable';
//import './methods/regenerateCodes';
//import './methods/validateTempToken';
//import '../loginHandler';

import express from "express";
const router = express.Router();
import { body } from "express-validator";
import bcrypt from "bcrypt";
import {BannedIPs} from "../../models/BannedIPs";
//import { EMAIL_INCORRECT_ERR } from "../errors";
import nodemailer from 'nodemailer';
import validate from 'deep-email-validator'
import blacklistArr from '../../utils/emailBlacklist.json'
const transporter = nodemailer.createTransport({
  service: process.env.SMTP_SERVICE,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
})


import User from "../../models/user";
import { validationResult } from "express-validator";

import { createJwtToken } from "../../utils/token";

import { checkAuth } from "../../middlewares/authenticate";

let checkPassword = async (password, hashedPassword, next) => {
  try {
    const matchPassword = await bcrypt.compare(password, hashedPassword);
    return matchPassword;
  } catch (err) {
    next(err);
  }
};

let hashPassword = async (password, next) => {
  try {
    const hashed = await bcrypt.hash(password, 6);
    return hashed;
  } catch (error) {
    next(error);
  }
};



const loginValidation = [
  body("email").not().isEmpty().withMessage("email must be required"),
  body("password").not().isEmpty().withMessage("Password must be required"),
];

const registerValidation = [
  body("username").not().isEmpty().withMessage("username must be required"),
  body("name").not().isEmpty().withMessage("Name must be required"),
  body("password").not().isEmpty().withMessage("Password must be required"),
  body("email")
    .not()
    .isEmpty()
    .withMessage("Email address must be required")
    .isEmail()
    .withMessage('EMAIL_INCORRECT_ERR'),
];

// ------------------------- login with username ------------------------------

const loginUser = async (req, res, next) => {
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      next({ status: 422, message: "user input error", data: errors.mapped() });
      return;
    }

    const { email, password } = req.body;

  // Validate information

  let obj;
  const usernameTag = email.split(":");
  if (usernameTag.length === 2) {
    obj = {username: usernameTag[0], tag: usernameTag[1]}
  } else {
    obj = {email: email.toLowerCase()};
  }

    // verify email

    const user = await User.findOne({ email });
    if (!user) {
      next({ status: 400, message: 'INVALID_CREDENTIAL_ERR' });
      return;
    }
  // If not, handle it
  if (user.email_confirm_code) {
    return res.status(401).json({
      code: "CONFIRM_EMAIL"
    })
  }

    

    // verify password

    const matchPassword = await checkPassword(password, user.password, next);
    if (!matchPassword) {
      next({ status: 400, message: 'INVALID_CREDENTIAL_ERR' });
      return;
    }

    // check if user is banned
  if (user.banned) {
    return res
    .status(401)
    .json({
      errors: [{ msg: "You are suspended.", param: "email" }]
    });
  }

  // check if ip is banned
  const ipBanned = await BannedIPs.exists({ip: req.userIP});
  if (ipBanned) {
    return res
    .status(401)
    .json({
      errors: [{ msg: "IP is banned.", param: "email" }]
    });
  }

    // send jwt token

    const token = createJwtToken({ userId: user._id });

    res.status(201).json({
      type: "success",
      message: "You have loggedin successfully",
      data: {
        token,
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

// --------------------- create new user ---------------------------------

const registerUser = async (req, res, next) => {
  try {
    req.session.destroy()

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      next({ status: 422, message: "user input error", data: errors.mapped() });
      return;
    }

    // check if ip is banned
  const ipBanned = await BannedIPs.exists({ip: req.userIP});
  if (ipBanned) {
    return res
    .status(401)
    .json({
      errors: [{ msg: "IP is banned.", param: "email" }]
    });
  }    
  
    let { username, email, password, name } = req.body;


    username = username.replace(
      /[\xA0\x00-\x09\x0B\x0C\x0E-\x1F\x7F\u{2000}-\u{200F}\u{202F}\u{2800}\u{17B5}\u{17B5}\u{17B5}\u{17B5}\u{17B5}\u{17B5}]/gu,
      ""
    );
      // check if result is empty
      if (!username.trim()) {
      return res
      .status(403)
      .json({ errors: [{ param: "username", msg: "Username is required." }] });
    }


    // check if the email really exists
  const emailExists = await validate({email, validateTypo: false, validateSMTP: false});

  if (!emailExists.valid && !process.env.DEV_MODE) {
    return res.status(403).json({
      errors: [{param: "email", msg: `Email is Invalid (${emailExists.reason}).`}]})
  }


    // check if email is blacklisted
  const emailBlacklisted = blacklistArr.find(d => d === email.split("@")[1].trim().toLowerCase())
  if (emailBlacklisted) {
    return res.status(403).json({
      errors: [{param: "email", msg: "Email is blacklisted."}]
    });
  }  

    // check duplicate email
    const emailExist = await User.findOne({ email: email.toLowerCase() });

    if (emailExist) {
      next({ status: 400, message: 'EMAIL_ALREADY_EXISTS_ERR' });
      return;
    }

    // hash password

    password = await hashPassword(password, next);

    const newUser = new User({ username, email: email.toLowerCase(), password, ip: req.userIP });
    const created = await newUser.save();
/*
  if (process.env.DEV_MODE === "true") {
    return res.status(403).json({
      errors: [{param: "other", msg: "Dev mode. email confirm code: " + created.email_confirm_code}]
    });
  }

  
    // send email
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email.toLowerCase().trim(), 
    subject: 'Nertivia - Confirmation Code',
    html: `<p>Your confirmation code is: <strong>${created.email_confirm_code}</strong></p>`
  };

  transporter.sendMail(mailOptions, async (err, info) => {
    if (err) {
      await User.deleteOne({_id: created._id})
      return res.status(403).json({
        errors: [{param: "other", msg: "Something went wrong while sending email. Try again later."}]
      });
    }
    // Respond with user
    res.send({
      message: "confirm email"
    })
  })

  // check if the user agreed to the Terms of Service
	if (!body.consent) {
		throw FieldErrors({
			consent: { code: "CONSENT_REQUIRED", message: req.t("auth:register.CONSENT_REQUIRED") }
		});
	}

	if (register.requireCaptcha && security.captcha.enabled && !validToken) {
		const { sitekey, service } = security.captcha;
		if (!body.captcha_key) {
			return res?.status(400).json({
				captcha_key: ["captcha-required"],
				captcha_sitekey: sitekey,
				captcha_service: service
			});
		}

		const verify = await verifyCaptcha(body.captcha_key, ip);
		if (!verify.success) {
			return res.status(400).json({
				captcha_key: verify["error-codes"],
				captcha_sitekey: sitekey,
				captcha_service: service
			});
		}
	}

    */

    // create new user
    const createUser = new User({
      username,
      email,
      password,
      name,
    });

    // save user

    const user = await createUser.save();

    res.status(201).json({
      type: "success",
      message: "You have Registered successfully ",
      data: {
        userId: user._id,
      },
    });
  } catch (error) {
    next(error);
  }
};

// --------------- fetch current user -------------------------

const fetchCurrentUser = async (req, res, next) => {
  try {
    const currentUser = res.locals.user;
    return res.status(200).json({
      type: "success",
      message: "fetch current user",
      data: {
        user: currentUser,
      },
    });
  } catch (error) {
    next(error);
  }
};

const logoutUser = async (req, res, next) => {
  try {
    req.session.destroy();    
    const currentUser = res.locals.user;
    const user = await User.findById(currentUser._id);
    user.isActive = false;
    user.lastSeen = new Date().toISOString();
    await user.save();
    return res.status(200).json({
      type: "success",
      message: "You have loggedout successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

//const {get, set} = require('../../services/redis');
//const {permitAllAuthenticator} = require('../routes/controller');
//const verifyIdentities = require('../verifications');
//const {restrictRoomCreation} = require('../config');

router.post("/register", registerValidation, registerUser);

router.post("/login", loginValidation, loginUser);

router.get("/me", checkAuth, fetchCurrentUser);

router.get("/logout", checkAuth, logoutUser);


const isAnyInList = (tokens, publicKeys) => {
  return tokens.some(token => publicKeys.includes(token));
};
/*
const hasAccessToRoom = async (req, roomId) => {
  const roomInfo = await get('rooms/' + roomId);
  if (!roomInfo) return false;
  return isAnyInList(
    req.ssrIdentities,
    (roomInfo.access && roomInfo.access.identities) || []
  );
};

const isModerator = async (req, roomId) => {
  const roomInfo = await get('rooms/' + roomId);
  if (!roomInfo) return false;
  return isAnyInList(req.ssrIdentities, roomInfo['moderators']);
};

const identityIsAdmin = async identityKeys => {
  const adminKeys = await get('server/admins');
  return isAnyInList(identityKeys, adminKeys);
};

const isAdmin = async req => {
  return await identityIsAdmin(req.ssrIdentities);
};

const addAdmin = async serverAdminId => {
  const currentServerAdmins = await get('server/admins');
  if (currentServerAdmins && !currentServerAdmins.includes(serverAdminId)) {
    currentServerAdmins.push(serverAdminId);
    await set('server/admins', currentServerAdmins);
  } else {
    await set('server/admins', [serverAdminId]);
  }
};

const removeAdmin = async serverAdminId => {
  const currentServerAdmins = await get('server/admins');
  const newServerAdmins = currentServerAdmins.filter(e => e !== serverAdminId);
  await set('server/admins', newServerAdmins);
};

const initializeServerAdminIfNecessary = async req => {
  const admins = await get('server/admins');
  if (!admins || admins.length === 0) {
    await set('server/admins', [req.params.id]);
  }
};
*/
/*
const roomAuthenticator = {
  ...permitAllAuthenticator,
  canPost: async (req, res, next) => {
    if (restrictRoomCreation && !(await isAdmin(req))) {
      res.sendStatus(403);
      return;
    }

    const roomId = req.params.id;
    if (!/^[\w-]{4,}$/.test(roomId)) {
      res.sendStatus(403);
      return;
    }
    next();
  },
  canPut: async (req, res, next) => {
    const roomId = req.params.id;

    if (req.ssrIdentities.length === 0) {
      res.sendStatus(401);
      return;
    }
    if (!(await isModerator(req, roomId))) {
      res.sendStatus(403);
      return;
    }
    next();
  },
};

const identityAuthenticator = {
  ...permitAllAuthenticator,
  canPost: async (req, res, next) => {
    await initializeServerAdminIfNecessary(req);
    next();
  },
  canPut: async (req, res, next) => {
    if (req.ssrIdentities.length === 0) {
      res.sendStatus(401);
      return;
    }

    if (req.body.identities) {
      try {
        await verifyIdentities(req.body.identities, req.params.id);
      } catch (error) {
        res.status(400).json({
          success: false,
          error: {
            code: 'identity-verification-failed',
            message: error.message,
          },
        });
        return;
      }
    }

    await initializeServerAdminIfNecessary(req);
    next();
  },
};
*/


export default router;
