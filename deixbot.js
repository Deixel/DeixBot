var Discord = require("discord.js");
var config = require("./config");

var client = new Discord.Client();
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
		var cmd = spacePos > -1 ? message.content.substring(1, spacePos) : message.content.substring(1);

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
				var item = message.content.substring(indexOf(" ")+1);
				client.sendMessage(message.channel, "http://services.runescape.com/m=itemdb_rs/results?query=" + item);
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
	for (var i = 0; i < client.servers.length; i++) {
		var server = client.servers[i];
		var msg = "S'up " + server.name + "!";
		client.sendMessage(server.defaultChannel, msg);
	}
});

//Handle a CTRL+C to actually shutdown somewhat cleanly
process.on("SIGINT", function() {
	for (var i = 0; i < client.servers.length; i++){
		var server = client.servers[i];
		client.sendMessage(server.defaultChannel, "Peace out!", function(i){
			if(i + 1 == client.servers.length){
				client.logout();
			}
		});
	}
});

client.loginWithToken(config.discord.key);
