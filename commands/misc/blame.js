const commando = require('discord.js-commando');

module.exports = class BlameCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'blame',
			group: 'misc',
			memberName: 'blame', 
			description: 'Assigns blame appropriately',
			args: [
				{
					key: 'blame',
					type: 'string',
					default: 'Yury',
					prompt: 'who is to blame?'
				}
			]
		});
	}

	async run(msg, args) {
		msg.channel.sendMessage('I blame ' + args.blame);
		msg.delete();
	}
};
