var Discord = require("discord.js");
var config = require("./config");

var client = new Discord.Client();
var botUser;


client.on("message", function(message) {
	if(message.content.toLowerCase().indexOf("hello") > -1 && message.isMentioned(botUser)) {
		var msg =  "Hello " + message.author;
		client.sendMessage(message.channel, 'Hello ' + message.author);
	}

	if(message.content.charAt(0) == config.cmdprefix) {
		switch(message.content.substring(1)){
			case 'ping':
				client.reply(message, "pong");
				break;
			case 'help':
				client.sendMessage(message.channel, "You need help " + message.author);
				break;
			case 'bh':
				playBennyHill(message.author.voiceChannel);
				break;
		}
	}
});

//Hilarity ensues
function playBennyHill(voiceChannel) {
	client.joinVoiceChannel(voiceChannel, function(error, voiceConnection){
		if(error) {
			return console.error(error);
		}
		voiceConnection.playFile("sound.mp3", function(error, intent) {
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

//Called once the bot is logged in and ready to use.
client.on("ready", function() {
	client.setPlayingGame("with your emotions");
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
