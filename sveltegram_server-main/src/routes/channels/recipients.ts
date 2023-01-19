import { Request, Response, Router } from "express";
import {
	Channel,
	ChannelRecipientAddEvent,
	ChannelType,
	DiscordApiErrors,
	DmChannelDTO,
	emitEvent,
	PublicUserProjection,
	Recipient,
	User
} from "@fosscord/util";
import { route } from "@fosscord/api";

const router: Router = Router();

router.put("/:user_id", route({}), async (req: Request, res: Response) => {
	const { channel_id, user_id } = req.params;
	const channel = await Channel.findOneOrFail({ where: { id: channel_id }, relations: ["recipients"] });

	if (channel.type !== ChannelType.GROUP_DM) {
		const recipients = [...channel.recipients!.map((r) => r.user_id), user_id].unique();

		const new_channel = await Channel.createDMChannel(recipients, req.user_id);
		return res.status(201).json(new_channel);
	} else {
		if (channel.recipients!.map((r) => r.user_id).includes(user_id)) {
			throw DiscordApiErrors.INVALID_RECIPIENT; //TODO is this the right error?
		}

		channel.recipients!.push(new Recipient({ channel_id: channel_id, user_id: user_id }));
		await channel.save();

		await emitEvent({
			event: "CHANNEL_CREATE",
			data: await DmChannelDTO.from(channel, [user_id]),
			user_id: user_id
		});

		await emitEvent({
			event: "CHANNEL_RECIPIENT_ADD",
			data: {
				channel_id: channel_id,
				user: await User.findOneOrFail({ where: { id: user_id }, select: PublicUserProjection })
			},
			channel_id: channel_id
		} as ChannelRecipientAddEvent);
		return res.sendStatus(204);
	}
});

router.delete("/:user_id", route({}), async (req: Request, res: Response) => {
	const { channel_id, user_id } = req.params;
	const channel = await Channel.findOneOrFail({ where: { id: channel_id }, relations: ["recipients"] });
	if (!(channel.type === ChannelType.GROUP_DM && (channel.owner_id === req.user_id || user_id === req.user_id)))
		throw DiscordApiErrors.MISSING_PERMISSIONS;

	if (!channel.recipients!.map((r) => r.user_id).includes(user_id)) {
		throw DiscordApiErrors.INVALID_RECIPIENT; //TODO is this the right error?
	}

	await Channel.removeRecipientFromChannel(channel, user_id);

	return res.sendStatus(204);
});

export default router;


//remove mods
/*
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { hasPermission } from '../../app/authorization';
import { Users, Subscriptions, Messages } from '../../app/models';
import { settings } from '../../app/settings';
import { api } from '../sdk/api';
import { Team } from '../sdk';

Meteor.methods({
	removeRoomModerator(rid, userId) {
		check(rid, String);
		check(userId, String);

		if (!Meteor.userId()) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', {
				method: 'removeRoomModerator',
			});
		}

		if (!hasPermission(Meteor.userId(), 'set-moderator', rid)) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed', {
				method: 'removeRoomModerator',
			});
		}

		const user = Users.findOneById(userId);

		if (!user || !user.username) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', {
				method: 'removeRoomModerator',
			});
		}

		const subscription = Subscriptions.findOneByRoomIdAndUserId(rid, user._id);

		if (!subscription) {
			throw new Meteor.Error('error-invalid-room', 'Invalid room', {
				method: 'removeRoomModerator',
			});
		}

		if (Array.isArray(subscription.roles) === false || subscription.roles.includes('moderator') === false) {
			throw new Meteor.Error('error-user-not-moderator', 'User is not a moderator', {
				method: 'removeRoomModerator',
			});
		}

		Subscriptions.removeRoleById(subscription._id, 'moderator');

		const fromUser = Users.findOneById(Meteor.userId());

		Messages.createSubscriptionRoleRemovedWithRoomIdAndUser(rid, user, {
			u: {
				_id: fromUser._id,
				username: fromUser.username,
			},
			role: 'moderator',
		});

		const team = Promise.await(Team.getOneByMainRoomId(rid));
		if (team) {
			Promise.await(Team.removeRolesFromMember(team._id, userId, ['moderator']));
		}

		if (settings.get('UI_DisplayRoles')) {
			api.broadcast('user.roleUpdate', {
				type: 'removed',
				_id: 'moderator',
				u: {
					_id: user._id,
					username: user.username,
					name: user.name,
				},
				scope: rid,
			});
		}

		return true;
	},
});






*/


//remove owner

