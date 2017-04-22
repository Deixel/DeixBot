const Commando = require('discord.js-commando');
const sqlite = require('sqlite');
const log = require(__dirname + '/logger.js');
const config =  require('./config');
const appConfig = config.appConfig;
const path = require('path');

//var serverConfig = config.serverConfig;
//var getServerConfig = config.getServerConfig;
var db;

var responses = require('./resources/responses.js'); 

var reloadResponses = {
	check: (msg) => {
		return msg.author.id === appConfig.ownerid && /(!reboot responses|!reboot chat|reboot speech)/.test(msg.cleanContent); 
	},
	action: (msg) => {
		msg.channel.sendMessage('Rebooting speech module...').then( () => {
			delete require.cache[require.resolve('./resources/responses.js')];
			responses = [];
			responses = require('./resources/responses.js');
			responses.push(reloadResponses);
			return msg.channel.sendMessage('Speech module back online! Sal-u-tations!');
		});
	}
};

responses.push(reloadResponses);

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
	if(msg.author.id !== client.user.id) {
		responses.forEach( (e) => {
			if(e.check(msg)) return e.action(msg);
		});
	}
});

process.on('SIGINT', () => {
	client.destroy();
	db.close().then(process.exit(0));
});
