import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { RoomManager, MessageAction } from '../../ui-utils/client';
import { messageArgs } from '../../../client/lib/utils/messageArgs';
import { ChatSubscription } from '../../models/client';
import { handleError } from '../../../client/lib/utils/handleError';
import { roomCoordinator } from '../../../client/lib/rooms/roomCoordinator';

Meteor.startup(() => {
	MessageAction.addButton({
		id: 'mark-message-as-unread',
		icon: 'flag',
		label: 'Mark_unread',
		context: ['message', 'message-mobile', 'threads'],
		action(_, props) {
			const { message = messageArgs(this).msg } = props;
			return Meteor.call('unreadMessages', message, function (error: any) {
				if (error) {
					return handleError(error);
				}
				const subscription = ChatSubscription.findOne({
					rid: message.rid,
				});
				if (subscription == null) {
					return;
				}
				RoomManager.close(subscription.t + subscription.name);
				return FlowRouter.go('home');
			});
		},
		condition({ message, user, room }) {
			const isLivechatRoom = roomCoordinator.isLivechatRoom(room.t);
			if (isLivechatRoom) {
				return false;
			}
			return message.u._id !== user._id;
		},
		order: 10,
		group: 'menu',
	});
});
