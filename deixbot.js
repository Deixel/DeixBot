const Commando = require('discord.js-commando');
const mysql = require('mysql');
const sqlite = require('sqlite');
const log = require(__dirname + '/logger.js');
const config =  require('./config');
const appConfig = config.appConfig;
const path = require('path');

var connection;
var serverConfig = config.serverConfig;
var getServerConfig = config.getServerConfig;

const client = new Commando.Client({
	owner: appConfig.ownerid,
	commandPrefix: '!',
	unknownCommandResponse: false
});

client.registry
	.registerGroups([
		['runescape', 'RuneScape'],
		['internet', 'Internet'],
		['games', 'Games'],
		['misc', 'Misc']
	])
	.registerDefaults()
	.registerCommandsIn(path.join(__dirname, 'commands'));

client.setProvider(sqlite.open(path.join(__dirname, 'settings.sqlite3')).then(db => new Commando.SQLiteProvider(db))).catch(log.error);

client.on("ready", () => {
log.info("Client is ready");
updatePlaying();
setInterval(updatePlaying, 600000);
});

//client.on('debug', (info) => log.debug(info));

client.login(appConfig.apikey)
	.then(() => log.info("Logged in with token")
);

function updatePlaying() {
	/*
		connection.query("SELECT palyingString from playing ORDER BY RAND() LIMIT 1", (err, rows)
		client.user.setGame(rows[0].playingString);
	*/
}


process.on("SIGINT", () => {
		client.destroy().then(process.exit(0))
});
