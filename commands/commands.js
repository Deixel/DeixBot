/*
cmd - what the user types, sans prefix
description - meaningful description, for use with help
action - what the command does
*/

var commands = {};
var client;
var config;
var connection;

exports.get = function(cmd) {
	return commands[cmd];
};

exports.setUp = function(cl, co, con) {
	client = cl;
	config = co;
	connection = con;
};

function Command(cmd, descr, action, hidden = false) {
	this.cmd = cmd;
	this.description = descr;
	this.action = action;
	this.hidden = hidden;
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
		var params = getParams(message.content);
		if(params.length > 0) {
			client.sendMessage(message.channel, "I blame " + params.join(" "));
		}
		else {
			client.sendMessage(message.channel, "I blame Yury");
		}
		client.deleteMessage(message);
	}
);

new Command("ge",
	"Search the RuneScape Grand Exchange for an item",
	function(message) {
		var p = getParams(message.content);
		if(p.length > 0) {
			var item = p.join("+");
			client.sendMessage(message.channel, "http://services.runescape.com/m=itemdb_rs/results?query=" + item);
		}
		else {
			client.reply(message, "You need to specify an item");
		}

	}
);

new Command("hs",
	"Search the RuneScape High Scores for a player",
	function(message) {
		var p = getParams(message.content);
		if(p.length > 0) {
			var player = p.join("_");
			client.sendMessage(message.channel, "http://services.runescape.com/m=hiscore/compare?user1=" + player);
		}
		else {
			client.reply(message, "You need to specify a player");
		}

	}
);

function listSoundboard(cb) {
	connection.query("SELECT alias, description FROM soundboard", function(err, rows) {
		if(err) {
			return console.error(err);
		}
		var sbList = "```";
		for(var i = 0; i < rows.length; i++) {
			sbList = sbList.concat(rows[i].alias + ": " + rows[i].description + "\n");
		}
		sbList = sbList.concat("```");
		cb(sbList);
	});
}

function playSoundboard(voiceConnection, filePath, iterations = 1) {
	voiceConnection.playFile(filePath, {volume: config.vol}, function(err, intent) {
		if(err){
			console.error(err);
		}
		intent.on("error", function(err) {
			console.error(err);
		});
		intent.once("end", function() {
			if(iterations <= 1) {
				client.leaveVoiceChannel(voiceConnection);
			}
			else {
				playSoundboard(voiceConnection, filePath, iterations-1);
			}
		});
	});
}

new Command("sb",
	"Play something from the soundboard",
	function(message) {
		var voiceChannel = message.author.voiceChannel;
		var params = getParams(message.content);
		if(params.length == 0 || (params.length > 0 && params[0] == "list")) {
			listSoundboard(function(sbList){
				client.sendMessage(message.channel, sbList);
			});
		}
		else if(voiceChannel != null) {
			connection.query("SELECT path FROM soundboard WHERE alias = ?", [params[0]], function(err, rows) {
				if(err) {
					console.error(err);
				}
				if(rows.length == 0) {
					client.sendMessage(message.channel, "I have no idea what that is, " + message.author);
					listSoundboard(function(sbList) {
						client.sendMessage(message.channel, sbList);
					});
				}
				else if (rows.length > 1) {
					console.warn("Soundboard alias " + params[0] + "returned multiple paths");
				}
				else {
					var filePath = rows[0].path;
					client.joinVoiceChannel(voiceChannel, function(err, voiceConnection) {
						if(err) {
							console.error(err);
						}
						params.length == 2 ? playSoundboard(voiceConnection, filePath, parseInt(params[1])) : playSoundboard(voiceConnection, filePath);
					});
				}
			});
		}
		else {
			client.sendMessage(message.channel, "*starts humming*");
		}
	}
);

new Command("config",
	"Admin can configure bot settings.",
	function(message) {
		if(message.channel.permissionsOf(message.author).hasPermission("administrator")) {
			var params = getParams(message.content);
			config[params[0]] = params[1];
			client.reply(message, "Updated config");
		}
		else {
			client.reply(message, "*sticks fingers in ears* lalala I'm not listening!");
		}
	},
	true
);

new Command("report",
	"Report them hax0rz",
	function(message) {
		var params = getParams(message.content);
		if(params.length > 1) {
			var hax0r = params.shift();
			var reason =  params.join(" ");
			var report = message.author + " has reported " + hax0r + ". Reason: " + reason;
			client.sendMessage(message.channel, report);
			client.deleteMessage(message);
		}
		else {
			client.sendMessage(message.channel, message.author + " doesn't know how reporting works!");
			client.deleteMessage(message);
		}
	}
);

new Command("say",
	"Words and words and words",
	function(message) {
		var params = getParams(message.content);
		client.sendMessage(message.channel, params.join(" "));
		client.deleteMessage(message);
	},
	true
);

new Command("text",
	"Quickly print some saved text",
	function(message, cb) {
		var params = getParams(message.content);
		if(params.length < 0) {
			if(params[0] === "list") {
				connection.query("SELECT alias FROM quicktext", function(err, rows) {
					if(err) {
						console.error(err);
					}
					var textList = "";
					for(var i = 0; i < rows.length; i++) {
						textList = textList.concat(rows[i].alias + " ");
					}
					client.sendMessage(message.channel, textList);
				});
			}
			else if(params[0] === "add") {
				var newAlias = "";
				var newTextContents = "";
				client.sendMessage(message.author, "What tag would you like to create text for?", function(err, msg1){
					if(err) {
						console.error(err);
					}
					client.awaitResponse(msg1, function(err) {
						if(err) {
							console.error(err);
						}
						newAlias = msg1.content;
						client.awaitResponse(msg1, "And what should " + newAlias +" display?", function(err, msg2) {
							if(err) {
								console.error(err);
							}
							newTextContents = msg2.content;
							client.sendMessage(msg2.channel, newAlias + ": " + newTextContents);
						});
					});
				});
			}
			else {
				connection.query("SELECT contents FROM quicktext WHERE alias = ?", params[0], function(err, rows) {
					if(err) {
						console.error(err);
					}
					if(rows.length == 0) {
						client.sendMessage(message.channel, "404: Message not found.");
					}
					else {
						client.sendMessage(message.channel, rows[0].contents);
					}
					//Pretty much only used for testing
					if(cb != null)	{
						cb();
					}
				});
			}
		}
	}
);

new Command("help",
	"Lists all the commands.",
	function(message) {
		var helpStr = "```";
		for(var cmd in commands) {
			if(!commands[cmd].hidden) {
				helpStr = helpStr.concat(config.cmdprefix, commands[cmd].cmd, ": ", commands[cmd].description, "\n");
			}
		}
		helpStr = helpStr.concat("```");
		client.sendMessage(message.channel, helpStr);
	}
);

new Command("about",
	"About DeixBot",
	function(message) {
		var aboutMsg = "**"+client.user.username+"**\n\
		__About Me__\n\
		**ID:** " + client.user.id +"\n\
		**Playing:** " + ((client.user.game != null) ? client.user.game.name : "Nothing") + "\n\
		**On:** " + client.servers.length + " server"+ ((client.servers.length == 1) ? "" : "s") +"\n\
		__Creator__\n\
		**Name:** <@113310775887536128> \n\
		**Website:** http://www.deixel.co.uk\n\
		**Source:** https://github.com/Deixel/DeixBot\n\
		__Dev__\n\
		**Language:** Node.JS\n\
		**Library:** Discord.js (https://github.com/hydrabolt/discord.js/)\n";
		client.sendMessage(message.channel, aboutMsg);
	}
);
