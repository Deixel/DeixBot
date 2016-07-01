var Discord = require("discord.js");
var config = require("./config");
var cmds = require("./commands/commands")
var mysql = require('mysql');
var connection = mysql.createConnection({
	host: config.mysql.host,
	user: config.mysql.user,
	password: config.mysql.pass,
	database: config.mysql.db
});

var playingWith = [];


var client = new Discord.Client({autoReconnect: true});
var botUser;


client.on("message", function(message) {
	if(message.content.toLowerCase().indexOf("hello") > -1 && message.isMentioned(botUser)) {
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
		for(var i = 0; i < rows.length; i++){
			playingWith[i] = rows[i].playingString;
		}
		console.log("Loaded " + rows.length + " playing strings from db.");
		updatePlaying();
		setInterval(updatePlaying, 600000);
	});
	botUser = client.users.get("id", config.discord.id);
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

client.loginWithToken(config.discord.key);
