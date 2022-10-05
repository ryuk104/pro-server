import express from "express";
const router = express.Router();

//import './config';
//import './permissions';

//import './propagateDiscussionMetadata';

// Methods
import './createDiscussion';
import getParentRoom from './createDiscussion.js'

import { callbacks } from '../../../../lib/callbacks';
import { Messages, Rooms } from '../../../models/server';
import { deleteRoom } from '../../../lib/server';

/**
 * We need to propagate the writing of new message in a discussion to the linking
 * system message
 */
callbacks.add(
	'afterSaveMessage',
	function (message, { _id, prid } = {}) {
		if (prid) {
			Messages.refreshDiscussionMetadata({ rid: _id }, message);
		}
		return message;
	},
	callbacks.priority.LOW,
	'PropagateDiscussionMetadata',
);

callbacks.add(
	'afterDeleteMessage',
	function (message, { _id, prid } = {}) {
		if (prid) {
			Messages.refreshDiscussionMetadata({ rid: _id }, message);
		}
		if (message.drid) {
			deleteRoom(message.drid);
		}
		return message;
	},
	callbacks.priority.LOW,
	'PropagateDiscussionMetadata',
);

callbacks.add(
	'afterDeleteRoom',
	(rid) => {
		Rooms.find({ prid: rid }, { fields: { _id: 1 } }).forEach(({ _id }) => deleteRoom(_id));
		return rid;
	},
	callbacks.priority.LOW,
	'DeleteDiscussionChain',
);

// TODO discussions define new fields
callbacks.add(
	'afterRoomNameChange',
	(roomConfig) => {
		const { rid, name, oldName } = roomConfig;
		Rooms.update({ prid: rid, ...(oldName && { topic: oldName }) }, { $set: { topic: name } }, { multi: true });
		return roomConfig;
	},
	callbacks.priority.LOW,
	'updateTopicDiscussion',
);

callbacks.add(
	'afterDeleteRoom',
	(drid) => {
		Messages.update(
			{ drid },
			{
				$unset: {
					dcount: 1,
					dlm: 1,
					drid: 1,
				},
			},
		);
		return drid;
	},
	callbacks.priority.LOW,
	'CleanDiscussionMessage',
);

import { Permissions } from '../../models/server/raw';


	// Add permissions for discussion
	const permissions = [
		{ _id: 'start-discussion', roles: ['admin', 'user', 'guest', 'app'] },
		{ _id: 'start-discussion-other-user', roles: ['admin', 'user', 'owner', 'app'] },
	];

	for (const permission of permissions) {
		Permissions.create(permission._id, permission.roles);
	}

	import { callbacks } from '../../../../lib/callbacks';
	import { Subscriptions } from '../../../models/server';
	
	callbacks.add(
		'beforeSaveMessage',
		(message, room) => {
			// abort if room is not a discussion
			if (!room || !room.prid) {
				return message;
			}
	
			// check if user already joined the discussion
			const sub = Subscriptions.findOneByRoomIdAndUserId(room._id, message.u._id, {
				fields: { _id: 1 },
			});
			if (sub) {
				return message;
			}
	
			// if no subcription, call join
			Meteor.runAsUser(message.u._id, () => Meteor.call('joinRoom', room._id));
	
			return message;
		},
		callbacks.priority.MEDIUM,
		'joinDiscussionOnMessage',
	);
	


router.get("/:getparentroom",getParentRoom, require("./createDiscussion"));

export default router;