/*
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { hasPermission, getUsersInRole } from '../../app/authorization/server';
import { Users, Subscriptions, Messages } from '../../app/models/server';
import { settings } from '../../app/settings/server';
import { api } from '../sdk/api';
import { Team } from '../sdk';

Meteor.methods({
	async removeRoomOwner(rid, userId) {
		check(rid, String);
		check(userId, String);

		const uid = Meteor.userId();

		if (!uid) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', {
				method: 'removeRoomOwner',
			});
		}

		if (!hasPermission(uid, 'set-owner', rid)) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed', {
				method: 'removeRoomOwner',
			});
		}

		const user = Users.findOneById(userId);
		if (!user || !user.username) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', {
				method: 'removeRoomOwner',
			});
		}

		const subscription = Subscriptions.findOneByRoomIdAndUserId(rid, user._id);

		if (!subscription) {
			throw new Meteor.Error('error-invalid-room', 'Invalid room', {
				method: 'removeRoomOwner',
			});
		}

		if (Array.isArray(subscription.roles) === false || subscription.roles.includes('owner') === false) {
			throw new Meteor.Error('error-user-not-owner', 'User is not an owner', {
				method: 'removeRoomOwner',
			});
		}

		const numOwners = await (await getUsersInRole('owner', rid)).count();

		if (numOwners === 1) {
			throw new Meteor.Error('error-remove-last-owner', 'This is the last owner. Please set a new owner before removing this one.', {
				method: 'removeRoomOwner',
			});
		}

		Subscriptions.removeRoleById(subscription._id, 'owner');

		const fromUser = Users.findOneById(uid);

		Messages.createSubscriptionRoleRemovedWithRoomIdAndUser(rid, user, {
			u: {
				_id: fromUser._id,
				username: fromUser.username,
			},
			role: 'owner',
		});

		const team = await Team.getOneByMainRoomId(rid);
		if (team) {
			await Team.removeRolesFromMember(team._id, userId, ['owner']);
		}

		if (settings.get('UI_DisplayRoles')) {
			api.broadcast('user.roleUpdate', {
				type: 'removed',
				_id: 'owner',
				u: {
					_id: user._id,
					username: user.username,
					name: user.name,
				},
				scope: rid,
			});
		}
		return true;
	},
});


 */


//reove users

/*
import { Meteor } from 'meteor/meteor';
import { Match, check } from 'meteor/check';

import { hasPermission, hasRole, getUsersInRole } from '../../app/authorization/server';
import { removeUserFromRolesAsync } from '../lib/roles/removeUserFromRoles';
import { Users, Subscriptions, Rooms, Messages } from '../../app/models/server';
import { callbacks } from '../../lib/callbacks';
import { Team } from '../sdk';
import { roomCoordinator } from '../lib/rooms/roomCoordinator';
import { RoomMemberActions } from '../../definition/IRoomTypeConfig';

Meteor.methods({
	async removeUserFromRoom(data) {
		check(
			data,
			Match.ObjectIncluding({
				rid: String,
				username: String,
			}),
		);

		const fromId = Meteor.userId();

		if (!fromId) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', {
				method: 'removeUserFromRoom',
			});
		}

		if (!hasPermission(fromId, 'remove-user', data.rid)) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed', {
				method: 'removeUserFromRoom',
			});
		}

		const room = Rooms.findOneById(data.rid);

		if (!room || !roomCoordinator.getRoomDirectives(room.t)?.allowMemberAction(room, RoomMemberActions.REMOVE_USER)) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed', {
				method: 'removeUserFromRoom',
			});
		}

		const removedUser = Users.findOneByUsernameIgnoringCase(data.username);

		const fromUser = Users.findOneById(fromId);

		const subscription = Subscriptions.findOneByRoomIdAndUserId(data.rid, removedUser._id, {
			fields: { _id: 1 },
		});
		if (!subscription) {
			throw new Meteor.Error('error-user-not-in-room', 'User is not in this room', {
				method: 'removeUserFromRoom',
			});
		}

		if (hasRole(removedUser._id, 'owner', room._id)) {
			const numOwners = await (await getUsersInRole('owner', room._id)).count();

			if (numOwners === 1) {
				throw new Meteor.Error('error-you-are-last-owner', 'You are the last owner. Please set new owner before leaving the room.', {
					method: 'removeUserFromRoom',
				});
			}
		}

		callbacks.run('beforeRemoveFromRoom', { removedUser, userWhoRemoved: fromUser }, room);

		Subscriptions.removeByRoomIdAndUserId(data.rid, removedUser._id);

		if (['c', 'p'].includes(room.t) === true) {
			await removeUserFromRolesAsync(removedUser._id, ['moderator', 'owner'], data.rid);
		}

		Messages.createUserRemovedWithRoomIdAndUser(data.rid, removedUser, {
			u: {
				_id: fromUser._id,
				username: fromUser.username,
			},
		});

		if (room.teamId && room.teamMain) {
			// if a user is kicked from the main team room, delete the team membership
			await Team.removeMember(room.teamId, removedUser._id);
		}

		Meteor.defer(function () {
			callbacks.run('afterRemoveFromRoom', { removedUser, userWhoRemoved: fromUser }, room);
		});

		return true;
	},
});


*/