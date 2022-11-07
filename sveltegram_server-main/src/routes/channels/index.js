import express from "express";
const router = express.Router();

import {
	Channel,
	ChannelDeleteEvent,
	ChannelModifySchema,
	ChannelType,
	ChannelUpdateEvent,
	emitEvent,
	handleFile,
	OrmUtils,
	Recipient
} from "@fosscord/util";

/*
import { Subscriptions } from '../../app/models';

Meteor.methods({
	hideRoom(rid) {
		check(rid, String);

		if (!Meteor.userId()) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', {
				method: 'hideRoom',
			});
		}

		return Subscriptions.hideByRoomIdAndUserId(rid, Meteor.userId());
	},
});
*/


// Middleware
import { authenticate } from "../../middlewares/authenticate";
import channelVerification from "../../middlewares/ChannelVerification";
import rateLimit from"../../middlewares/rateLimit";

// open channel
router.post("/:recipient_id",
  authenticate(true),
  require("./openChannel")
);

// get channel
router.get("/:channelId",
  authenticate(false),
  channelVerification,
  require("./getChannel")
);

//close channel
router.delete("/:channel_id",
  authenticate(true),
  require("./deleteChannel")
);

// click message button 
//channels/${channelId}/messages/${messageID}/button/${buttonID}
router.post("/:channelId/messages/:messageID/button/:buttonID",
  authenticate(true),
  channelVerification,
  rateLimit({name: 'click_message_button', expire: 60, requestsLimit: 300 }),
  require("../messages/messageButtonClick")
)

// click message button callback (only used by message creator)
//channels/${channelId}/messages/${messageID}/button/${buttonID}
router.patch("/:channelId/messages/:messageID/button/:buttonID",
  authenticate(true),
  channelVerification,
  rateLimit({name: 'click_message_button_callback', expire: 60, requestsLimit: 300 }),
  require("../messages/messageButtonCallback")
)





export default router;
