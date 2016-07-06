var Discord = require("discord.js");
var config = require("./config");
var cmds = require("./commands/commands");
var mysql = require("mysql");
var db_config = {
	host: config.mysql.host,
	user: config.mysql.user,
	password: config.mysql.pass,
	database: config.mysql.db
};
var connection;

function db_connect() {
	connection = mysql.createConnection(db_config);
	connection.connect(function(err) {
		if(err) {
			console.error(err);
			setTimeout(db_connect, 2000);
		}
	});
	connection.on("error", function(err) {
		console.error(err);
		if(err.code === "PROTOCOL_CONNECTION_LOST") {
			db_connect();
		}
		else {
			throw err;
		}
	});
}

var playingWith = [];

var client = new Discord.Client({autoReconnect: true});

client.on("message", function(message) {
	if(message.content.toLowerCase().indexOf("hello") > -1 && message.isMentioned(client.user)) {
		return client.sendMessage(message.channel, "Hello " + message.author);
	}
	else if(message.content.toLowerCase().indexOf("who gta") > -1) {
		return message.reply("oooh oooh me! I'll play!");
	}

	else if(message.content.charAt(0) == config.cmdprefix) {

		var cmdArray = message.content.substring(1).split(" ");
		var cmdStr = cmdArray[0];

		var cmd = cmds.get(cmdStr);

		if(cmd != null) {
			cmd.action(message);
		}

	}
});

//Called once the bot is logged in and ready to use.
client.on("ready", function() {
	db_connect();
	console.log("Established connection to database.");
	connection.query("SELECT playingString FROM playing", function(err, rows) {
		if(err) {
			console.error(err);
		}
		for(var i = 0; i < rows.length; i++) {
			playingWith[i] = rows[i].playingString;
		}
		console.log("Loaded " + rows.length + " playing strings from db.");
		updatePlaying();
		setInterval(updatePlaying, 600000);
	});

	connection.query("SELECT configName, configValue FROM configs ORDER BY configID ASC", function(err, rows) {
		if(err) {
			console.error(err);
		}
		for(var i = 0;i < rows.length; i++) {
			config[rows[i].configName] = rows[i].configValue;
			console.log("Set '"+ rows[i].configName + "' to '" + rows[i].configValue + "'.");
		}
	});
	cmds.setUp(client, config, connection);
});

function updatePlaying() {
	var rand = Math.floor(Math.random() * playingWith.length);
	client.setPlayingGame(playingWith[rand]);
}

//Handle a CTRL+C to actually shutdown somewhat cleanly
process.on("SIGINT", function() {
	client.logout(function(error) {
		if(error) {
			console.error(error);
		}
		process.exit(0);
	});
});

client.loginWithToken(config.apikey, function(err){
	if(err) {
		console.error(err);
	}
});
