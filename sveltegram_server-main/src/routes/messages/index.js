import express from "express";
const router = express.Router();

// Policies
const messagePolicy = require('../../policies/messagePolicies');

// Middleware
const { authenticate, checkAuth } = require("../../middlewares/authenticate");
const channelVerification = require('../../middlewares/ChannelVerification');
//import URLEmbed from '../../middlewares/URLEmbed';
const serverChannelPermissions = require('../../middlewares/serverChannelPermissions');
const busboy = require('connect-busboy');
const rateLimit = require('../../middlewares/rateLimit');
const channelRateLimit = require('../../middlewares/channelRateLimit');
const permissions = require('../../utils/rolePermConstants');
const checkRolePerms = require('../../middlewares/checkRolePermissions');
const disAllowBlockedUser = require('../../middlewares/disAllowBlockedUser');
//import fileMessage from './fileMessage';
import sendMessage from './sendOrUpdateMessage';


// get messages
router.get("/channels/:channelId", 
  checkAuth,
  rateLimit({name: 'messages_load', expire: 60, requestsLimit: 120 }),
  channelVerification,
  require('./getMessages')
);

// get message
router.get("/:messageID/channels/:channelId",
  checkAuth,
  rateLimit({name: 'message_load', expire: 60, requestsLimit: 120 }),
  channelVerification,
  require('./getMessage')
);

// delete message
router.delete("/:messageID/channels/:channelId",
  authenticate(true),
  rateLimit({name: 'message_delete', expire: 60, requestsLimit: 120 }),
  channelVerification,
  disAllowBlockedUser,
  checkRolePerms('Admin', permissions.roles.ADMIN, false),
  require('./deleteMessage')
);

// delete message bulk
router.delete("/:channelId/bulk",
  authenticate(true),
  rateLimit({name: 'message_delete_bulk', expire: 60, requestsLimit: 10 }),
  channelVerification,
  disAllowBlockedUser,
  checkRolePerms('Admin', permissions.roles.ADMIN, false),
  require('./deleteMessageBulk')
);

// add reaction
router.post("/:messageID/channels/:channelId/reactions",
  authenticate(true),
  rateLimit({name: 'message_react', expire: 60, requestsLimit: 120 }),
  channelVerification,
  disAllowBlockedUser,
  require('./addReaction')
);
// remove reaction
router.delete("/:messageID/channels/:channelId/reactions",
  authenticate(true),
  rateLimit({name: 'message_react', expire: 60, requestsLimit: 120 }),
  channelVerification,
  disAllowBlockedUser,
  require('./removeReaction')
);
// get reacted users
router.get("/:messageID/channels/:channelId/reactions/users",
  authenticate(true),
  rateLimit({name: 'message_react_users', expire: 60, requestsLimit: 120 }),
  channelVerification,
  disAllowBlockedUser,
  require('./getReactedUsers')
);

// update message
router.patch("/:messageID/channels/:channelId",
  authenticate(true),
  messagePolicy.update,
  rateLimit({name: 'message_update', expire: 60, requestsLimit: 120 }),
  channelVerification,
  disAllowBlockedUser,
  //fileMessage,
  sendMessage,
  //URLEmbed
);


// send message
router.post("/channels/:channelId",
  checkAuth,
  messagePolicy.post,
  rateLimit({name: 'message_send', expire: 20, requestsLimit: 15 }),
  channelVerification,
  channelRateLimit,
  disAllowBlockedUser,
  serverChannelPermissions('send_message', true),
  checkRolePerms('Send Message', permissions.roles.SEND_MESSAGES),
  //fileMessage,
  sendMessage,
  //URLEmbed,
  //GDriveOauthClient,
  //busboy(),
 // require('./sendFileMessage'),
);


// typing
router.post("/:channelId/typing",
  authenticate(true),
  rateLimit({name: 'message_typing', expire: 60, requestsLimit: 120 }),
  channelVerification,
  disAllowBlockedUser,
  serverChannelPermissions('send_message', true),
  checkRolePerms('Send Message', permissions.roles.SEND_MESSAGES),
  require('./sendTypingIndicator'),
);

export default router;