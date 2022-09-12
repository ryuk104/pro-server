import type Icons from '@rocket.chat/icons';
import type { MessageSurfaceLayout } from '@rocket.chat/ui-kit';
import type { parser } from '@rocket.chat/message-parser';

import type { IRocketChatRecord } from '../IRocketChatRecord';
import type { IUser } from '../IUser';
import type { IRoom, RoomID } from '../IRoom';
import type { MessageAttachment } from '../models/MessageAttachment/MessageAttachment';
import type { FileProp } from '../models/MessageAttachment/Files/FileProp';
import type { ILivechatVisitor } from '../ILivechatVisitor';

type MentionType = 'user' | 'team';

type MessageUrl = {
	url: string;
	source?: string;
	meta: Record<string, string>;
	headers?: { contentLength: string; contentType: string };
};

type VoipMessageTypesValues =
	| 'voip-call-started'
	| 'voip-call-declined'
	| 'voip-call-on-hold'
	| 'voip-call-unhold'
	| 'voip-call-ended'
	| 'voip-call-duration'
	| 'voip-call-wrapup'
	| 'voip-call-ended-unexpectedly';

type TeamMessageTypes =
	| 'removed-user-from-team'
	| 'added-user-to-team'
	| 'ult'
	| 'user-converted-to-team'
	| 'user-converted-to-channel'
	| 'user-removed-room-from-team'
	| 'user-deleted-room-from-team'
	| 'user-added-room-to-team'
	| 'ujt';

type LivechatMessageTypes =
	| 'livechat_navigation_history'
	| 'livechat_transfer_history'
	| 'livechat_transcript_history'
	| 'livechat_video_call'
	| 'livechat_webrtc_video_call';

type OmnichannelTypesValues =
	| 'livechat_transfer_history_fallback'
	| 'livechat-close'
	| 'omnichannel_placed_chat_on_hold'
	| 'omnichannel_on_hold_chat_resumed';

type OtrSystemMessages = 'user_joined_otr' | 'user_requested_otr_key_refresh' | 'user_key_refreshed_successfully';

export type MessageTypesValues =
	| 'e2e'
	| 'uj'
	| 'ul'
	| 'ru'
	| 'au'
	| 'mute_unmute'
	| 'r'
	| 'ut'
	| 'wm'
	| 'rm'
	| 'subscription-role-added'
	| 'subscription-role-removed'
	| 'room-archived'
	| 'room-unarchived'
	| 'room_changed_privacy'
	| 'room_changed_description'
	| 'room_changed_announcement'
	| 'room_changed_avatar'
	| 'room_changed_topic'
	| 'room_e2e_enabled'
	| 'room_e2e_disabled'
	| 'user-muted'
	| 'user-unmuted'
	| 'room-removed-read-only'
	| 'room-set-read-only'
	| 'room-allowed-reacting'
	| 'room-disallowed-reacting'
	| LivechatMessageTypes
	| TeamMessageTypes
	| VoipMessageTypesValues
	| OmnichannelTypesValues
	| OtrSystemMessages;

export type TokenType = 'code' | 'inlinecode' | 'bold' | 'italic' | 'strike' | 'link';
export type Token = {
	token: string;
	text: string;
	type?: TokenType;
	noHtml?: string;
} & TokenExtra;

export type TokenExtra = {
	highlight?: boolean;
	noHtml?: string;
};

export interface IMessage extends IRocketChatRecord {
	rid: RoomID;
	msg: string;
	tmid?: string;
	ts: Date;
	mentions?: ({
		type: MentionType;
	} & Pick<IUser, '_id' | 'username' | 'name'>)[];

	groupable?: false;
	channels?: Pick<IRoom, '_id' | 'name'>[];
	u: Required<Pick<IUser, '_id' | 'username' | 'name'>>;
	blocks?: MessageSurfaceLayout;
	alias?: string;
	md?: ReturnType<typeof parser>;

	// TODO: chapter day frontend - wrong type
	ignored?: boolean;
	_hidden?: boolean;
	imported?: boolean;
	replies?: IUser['_id'][];
	location?: {
		type: 'Point';
		coordinates: [string, string];
	};
	starred?: { _id: IUser['_id'] }[];
	pinned?: boolean;
	unread?: boolean;
	temp?: boolean;
	drid?: RoomID;
	tlm?: Date;

