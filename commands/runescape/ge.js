const commando = require('discord.js-commando');

module.exports = class GeCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'ge',
			group: 'runescape',
			memberName: 'ge',
			aliases: ['grandexchange'],
			description: 'Search the RuneScape Grand Exchange for an item',
			args: [
				{
					key: 'item',
					type: 'string',
					prompt: 'what item do you want to search for?'
				}

			]
		});
	}

	async run(msg, args) {
		const item = args.item.replace(/ /, '+');
		return msg.channel.sendMessage(`http://services.runescape.com/m=itemdb_rs/results?query=${item}`);
	}
};
