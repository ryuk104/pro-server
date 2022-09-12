import express from "express";
const router = express.Router();

// Middleware
const { authenticate } = require("../../../middlewares/authenticate");
const UserPresentVerification = require ('../../../middlewares/UserPresentVerification')
const serverPolicy = require("../../../policies/ServerPolicies");
const checkRolePerms = require('../../../middlewares/checkRolePermissions');
const { roles: {MANAGE_CHANNELS}} = require("../../../utils/rolePermConstants");

// Channels
router.get('/:server_id/channels',
  authenticate(),
  UserPresentVerification,
  require("./getServerChannels")
);

// Create
router.put('/:server_id/channels',
  authenticate(true),
  UserPresentVerification,
  checkRolePerms('Channels', MANAGE_CHANNELS),
  serverPolicy.createChannel,
  require("./createServerChannel")
);

// Update
router.patch('/:server_id/channels/:channel_id',
  authenticate(true),
  UserPresentVerification,
  checkRolePerms('Channels', MANAGE_CHANNELS),
  serverPolicy.updateChannel,
  require("./updateServerChannel")
);

// Delete
router.delete('/:server_id/channels/:channel_id',
  authenticate(true),
  UserPresentVerification,
  checkRolePerms('Channels', MANAGE_CHANNELS),
  require("./deleteServerChannel")
);

// mute server channel
router.put('/:server_id/channels/:channel_id/mute',
  authenticate(),
  UserPresentVerification,
  require("./muteServerChannel")
);

// unmute server channel
router.delete('/:server_id/channels/:channel_id/mute',
  authenticate(),
  UserPresentVerification,
  require("./unmuteServerChannel")
);

// position
router.put('/:server_id/channels/position',
  authenticate(),
  UserPresentVerification,
  checkRolePerms('Channels', MANAGE_CHANNELS),
  require("./channelPositions")
);

module.exports = router;
