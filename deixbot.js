var Discord = require("discord.js");
var config = require("./config");

var mybot = new Discord.Client();
var myUser;
mybot.on("message", function(message) {
	if(message.content === "ping")
	{
		mybot.reply(message, "pong");
	}
	if(message.content === "!help")
	{
		var msg = "You need help " + message.author;
		mybot.sendMessage(message.channel, msg);
	}
	if(message.content.toLowerCase().indexOf("hello") > -1 && message.isMentioned(myUser))
	{
		var msg =  "Hello " + message.author;
		mybot.sendMessage(message.channel, msg);
	}
	if(message.content === "!join")
	{
		mybot.joinVoiceChannel(message.author.voiceChannel, function(error, voiceConnection)
		{
			if(error)
			{
				console.log(error);
				return;
			}
			mybot.voiceConnection.playFile("sound.mp3", function(error, intent)
			{
				if(error)
				{
					console.log(error);
				}
				intent.once("end", playbackFinished());
			});
		});
	}
});

function playbackFinished()
{
	setTimeout(mybot.leaveVoiceChannel(myUser.voiceChannel), 5000);
}

mybot.on("ready", function()
{
	mybot.setPlayingGame("with your emotions");
	myUser = mybot.users.get("username", "DeixBot");
	for (var i = 0; i < mybot.servers.length; i++)
	{
		var server = mybot.servers[i];
		var msg = "S'up " + server.name + "!";
		mybot.sendMessage(server.defaultChannel, msg);
	}
});

process.on("SIGINT", function()
{
	for (var i = 0; i < mybot.servers.length; i++)
	{
		var server = mybot.servers[i];
		mybot.sendMessage(server.defaultChannel, "Peace out!", function(i){
			if(i + 1 == mybot.servers.length)
			{
				mybot.logout();
			}
		});
	}
});


mybot.loginWithToken(config.discord.key);
