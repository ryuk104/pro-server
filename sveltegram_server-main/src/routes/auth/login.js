import express from "express";
const router = express.Router();

import { body } from "express-validator";
import bcrypt from "bcrypt";
//import { EMAIL_INCORRECT_ERR } from "../errors";
import nodemailer from 'nodemailer';
import validate from 'deep-email-validator'
import blacklistArr from '../../utils/emailBlacklist.json'


import User from "../../models/user";
import {BannedIPs} from "../../models/BannedIPs";
const JWT = require("jsonwebtoken");

function signToken(user_id, pwdVer) {
  if (pwdVer !== undefined) {
    return JWT.sign(`${user_id}-${pwdVer}`, process.env.JWT_SECRET);
  } else {
    return JWT.sign(user_id, process.env.JWT_SECRET);
  }
}

let checkPassword = async (password, hashedPassword, next) => {
    try {
      const matchPassword = await bcrypt.compare(password, hashedPassword);
      return matchPassword;
    } catch (err) {
      next(err);
    }
  };

module.exports = async (req, res, next) => {
  // email can be username:tag.
  const {email, password} = req.body;
  req.session.destroy();
  // Validate information

  let obj;
  const usernameTag = email.split(":");
  if (usernameTag.length === 2) {
    obj = {username: usernameTag[0], tag: usernameTag[1]}
  } else {
    obj = {email: email.toLowerCase()};
  }
  // Find the user given the email
  const user = await User.findOne(obj).select(
    "avatar status badges _id username id tag created GDriveRefreshToken password banned email_confirm_code passwordVersion"
  );

  // If not, handle it
  if (!user) {
    return res
      .status(404)
      .json({ errors: [{ msg: "Email is incorrect.", param: "email" }] });
  }
  if (user.email_confirm_code) {
    return res.status(401).json({
      code: "CONFIRM_EMAIL"
    })
  }
  // Check if the password is correct
  const matchPassword = await checkPassword(password, user.password, next);
    if (!matchPassword) {
      next({ status: 400, message: 'INVALID_CREDENTIAL_ERR' });
      return;
    }

  if (!matchPassword) {
    return res
      .status(401)
      .json({
        status: false,
        errors: [{ msg: "Password is incorrect.", param: "password" }]
      });
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

  user.password = undefined;

  // Generate token without header information
  const token = signToken(user.id, user.passwordVersion)
    .split(".")
    .splice(1)
    .join(".");

  const data = {
    username: user.username,
    tag: user.tag,
    id: user.id,
    avatar: user.avatar
  };

  res.send({
    message: "You were logged in.",
    action: "logged_in",
    user: data,
    token
  });
};