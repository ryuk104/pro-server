

import { Messages } from '../../models/Servers';
//import { settings } from '../settings/server';
//import { canAccessRoomId } from '../../../authorization/server';
import { follow } from './functions';

	function followMessage({ mid }) {
		check(mid, String);

		const uid = userId();
		if (!uid) {
			throw new Error('error-invalid-user', 'Invalid user', { method: 'followMessage' });
		}
/*
		if (mid && !settings.get('Threads_enabled')) {
			throw new Error('error-not-allowed', 'not-allowed', { method: 'followMessage' });
		}
*/
		const message = Messages.findOneById(mid);
		if (!message) {
			throw new Error('error-invalid-message', 'Invalid message', {
				method: 'followMessage',
			});
		}

		/*
		if (!canAccessRoomId(message.rid, uid)) {
			throw new Error('error-not-allowed', 'not-allowed', { method: 'followMessage' });
		}
*/

		const followResult = follow({ tmid: message.tmid || message._id, uid });

		const isFollowed = true;
		//Promise.await(Apps.triggerEvent(AppEvents.IPostMessageFollowed, message, user(), isFollowed));

		return followResult;
	}


	/*
RateLimiter.limitMethod('followMessage', 5, 5000, {
	userId() {
		return true;
	},
});

*/
