import { Meteor } from 'meteor/meteor';

import { slashCommands } from '../../utils/lib/slashCommand';
/*
 * Shrug is a named function that will replace /shrug commands
 * @param {Object} message - The message object
 */

slashCommands.add(
	'shrug',
	(_command: 'shrug', params, item): void => {
		const msg = item;
		msg.msg = `${params} ¯\\_(ツ)_/¯`;
		Meteor.call('sendMessage', msg);
	},
	{
		description: 'Slash_Shrug_Description',
		params: 'your_message_optional',
	},
);
