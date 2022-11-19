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

// open channel
router.post("/:recipient_id",
  //authenticate(false),
  require("./openChannel")
);

// get channel
router.get("/:channelId",
  //authenticate(false),
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



/*
router.get("/", route({ permission: "VIEW_CHANNEL" }), async (req: Request, res: Response) => {
	const { channel_id } = req.params;

	const channel = await Channel.findOneOrFail({ where: { id: channel_id } });

	return res.send(channel);
});

router.delete("/", route({ permission: "MANAGE_CHANNELS" }), async (req: Request, res: Response) => {
	const { channel_id } = req.params;

	const channel = await Channel.findOneOrFail({ where: { id: channel_id }, relations: ["recipients"] });

	if (channel.type === ChannelType.DM) {
		const recipient = await Recipient.findOneOrFail({ where: { channel_id, user_id: req.user_id } });
		recipient.closed = true;
		await Promise.all([
			recipient.save(),
			emitEvent({ event: "CHANNEL_DELETE", data: channel, user_id: req.user_id } as ChannelDeleteEvent)
		]);
	} else if (channel.type === ChannelType.GROUP_DM) {
		await Channel.removeRecipientFromChannel(channel, req.user_id);
	} else {
		await Promise.all([
			Channel.delete({ id: channel_id }),
			emitEvent({ event: "CHANNEL_DELETE", data: channel, channel_id } as ChannelDeleteEvent)
		]);
	}

	res.send(channel);
});

router.patch("/", route({ body: "ChannelModifySchema", permission: "MANAGE_CHANNELS" }), async (req: Request, res: Response) => {
	let payload = req.body as ChannelModifySchema;
	const { channel_id } = req.params;
	if (payload.icon) payload.icon = await handleFile(`/channel-icons/${channel_id}`, payload.icon);

	let channel = await Channel.findOneOrFail({ where: { id: channel_id } });
	channel = OrmUtils.mergeDeep(channel, payload);

	await Promise.all([
		channel.save(),
		emitEvent({
			event: "CHANNEL_UPDATE",
			data: channel,
			channel_id
		} as ChannelUpdateEvent)
	]);

	res.send(channel);
});



*/

export default router;
