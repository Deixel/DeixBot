const commando = require('discord.js-commando');

module.exports = class HsCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'hs',
			group: 'runescape',
			memberName: 'hs',
			aliases: ['highscores', 'rshs', 'rsstats'],
			description: 'Get the stats for a RuneScape player from the highscores',
			args: [
				{
					key: 'player',
					type: 'string',
					prompt: 'who do you want to get the highscores for?'
				}
			]
		});
	}

	async run(msg, args) {
		msg.channel.startTyping();
		const player = args.player.replace(/ /, '_');
		const http = require('http');
		http.get('http://services.runescape.com/m=hiscore/index_lite.ws?player=' + player, (res) => {
			res.setEncoding('utf8');
			var hsRaw = '';
			res.on('data', (d) => hsRaw = hsRaw.concat(d));
			res.on('end', () => {
				if(res.statusCode === 404) {
					msg.channel.stopTyping();
					return msg.channel.send('Unable to find highscores for ' + player);
				}
				let numSkills = 27;
				let skillRaw = hsRaw.split('\n');
				let skillNames = require('../../resources/rs-skill-names');
				let	output = '';
				for(let i = 0; i <= numSkills; i++) {
					var sTemp = skillRaw[i].split(',');
					output = output.concat(skillNames[i] + ': ' + sTemp[2] + ' (' + sTemp[1] + ')\n');
				}
				msg.channel.stopTyping();
				return msg.channel.sendMessage('**' + player + '\'s Skills **\n```Javascript\n' + output + '```');
			});
		});
	}
};
