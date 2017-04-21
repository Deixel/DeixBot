const commando = require('discord.js-commando');
const log = ('../../logger.js');

module.exports = class ImgCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'img',
			group: 'internet',
			memberName: 'img',
			description: 'Search for an image on Google',
			args: [ {key: 'search', type: 'string', prompt: 'what do you want to search for?'}]
		});
	}

	async run(msg, args){
		const searchFor = args.search.replace(/ /, '+');
		if(parseInt(Math.random() * 10) == 0) {
			msg.say('Dude, find your own porn');
		}
		else {
			msg.say('Searching...').then( (reply) => {
				const request = require('request');
				const appConfig = require('../../config').appConfig;
				request('https://www.googleapis.com/customsearch/v1?key=' + appConfig.googleapi + '&cx=' + appConfig.searchid + '&q=' + searchFor + '&searchType=image&alt=json&num=10&start=1', (err, res, body) => {
					let data;
					try {
						data = JSON.parse(body);
					}
					catch(error) {
						log.error(error);
					}
					if(!data) {
						return reply.edit('Error');
					}
					else if(!data.items || data.items.length == 0) {
						return reply.edit('No results found');
					}
					else {
						let result = data.items[parseInt(Math.random() * 10)];
						reply.edit(result.link);
					}
				});
			});
		}
	}
};
