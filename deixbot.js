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
});
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
