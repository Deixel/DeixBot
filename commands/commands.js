/*
cmd - what the user types, sans prefix
description - meaningful description, for use with help
action - what the command does
*/

var commands = {};
var client;
exports.get = function(cmd) {
	return commands[cmd];
}

exports.setClient = function(cl) {
	client = cl;
}

function Command(cmd, descr, action) {
	this.cmd = cmd;
	this.description = descr;
	this.action = action;
	commands[cmd]=this;
}

function getParams(content) {
	var params = content.split(" ");
	params.shift();
	return params;
}

new Command("ping",
	"It's like ping-pong, but with words.",
	function(message) {
		client.reply(message, "pong");
	}
);

new Command("blame",
	"Assigns blame appropriately",
	function(message) {
		client.sendMessage(message.channel, "I blame Yury");
	}
);

new Command("ge",
	"Search the RuneScape Grand Exchange for an item",
	function(message) {
		var p = getParams(message.content);
		var item = p.join().replace(/,/g, "+");
		client.sendMessage(message.channel, "http://services.runescape.com/m=itemdb_rs/results?query=" + item);
	}
);

new Command("hs",
	"Search the RuneScape High Scores for a player",
	function(message) {
		var p = getParams(message.content);
		var player = p.join().replace(/,/g, "_");
		client.sendMessage(message.channel, "http://services.runescape.com/m=hiscore/compare?user1=" + player);
	}
);

new Command("bh",
	"Hilarity ensues",
	function(message) {
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
		client.deleteMessage(message);
	}
);

new Command("config",
	"Admin can configure bot settings.",
	function(message) {
		if(message.channel.permissionsOf(message.author).hasPermission("administrator")) {
			var params = getParams(message.content);
			config[params[0]] = params[1];
			message.reply("Updated config");
		}
		else {
			message.reply("*sticks fingers in ears* lalala I'm not listening!");
		}
	}
);

new Command("botissues",
	"Got an idea or found a bug? Here's the link to submit them.",
	function(message) {
		client.sendMessage(message.channel, "https://github.com/Deixel/DeixBot/issues");
	}
);

new Command("help",
	"Lists all the commands.",
	function(message) {
		var helpStr = "";
		for(var cmd in commands) {
			helpStr.concat(helpStr, commands[cmd].cmd, ": ", commands[cmd].description, "\n");
		}
		client.sendMessage(message.channel, helpStr);
	}
);
