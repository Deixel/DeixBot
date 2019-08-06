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
		['soundboard', 'Soundboard'],
		['runescape', 'RuneScape'],
		['internet', 'Internet'],
		['games', 'Games'],
		['misc', 'Misc']
	])
	.registerDefaults()
	.registerCommandsIn(path.join(__dirname, 'commands'));

client.setProvider(sqlite.open(path.join(__dirname, 'settings.sqlite3')).then(sdb => new Commando.SQLiteProvider(sdb))).catch(log.error);

client.once('ready', () => {
	log.info('Client is ready');
	log.info('Logged in as ' + client.user.username + '#' + client.user.discriminator);
	log.info('Client has cached ' + client.channels.size + ' channels across ' + client.guilds.size + ' guilds');
	updatePlaying();
	setInterval(updatePlaying, 600000);
});

sqlite.open(path.join(__dirname,'deixbot.sqlite')).then( (rdb) => {
	log.info('Successfully opened database');
	db = rdb;
	client.login(appConfig.apikey).then(() => {
		log.info('Logged in with token');
	}).catch( () => {
		log.error('Failed to login');
		process.exit(1);
	});
}).catch(log.error);

function updatePlaying() {
	db.get('SELECT playingString from playing ORDER BY RANDOM() LIMIT 1').then((game) => {
		client.user.setActivity(game.playingString, {type: 'PLAYING'});
	}).catch(log.error);
}

client.on('message', (msg) => {
	log.debug(msg.author.username + ' in #' + msg.channel.name + ': ' + msg.cleanContent);
	if(msg.author.id !== client.user.id) {
		responses.forEach( (e) => {
			if(e.check(msg)) return e.action(msg);
		});
	}
});

client.on('messageDeleted', (msg) => {
	log.debug(msg.author.username + ' deleted from #' + msg.channel.name + ': ' + msg.cleanContent);
});


client.on('guildMemberAdd', (member) => {
	if(member.guild.id === '344447107874291715') {
		member.send('Sal-u-tations, ' + member.user.username + '! Welcome to ' + member.guild.name + '!\n\n Be sure to check out the rules and installation instructions in <#344447108301979658>.\n I also have a number of useful abilities. Just say `!help` at any time to see those!\n\n If you have any questions, just ask <@113310775887536128>.');
	}
});

process.on('SIGINT', () => {
	client.destroy();
	process.exit(0);
//	db.close().then(process.exit(0));
});

process.on('unhandledRejection', (reason, promise) => {
	log.error('Unhandled Promise Rejection at Promise ' + promise + ' Reason: ' + reason);
});

client.on('disconnect', (event) => {
	log.error('Client has disconnected: ' + event.reason + '(' + event.code + ')');
	process.exit(1);
});
