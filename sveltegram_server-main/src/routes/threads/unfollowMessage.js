

import { Messages } from '../../models/Servers';
//import { RateLimiter } from '../../../lib/server';
//import { settings } from '../../../settings/server';
//import { canAccessRoomId } from '../../../authorization/server';
import { unfollow } from './functions';

	function unfollowMessage({ mid }) {
		check(mid, String);

		const uid = userId();
		if (!uid) {
			throw new Error('error-invalid-user', 'Invalid user', { method: 'unfollowMessage' });
		}

		/*
		if (mid && !settings.get('Threads_enabled')) {
			throw new Error('error-not-allowed', 'not-allowed', { method: 'unfollowMessage' });
		}
*/
		const message = Messages.findOneById(mid);
		if (!message) {
			throw new Error('error-invalid-message', 'Invalid message', {
				method: 'unfollowMessage',
			});
		}

		/*
		if (!canAccessRoomId(message.rid, uid)) {
			throw new Error('error-not-allowed', 'not-allowed', { method: 'unfollowMessage' });
		}
*/

		const unfollowResult = unfollow({ rid: message.rid, tmid: message.tmid || message._id, uid });

		const isFollowed = false;
		Promise.await(Apps.triggerEvent(AppEvents.IPostMessageFollowed, message, user(), isFollowed));

		return unfollowResult;
	}

/*
RateLimiter.limitMethod('unfollowMessage', 5, 5000, {
	userId() {
		return true;
	},
});
*/
