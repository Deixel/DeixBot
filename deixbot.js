var Discord = require("discord.js");
var config = require("./config");

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
		var cmd = cmdArray[0];

		var params;

		if(cmdArray.length > 1) {
			params = new Array(cmdArray.length-1);
			for(var i = 1; i < cmdArray.length; i++) {
				params[i-1] = cmdArray[i];
			}
		}

		switch(cmd){
			case 'ping':
				client.reply(message, "pong");
				break;
			case 'help':
				client.sendMessage(message.channel, "You need help " + message.author);
				break;
			case 'bh':
				playBennyHill(message);
				client.deleteMessage(message);
				break;
			case 'blame':
				client.sendMessage(message.channel, "I blame Yury");
				break;
			case 'ge':
				var item = message.content.substring(spacePos+1);
				var fixedItem = item.replace(/ /g, "+");
				client.sendMessage(message.channel, "http://services.runescape.com/m=itemdb_rs/results?query=" + fixedItem);
				break;
			case 'config':
				var server = message.server;
				if(message.channel.permissionsOf(message.author).hasPermission("administrator")) {
					config[params[0]] = params[1];
					message.reply("Updated config");
				}
				else {
					message.reply("*sticks fingers in ears* lalala I'm not listening!");
				}
				break;
			case 'botissues':
				client.sendMessage(message.channel, "https://github.com/Deixel/DeixBot/issues");
				break;
			case 'hs':
				var player = message.content.substring(spacePos+1);
				var fixedPlayer = player.replace(/ /g, "_");
				client.sendMessage(message.channel, "http://services.runescape.com/m=hiscore/compare?user1=" + fixedPlayer );
				break;
		}
	}
});

//Hilarity ensues
function playBennyHill(message) {
	var voiceChannel = message.author.voiceChannel;
	if(voiceChannel != null) {
		client.joinVoiceChannel(voiceChannel, function(error, voiceConnection){
			if(error) {
				return console.error(error);
			}
			voiceConnection.playFile(config.bennyHill, function(error, intent) {
				if(error) {
					return console.error(error);
				}
				intent.on("error", function(error) {
					return console.error(error);
				});
				intent.once("end", function() {
					client.leaveVoiceChannel(voiceConnection);
				});
			});
		});
	}
	else {
		client.sendMessage(message.channel, "*starts humming*");
	}
}

//Called once the bot is logged in and ready to use.
client.on("ready", function() {
	client.setPlayingGame(config.playing);
	botUser = client.users.get("username", "DeixBot");
	/*for (var i = 0; i < client.servers.length; i++) {
		var server = client.servers[i];
		var msg = "S'up " + server.name + "!";
		client.sendMessage(server.defaultChannel, msg);
	}*/
});

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
