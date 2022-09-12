import express from "express";
const router = express.Router();

// Middleware
const { authenticate } = require("../../middlewares/authenticate");
const UserPresentVerification = require("../../middlewares/UserPresentVerification");
const checkRolePerms = require('../../middlewares/checkRolePermissions');
const { roles: {ADMIN} } = require("../../utils/rolePermConstants");
const rateLimit = require('../../middlewares/rateLimit');
const UserPolicies = require('../../policies/UserPolicies');

// routes
import createBot from './createBot';
import myBots from './myBots';
import getBot from './getBot';
import botJoin from './botJoin';
import updateBot from './updateBot';
import deleteBot from './deleteBot';
import getCommands from './getCommands';
import resetBotToken from './resetBotToken';

// create a bot
router.post("/", authenticate(), rateLimit({name: 'create_bot', expire: 60, requestsLimit: 2 }), createBot);

// get bots created by user
router.get("/", authenticate(), myBots);

// get commands
router.get("/commands", authenticate(), getCommands);


// update my bot.
router.post("/:bot_id", authenticate(), UserPolicies.updateBot, updateBot);


// delete my bot
router.delete("/:bot_id", authenticate(), deleteBot);


// get bot. token only visable for creator. (SAFE TO USE FOR OTHER USERS.)
router.get("/:bot_id", authenticate(false, true), getBot);

// join bot to a server
//router.put("/:bot_id/servers/:server_id", authenticate(), rateLimit({name: 'bot_join', expire: 60, requestsLimit: 5 }), UserPresentVerification, checkRolePerms('Admin', ADMIN), botJoin );

// reset token /bots/6665254446718521344/reset-token
router.post("/:bot_id/reset-token", authenticate(), rateLimit({name: 'reset_bot_token', expire: 60, requestsLimit: 5 }), resetBotToken );

export default router;
