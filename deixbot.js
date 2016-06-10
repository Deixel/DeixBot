var Discord = require("discord.js");
var config = require("./config");

var client = new Discord.Client();
var botUser;
client.on("message", function(message) {
	if(message.content == "ping") {
		client.reply(message, "pong");
	}
	if(message.content == "!help") {
		var msg = "You need help " + message.author;
		client.sendMessage(message.channel, msg);
	}
	if(message.content.toLowerCase().indexOf("hello") > -1 && message.isMentioned(botUser)) {
		var msg =  "Hello " + message.author;
		client.sendMessage(message.channel, msg);
	}
	if(message.content == "!join") {
		client.joinVoiceChannel(message.author.voiceChannel, function(error, voiceConnection)
		{
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
});

client.on("ready", function() {
	client.setPlayingGame("with your emotions");
	botUser = client.users.get("username", "DeixBot");
	for (var i = 0; i < client.servers.length; i++)
	{
		var server = client.servers[i];
		var msg = "S'up " + server.name + "!";
		client.sendMessage(server.defaultChannel, msg);
	}
});

process.on("SIGINT", function() {
	for (var i = 0; i < client.servers.length; i++)
	{
		var server = client.servers[i];
		client.sendMessage(server.defaultChannel, "Peace out!", function(i){
			if(i + 1 == client.servers.length)
			{
				client.logout();
			}
		});
	}
});


client.loginWithToken(config.discord.key);
