const commando = require('discord.js-commando');

module.exports = class BlameCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'blame',
			group: 'misc',
			memberName: 'blame', 
			description: 'Assigns blame appropriately' 
		});
	}

	async run(msg, args) {
		var responsible = args.length > 0 ? args : 'Yury';
		msg.channel.sendMessage('I blame ' + responsible);
		msg.delete();
	}
};
