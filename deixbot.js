const Commando = require('discord.js-commando');
const sqlite = require('sqlite');
const log = require(__dirname + '/logger.js');
const config =  require('./config');
const appConfig = config.appConfig;
const path = require('path');

var serverConfig = config.serverConfig;
var getServerConfig = config.getServerConfig;
var db;

const responses = [ 
	{
		check: (msg) => {
			return msg.cleanContent.toLowerCase().includes('hello') && msg.isMentioned(msg.client.user);
		},
		action: (msg) => {
			return msg.channel.sendMessage('Sal-u-tations ' + msg.author + '!');
		}
	},
	{
		check: (msg) => {
			return /(how are you|how are you doing|how's it going|are you ok|are you well)/gi.test(msg.cleanContent) && msg.isMentioned(msg.client.user);
		},
		action: (msg) => {
			var replies = ['I am good. Thanks for asking!', 'I am functioning within normal parameters', 'I am Combat Ready:tm:!'];
			return msg.channel.sendMessage(replies[parseInt(Math.random() * replies.length)]);
		}
	}
];

const client = new Commando.Client({
	owner: appConfig.ownerid,
	commandPrefix: '!',
	unknownCommandResponse: false
});

client.registry
	.registerGroups([
		['interests', 'Interests'],
		['runescape', 'RuneScape'],
		['internet', 'Internet'],
		['games', 'Games'],
		['misc', 'Misc']
	])
	.registerDefaults()
	.registerCommandsIn(path.join(__dirname, 'commands'));

client.setProvider(sqlite.open(path.join(__dirname, 'settings.sqlite3')).then(sdb => new Commando.SQLiteProvider(sdb))).catch(log.error);

client.on('ready', () => {
	log.info('Client is ready');
	updatePlaying();
	setInterval(updatePlaying, 600000);
});

sqlite.open(path.join(__dirname,'deixbot.sqlite')).then( (rdb) => {
	log.info('Successfully opened database');
	db = rdb;
	client.login(appConfig.apikey).then(() => {
			log.info('Logged in with token');
	});
}).catch(log.error);

function updatePlaying() {
	db.get('SELECT playingString from playing ORDER BY RANDOM() LIMIT 1').then((game) => { 
		client.user.setGame(game.playingString);
	}).catch(log.error);
}

client.on('message', (msg) => {
	responses.forEach( (e) => {
			if(e.check(msg)) return e.action(msg)
	});
});

process.on('SIGINT', () => {
//	db.close();
	client.destroy();
});
