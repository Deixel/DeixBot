var Discord = require("discord.js");
var configFile = require("./config");
var cmds = require("./commands/commands")
var mysql = require('mysql');
var connection = mysql.createConnection({
	host: configFile.mysql.host,
	user: configFile.mysql.user,
	password: configFile.mysql.pass,
	database: configFile.mysql.db
});

var config = {};

var playingWith = [];


var client = new Discord.Client({autoReconnect: true});


client.on("message", function(message) {
	if(message.content.toLowerCase().indexOf("hello") > -1 && message.isMentioned(client.user)) {
		return client.sendMessage(message.channel, 'Hello ' + message.author);
	}
	else if(message.content.toLowerCase().indexOf("who gta") > -1) {
		return message.reply("oooh oooh me! I'll play!")
	}

	else if(message.content.charAt(0) == config.cmdprefix) {
		var spacePos = message.content.indexOf(" ");
		//var cmd = spacePos > -1 ? message.content.substring(1, spacePos) : message.content.substring(1);

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
	connection.connect();
	console.log("Established connection to database.")
	connection.query('SELECT playingString FROM playing', function(err, rows, fields) {
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

	connection.query("SELECT configName, configValue FROM configs ORDER BY configID ASC", function(err, rows, fields) {
		if(err) {
			console.error(err);
		}
		for(var i = ;i < rows.length; i++) {
			config[rows[i].configName] = rows[i].configValue;
			console.log("Set '"+ rows[i].configName + "' to '" + rows[i].configValue + "'.");
		}
	});
	cmds.setUp(client, config);
});

function updatePlaying() {
	var rand = Math.floor(Math.random() * playingWith.length);
	client.setPlayingGame(playingWith[rand]);
}

//Handle a CTRL+C to actually shutdown somewhat cleanly
process.on("SIGINT", function() {
	client.logout(function() {
		if(error) {
			console.error(error);
		}
		process.exit(0);
	});
});

client.loginWithToken(configFile.apikey);
