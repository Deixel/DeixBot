const commando = require('discord.js-commando');
const log = require('../../logger.js');

module.exports = class QuoteCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'quote',
			group: 'misc',
			memberName: 'quote', 
			description: 'Quote a message from the same channel',
			args: [
				{
					key: 'quoteMsg',
					type: 'string',
					prompt: 'what do you want to quote?'
				}
			]
		});
	}

	async run(msg, args) {
		log.debug(args.quoteMsg);
		msg.channel.fetchMessage(args.quoteMsg).then( (foundMsg) => {
			const embed = {
				'timestamp': foundMsg.createdAt,
				'description': foundMsg.cleanContent,
				'footer': {
					'icon_url': foundMsg.author.displayAvatarURL,
					'text': foundMsg.author.username
				}
			};
			msg.channel.send({embed});
		}).catch( (err) => {
			log.error(err);
			msg.channel.send('Sorry, something went wrong!');
		});
	}
};
