var Discord = require("discord.js");
var config = require("./config");
var cmds = require("./commands/commands")

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
	updatePlaying();
	setInterval(updatePlaying, 600000);
	botUser = client.users.get("username", "DeixBot");
	cmds.setUp(client, config);
	/*for (var i = 0; i < client.servers.length; i++) {
		var server = client.servers[i];
		var msg = "S'up " + server.name + "!";
		client.sendMessage(server.defaultChannel, msg);
	}*/
});

function updatePlaying() {
	var rand = Math.floor(Math.random() * config.playing.length);
	client.setPlayingGame(config.playing[rand]);
}

//Handle a CTRL+C to actually shutdown somewhat cleanly
process.on("SIGINT", function() {
	client.logout();
	/*for (var i = 0; i < client.servers.length; i++){
		var server = client.servers[i];
		client.sendMessage(server.defaultChannel, "Peace out!", function(i){
			if(i + 1 == client.servers.length){
				client.logout();
			}
		});
	}*/
});

client.loginWithToken(config.discord.key);
