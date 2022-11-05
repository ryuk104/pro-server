import express from "express";
const router = express.Router();
import { Guild, Member, User } from "../../utils/index";
import bcrypt from "bcrypt";

import { Users } from "../../models/Users";
const nertiviaCDN = require("../../utils/uploadCDN/nertiviaCDN");

const redis = require("../../services/redis/redis");
const { deleteAllUserFCM } = require("../../utils/sendPushNotification");
const { kickUser } = require("../../utils/kickUser");



module.exports = async (req, res, next) => {
  const { password } = req.body;


  // validate password
  const user = await Users.findById(req.user._id).select("password");
  if (!user){
    return res
    .status(404)
    .json({error: "User could not be found."})
  }

  const passwordMatch = await user.isValidPassword(password);
  if (!passwordMatch) {
    return res
    .status(403)
    .json({error: "Password does not match."})
  }


  // CHECK:
  // Users MUST 
  // leave/delete all servers
  // delete all bots
  
  const botExists = await Users.exists({createdBy: req.user._id});
  if (botExists) {
    return res
    .status(403)
    .json({error: "You must delete all of your bots before deleting your account."})
  }

  const _user = await Users.findById(req.user._id).select("servers");
  if (_user && _user.servers && _user.servers.length) {
    return res
    .status(403)
    .json({error: "You must leave / Delete all of your servers before deleting your account."})
  }

  await deleteAllUserFCM(req.user.id);



  await Users.updateOne({_id: req.user._id}, {
    $set: {
      username: "Deleted User " + (Math.floor(Math.random() * 100000) + 1),
      created: 0
    },
    $inc: {passwordVersion: 1},
    $unset: {
      ip: 1,
      about_me: 1,
      show_welcome: 1,
      GDriveRefreshToken: 1,
      banned: 1,
      custom_status: 1,
      email: 1,
      settings: 1,
      avatar: 1,
      password: 1,
      readTerms: 1,
      servers: 1,
      lastSeen: 1,
      status: 1,
      type: 1,
      badges: 1,
    }
  })

  
  // delete files from cdn
  nertiviaCDN.deletePath("/" + req.user.id).catch(err => {console.log("Error deleting from CDN", err)});

  kickUser(req.user.id, "Token outdated.");
  req.session.destroy();

  res
  .status(200)
  .json({status: "Account Deleted!"})



};


router.post("/", async (req, res) => {
	const user = await User.findOneOrFail({ where: { id: req.user_id }, select: ["data"] }); //User object
	let correctpass = true;

	if (user.data.hash) {
		// guest accounts can delete accounts without password
		correctpass = await bcrypt.compare(req.body.password, user.data.hash);
		if (!correctpass) {
			throw new res.(req.("auth:login.INVALID_PASSWORD"));
		}
	}

	// TODO: decrement guild member count

	if (correctpass) {
		await Promise.all([User.delete({ id: req.user_id }), Member.delete({ id: req.user_id })]);

		res.sendStatus(204);
	} else {
		res.sendStatus(401);
	}
});

export default router;
