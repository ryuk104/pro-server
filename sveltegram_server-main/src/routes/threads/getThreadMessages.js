

import { Messages, Rooms } from '../../../models/server';
import { canAccessRoom } from '../../../authorization/server';
import { settings } from '../../../settings/server';
import { readThread } from '../functions';

const MAX_LIMIT = 100;

	function getThreadMessages({ tmid, limit, skip }) {
		if (limit > MAX_LIMIT) {
			throw new Error('error-not-allowed', `max limit: ${MAX_LIMIT}`, {
				method: 'getThreadMessages',
			});
		}

		if (!userId() || !settings.get('Threads_enabled')) {
			throw new Error('error-not-allowed', 'Threads Disabled', {
				method: 'getThreadMessages',
			});
		}

		const thread = Messages.findOneById(tmid);
		if (!thread) {
			return [];
		}

		const user = user();
		const room = Rooms.findOneById(thread.rid);

		if (!canAccessRoom(room, user)) {
			throw new Error('error-not-allowed', 'Not allowed', { method: 'getThreadMessages' });
		}

		readThread({ userId: user._id, rid: thread.rid, tmid });

		const result = Messages.findVisibleThreadByThreadId(tmid, {
			...(skip && { skip }),
			...(limit && { limit }),
			sort: { ts: -1 },
		}).fetch();

		return [thread, ...result];
	}
