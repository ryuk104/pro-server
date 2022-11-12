import User from "../models/user";
import {BannedIPs} from "../models/BannedIPs";
import { verifyJwtToken } from "../utils/token"


const JWT = require("jsonwebtoken");

export const checkAuth = async (req, res, next) => {
  try {
      // check for auth header from client 
      const header = req.headers.authorization

      if (!header) {
          next({ status: 403, message: 'AUTH_HEADER_MISSING_ERR' })
          return
      }

      // verify  auth token
      const token = header.split("Bearer ")[1]

      if (!token) {
          next({ status: 403, message: 'AUTH_TOKEN_MISSING_ERR' })
          return
      }

      const userId = verifyJwtToken(token,next)

      if (!userId) {
          next({ status: 403, message: 'JWT_DECODE_ERR' })
          return
      }

      const user = await User.findById(userId)

      if (!user) {
          next({status: 404, message: 'USER_NOT_FOUND_ERR' })
          return
      }

      res.locals.user = user

      next()
  } catch (err) {
      next(err)
  }
}


export function authenticate (allowBot = false, allowInvalid = false, allowNonTerms = false) {
  return async function (req, res, next) {

    const token = process.env.JWT_HEADER + req.headers.authorization;
    // will contain user id
    let decryptedToken;
    let passwordVersion = 0;

    try {
      const decrypted = JWT.verify(token, process.env.JWT_SECRET);
      const split = decrypted.split("-");
      decryptedToken = split[0];
      passwordVersion = split[1] ? parseInt(split[1]) : 0;
    } catch (e) {
      if (allowInvalid) return next();
      req.session.destroy();
      return res.status(401).send({
        message: "Invalid Token."
      });
    }

    // check if details exist in redis session
    if (req.session["user"]) {

      req.user = req.session["user"];
      const iPBanned = await checkIPChangeAndIsBanned(req, res);
      if (iPBanned) {
        return;
      }
      const pswdVerNotEmpty = req.user.passwordVersion === undefined && passwordVersion !== 0;
      if (pswdVerNotEmpty || req.user.passwordVersion !== undefined && req.user.passwordVersion !== passwordVersion) {
        req.session.destroy();
        return res.status(401).send({
          message: "Token invalidated."
        });
      }


      if (req.user.id === decryptedToken) {
        if (req.user.bot && !allowBot) {
          res.status(403).json({message: "Bots are not allowed to access this."})
          return;
        }

        return next();
      }
    }




    const user = await User.findOne({ id: decryptedToken })
      .select(
        "avatar status type _id username id badges tag created GDriveRefreshToken email_confirm_code banned bot passwordVersion readTerms"
      )
      .lean();
    // If user doesn't exists, handle it
    if (!user) {
      if (allowInvalid) return next();
      req.session.destroy();
      return res.status(401).send({
        message: "Invalid Token."
      });
    }
    if ((!user.bot && !user.readTerms) && !allowNonTerms) {
      req.session.destroy();
      return res.status(401).send({
        message: "You must accept the updated privacy policy and the TOS before continuing inside the app."
      });
    }
    if (user.banned) {
      req.session.destroy();
      return res.status(401).send({
        message: "You are banned."
      });
    }
    if (user.email_confirm_code) {
      if (allowInvalid) return next();
      req.session.destroy();
      return res.status(401).send({
        message: "Email not confimed"
      });
    }
    const pswdVerNotEmpty = user.passwordVersion === undefined && passwordVersion !== 0;
    if (pswdVerNotEmpty || user.passwordVersion !== undefined && user.passwordVersion !== passwordVersion) {
      req.session.destroy();
      return res.status(401).send({
        message: "Token invalidated."
      });
    }

    req.user = JSON.parse(JSON.stringify(user));
    req.session["user"] = user;
    const iPBanned = await checkIPChangeAndIsBanned(req, res);
    if (iPBanned) {
      return;
    }
    if (user.bot && !allowBot) {
      res.status(403).json({message: "Bots are not allowed to access this."})
      return;
    }

    next();
  };
}

async function checkIPChangeAndIsBanned(req, res) {
  const storedIP = req.session["ip"];
  if (!storedIP || storedIP != req.userIP) {
    // check if ip banned
    const ipBanned = await BannedIPs.exists({ ip: req.userIP });
    if (ipBanned) {
      res.status(401).send({
        message: "IP is banned."
      });
      req.session.destroy();
      return true;
    }
    addIPToDB(req);
    req.session["ip"] = req.userIP;
    return false;
  }
  return false;
}

function addIPToDB(req) {
  User.updateOne(
    { _id: req.session.user._id },
    { ip: req.userIP },
    (err, doc) => { }
  );

  // UsersIPs.updateOne(
  //   { ip: req.userIP },
  //   { $addToSet: { users: req.session.user._id } },
  //   { upsert: true, setDefaultsOnInsert: true },
  //   (err, doc) => {}
  // );
}
