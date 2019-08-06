const commando = require('discord.js-commando');
const sqlite = require('sqlite');
const log = require('../../logger.js');

module.exports = class BlameCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'pickgame',
			group: 'misc',
			memberName: 'pickgame', 
			description: 'Can\'t decide on something to play? Let me pick for you.',
			args: [
				{
					key: 'operation',
					type: 'string',
					prompt: 'what do you want to do?',
					default: 'pick',
					validate: (value) => {
						return value === 'add' || value === 'remove' || value === 'pick' || value === 'list';
					}
				},
				{
					key: 'game',
					type: 'string',
					prompt: 'what game to do you want to add/remove?',
					default: ''
				}
			]
		});
	}

	async run(msg, args) {
		sqlite.open('./deixbot.sqlite').then( (db) => {
			if(args.operation === 'pick') {
				msg.channel.startTyping();
				db.get('SELECT gameName FROM pickgame ORDER BY RANDOM() LIMIT 1').then( (game) => {
					msg.channel.stopTyping();
					if(game) {
						//return msg.channel.send('And the winner is: `' + game.gameName + '`!');
						return msg.channel.send('Why are you asking me? You\'re just going to play Overwatch anyway...');
					}
					else {
						return msg.channel.send('Couldn\'t find any games in the list');
					}
				}).catch(log.error);
			}
			else if(args.operation === 'add') {
				msg.channel.startTyping();
				db.run('INSERT INTO pickgame ( gameName ) VALUES ( ? )', args.game).then( () => {
					msg.channel.stopTyping();
					return msg.channel.send(`Added ${args.game} to the list`);
				}).catch( (err) => { 
					msg.stopTyping();
					msg.channel.send('Whoops. Something went wrong. Sorry :frowning:');
					return log.error(err);
				});
			}
			else if(args.operation === 'remove') {
				msg.channel.startTyping();
				db.run('DELETE FROM pickgame WHERE gameId = (SELECT gameId FROM pickgame WHERE gameName = ? LIMIT 1)', args.game).then( () => {
					msg.channel.stopTyping();
					return msg.channel.send(`Removed ${args.game} from the list`);
				}).catch(log.error);
			}
			else if(args.operation === 'list') {
				msg.channel.startTyping();
				db.all('SELECT gameName FROM pickgame').then( (rows) => {
					if(rows.length === 0) {
						msg.channel.stopTyping();
						return msg.channel.send('There are no games in the list right now!');
					}
					else {
						var gameList = rows.map( g => g.gameName ).join(' ');
						msg.channel.stopTyping();
						return msg.channel.send(`**Games to Choose From**\n${gameList}`);
					}
				}).catch(log.error);
			}
		});
	}
};
