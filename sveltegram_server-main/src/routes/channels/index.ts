import express from "express";
const router = express.Router();

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
const { authenticate } = require("../../middlewares/authenticate");
const channelVerification = require("../../middlewares/ChannelVerification");
const rateLimit = require("../../middlewares/rateLimit");

// open channel
router.post("/:recipient_id",
  authenticate(true),
  require("./openChannel")
);

// get channel
router.get("/:channelId",
  authenticate(true),
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