	dcount?: number;
	tcount?: number;
	t?: MessageTypesValues;
	e2e?: 'pending' | 'done';

	urls?: MessageUrl[];

	/** @deprecated Deprecated */
	actionLinks?: {
		icon: keyof typeof Icons;
		i18nLabel: unknown;
		label: string;
		method_id: string;
		params: string;
	}[];

	/** @deprecated Deprecated in favor of files */
	file?: FileProp;
	files?: FileProp[];
	attachments?: MessageAttachment[];

	reactions?: {
		[key: string]: { names?: (string | undefined)[]; usernames: string[] };
	};

	private?: boolean;
	/* @deprecated */
	bot?: boolean;
	sentByEmail?: boolean;
	webRtcCallEndTs?: Date;
	role?: string;

	avatar?: string;
	emoji?: string;

	// Tokenization fields
	tokens?: Token[];
	html?: string;
}

export type MessageSystem = {
	t: 'system';
};

export interface IEditedMessage extends IMessage {
	editedAt: Date;
	editedBy: Pick<IUser, '_id' | 'username'>;
}

export const isEditedMessage = (message: IMessage): message is IEditedMessage => 'editedAt' in message && 'editedBy' in message;

export interface ITranslatedMessage extends IMessage {
	translations: { [key: string]: string } & { original?: string };
	autoTranslateShowInverse?: boolean;
	autoTranslateFetching?: boolean;
}

export const isTranslatedMessage = (message: IMessage): message is ITranslatedMessage => 'translations' in message;

export interface IThreadMainMessage extends IMessage {
	tcount: number;
	tlm: Date;
	replies: IUser['_id'][];
}
export interface IThreadMessage extends IMessage {
	tmid: string;
}

export const isThreadMainMessage = (message: IMessage): message is IThreadMainMessage => 'tcount' in message && 'tlm' in message;

export const isThreadMessage = (message: IMessage): message is IThreadMessage => !!message.tmid;

export interface IDiscussionMessage extends IMessage {
	drid: string;
	dlm?: Date;
	dcount: number;
}

export const isDiscussionMessage = (message: IMessage): message is IDiscussionMessage => !!message.drid;

export interface IPrivateMessage extends IMessage {
	private: true;
}

export const isPrivateMessage = (message: IMessage): message is IPrivateMessage => !!message.private;

export interface IMessageReactionsNormalized extends IMessage {
	reactions: {
		[key: string]: {
			usernames: Required<IUser['_id']>[];
			names: Required<IUser>['name'][];
		};
	};
}

export const isMessageReactionsNormalized = (message: IMessage): message is IMessageReactionsNormalized =>
	Boolean('reactions' in message && message.reactions && message.reactions[0] && 'names' in message.reactions[0]);

export interface IOmnichannelSystemMessage extends IMessage {
	navigation?: {
		page: {
			title: string;
			location: {
				href: string;
			};
			token?: string;
		};
	};
	transferData?: {
		comment: string;
		transferredBy: {
			name?: string;
			username: string;
		};
		transferredTo: {
			name?: string;
			username: string;
		};
		nextDepartment?: {
			_id: string;
			name?: string;
		};
		scope: 'department' | 'agent' | 'queue';
	};
	requestData?: {
		type: 'visitor' | 'user';
		visitor?: ILivechatVisitor;
		user?: IUser;
	};
	webRtcCallEndTs?: Date;
	comment?: string;
}

export type IVoipMessage = IMessage & {
	voipData: {
		callDuration?: number;
		callStarted?: string;
		callWaitingTime?: string;
	};
};
export interface IMessageDiscussion extends IMessage {
	drid: RoomID;
}

export const isMessageDiscussion = (message: IMessage): message is IMessageDiscussion => {
	return 'drid' in message;
};

export type IMessageEdited = IMessage & {
	editedAt: Date;
	editedBy: Pick<IUser, '_id' | 'username'>;
};

export const isMessageEdited = (message: IMessage): message is IMessageEdited => {
	return 'editedAt' in message && 'editedBy' in message;
};

export type IMessageInbox = IMessage & {
	// email inbox fields
	email?: {
		references?: string[];
		messageId?: string;
	};
};

export const isIMessageInbox = (message: IMessage): message is IMessageInbox => 'email' in message;
export const isVoipMessage = (message: IMessage): message is IVoipMessage => 'voipData' in message;
