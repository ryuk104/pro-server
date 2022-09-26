
import { Messages, Rooms } from '../../../models/server';
import { canAccessRoom } from '../../../authorization/server';
import { settings } from '../../../settings/server';

const MAX_LIMIT = 100;


	function getThreadsList({ rid, limit = 50, skip = 0 }) {
		if (limit > MAX_LIMIT) {
			throw new Error('error-not-allowed', `max limit: ${MAX_LIMIT}`, {
				method: 'getThreadsList',
			});
		}

		if (!userId() || !settings.get('Threads_enabled')) {
			throw new Error('error-not-allowed', 'Threads Disabled', { method: 'getThreadsList' });
		}

		const user = user();
		const room = Rooms.findOneById(rid);

		if (!canAccessRoom(room, user)) {
			throw new Error('error-not-allowed', 'Not Allowed', { method: 'getThreadsList' });
		}

		return Messages.findThreadsByRoomId(rid, skip, limit).fetch();
	}
