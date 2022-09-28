import express from "express";
const router = express.Router();

import { hasAtLeastOnePermission, canSendMessage } from '../../../authorization/server';
import { Messages, Rooms } from '../../../models/server';
import { createRoom, addUserToRoom, sendMessage, attachMessage } from '../../../lib/server';
import { settings } from '../../../settings/server';
import { callbacks } from '../../../../lib/callbacks';
import { roomCoordinator } from '../../../../server/lib/rooms/roomCoordinator';

module.exports = async (req, res, next) => {


	function createDiscussion({ prid, pmid, t_name, reply, users, encrypted }) {
		if (!settings.get('Discussion_enabled')) {
			throw new Error('error-action-not-allowed', 'You are not allowed to create a discussion', { method: 'createDiscussion' });
		}

		const uid = userId();
		if (!uid) {
			throw new Error('error-invalid-user', 'Invalid user', {
				method: 'DiscussionCreation',
			});
		}

		if (!hasAtLeastOnePermission(uid, ['start-discussion', 'start-discussion-other-user'])) {
			throw new Error('error-action-not-allowed', 'You are not allowed to create a discussion', { method: 'createDiscussion' });
		}

		return create({ uid, prid, pmid, t_name, reply, users, user: user(), encrypted });
	}
	
const getParentRoom = (rid) => {
	const room = Rooms.findOne(rid);
	return room && (room.prid ? Rooms.findOne(room.prid, { fields: { _id: 1 } }) : room);
};

const createDiscussionMessage = (rid, user, drid, msg, message_embedded) => {
	const welcomeMessage = {
		msg,
		rid,
		drid,
		attachments: [message_embedded].filter((e) => e),
	};
	return Messages.createWithTypeRoomIdMessageAndUser('discussion-created', rid, '', user, welcomeMessage);
};

const mentionMessage = (rid, { _id, username, name }, message_embedded) => {
	const welcomeMessage = {
		rid,
		u: { _id, username, name },
		ts: new Date(),
		_updatedAt: new Date(),
		attachments: [message_embedded].filter((e) => e),
	};

	return Messages.insert(welcomeMessage);
};

const create = ({ prid, pmid, t_name, reply, users, user, encrypted }) => {
	// if you set both, prid and pmid, and the rooms dont match... should throw an error)
	let message = false;
	if (pmid) {
		message = Messages.findOne({ _id: pmid });
		if (!message) {
			throw new Error('error-invalid-message', 'Invalid message', {
				method: 'DiscussionCreation',
			});
		}
		if (prid) {
			if (prid !== getParentRoom(message.rid)._id) {
				throw new Error('error-invalid-arguments', { method: 'DiscussionCreation' });
			}
		} else {
			prid = message.rid;
		}
	}

	if (!prid) {
		throw new Error('error-invalid-arguments', { method: 'DiscussionCreation' });
	}

	let p_room;
	try {
		p_room = canSendMessage(prid, { uid: user._id, username: user.username, type: user.type });
	} catch (error) {
		throw new Error(error.message);
	}

	if (p_room.prid) {
		throw new Error('error-nested-discussion', 'Cannot create nested discussions', {
			method: 'DiscussionCreation',
		});
	}

	if (!Match.Maybe(encrypted, Boolean)) {
		throw new Error('error-invalid-arguments', 'Invalid encryption state', {
			method: 'DiscussionCreation',
		});
	}

	if (typeof encrypted !== 'boolean') {
		encrypted = p_room.encrypted;
	}

	if (encrypted && reply) {
		throw new Error('error-invalid-arguments', 'Encrypted discussions must not receive an initial reply.', {
			method: 'DiscussionCreation',
		});
	}

	if (pmid) {
		const discussionAlreadyExists = Rooms.findOne(
			{
				prid,
				pmid,
			},
			{
				fields: { _id: 1 },
			},
		);
		if (discussionAlreadyExists) {
			// do not allow multiple discussions to the same message'\
			addUserToRoom(discussionAlreadyExists._id, user);
			return discussionAlreadyExists;
		}
	}

	const name = Random.id();

	// auto invite the replied message owner
	const invitedUsers = message ? [message.u.username, ...users] : users;

	const type = roomCoordinator.getRoomDirectives(p_room.t)?.getDiscussionType();
	const description = p_room.encrypted ? '' : message.msg;
	const topic = p_room.name;

	const discussion = createRoom(
		type,
		name,
		user.username,
		[...new Set(invitedUsers)],
		false,
		{
			fname: t_name,
			description, // TODO discussions remove
			topic, // TODO discussions remove
			prid,
			encrypted,
		},
		{
			// overrides name validation to allow anything, because discussion's name is randomly generated
			nameValidationRegex: /.*/,
		},
	);

	let discussionMsg;
	if (pmid) {
		if (p_room.encrypted) {
			message.msg = TAPi18n.__('Encrypted_message');
		}
		mentionMessage(discussion._id, user, attachMessage(message, p_room));

		discussionMsg = createDiscussionMessage(message.rid, user, discussion._id, t_name, attachMessage(message, p_room));
	} else {
		discussionMsg = createDiscussionMessage(prid, user, discussion._id, t_name);
	}

	callbacks.runAsync('afterSaveMessage', discussionMsg, p_room);

	if (reply) {
		sendMessage(user, { msg: reply }, discussion);
	}
	return discussion;
};
}

	
	 // Create discussion by room or message
	  const prid = {string}  //- Parent Room Id - The room id, optional if you send pmid.
	  const pmid = {string}  //- Parent Message Id - Create the discussion by a message, optional.
	  const reply{string}  //- The reply, optional
	  const t_name{string}  //- discussion name
	  const users{string[]}  //- users to be added
	  const encrypted {boolean}  //- if the discussion's e2e encryption should be enabled.
