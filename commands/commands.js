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
			//http://services.runescape.com/m=hiscore/index_lite.ws?player=DisplayName
			client.sendMessage(message.channel, "Loading...", function(err, msg) {
				var http = require("http");
				http.get("http://services.runescape.com/m=hiscore/index_lite.ws?player=" + player, function(res) {
					res.setEncoding("utf8");
					var hsRaw = "";
					res.on("data", function(d) {
						hsRaw = hsRaw.concat(d);
					});
					res.on("end", function() {
						var numSkills = 27;
						var skillRaw = hsRaw.split("\n");
						var skillNames = require("../resources/rs-skill-names");
						var output = "";
						for(var i = 0; i <= numSkills; i++) {
							var sTemp = skillRaw[i].split(",");
							output = output.concat(skillNames[i] + ": " + sTemp[2] + " (" + sTemp[1] + ")\n");
						}
						client.updateMessage(msg, "**" + player + "'s Skills**\n```Javascript\n" + output + "```");
					});
				});
			});
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
			if(params.length == 0 || (params.length == 1 && params[0] == "list")) {
				var propList = "```\n";
				for(var prop in config) {
					if(prop != "mysql" && prop != "apikey") {
						propList = propList.concat(prop + ": " + config[prop] +"\n");
					}
				}
				client.sendMessage(message.channel, propList + "```");
			}
			else if(params.length == 2) {
				config[params[0]] = params[1];
				client.reply(message, "Updated `" + params[0] + "` to `" + params[1] + "`!.");
			}
			else {
				client.reply(message, "Check yo parameters");
			}
		}
		else {
			client.reply(message, "Bitch, you need to check yo privileges.");
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
		if(params.length == 0 || (params.length > 0 && params[0] === "list")) {
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
		else if(params.length > 0) {
			if(params[0] === "add") {
				var newText = {};
				client.awaitResponse(message, "What tag would you like to add " + message.author + "?", function(err, msg1) {
					if(err) {
						console.error(err);
					}
					newText.alias = msg1.content;
					connection.query("SELECT alias FROM quicktext WHERE alias = ?", [newText.alias], function(err, rows) {
						if(err) {
							console.error(err);
						}
						if(rows.length != 0) {
							client.sendMessage(message.channel, "Sorry, that tag already exists.");
						}
						else {
							client.awaitResponse(msg1, "And what should `" + newText.alias +"` display?", function(err, msg2) {
								if(err) {
									console.error(err);
								}
								newText.contents = msg2.content;
								connection.query("INSERT INTO quicktext SET ?", newText, function(err) {
									if(err) {
										console.error(err);
									}
									client.reply(msg2, "Added `" + newText.alias + "`");
								});
							});
						}
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
		var calc = client.uptime / 1000;
		var secs = Math.floor(calc % 60);
		calc /= 60;
		var mins = Math.floor(calc % 60);
		calc /= 60;
		var hours = Math.floor(calc % 24);
		calc = Math.floor(calc / 24);
		var upFor = calc + " day" + ((calc == 1)?" ":"s ") + hours + " hour" + ((hours == 1)?" ":"s ") + mins + " min" + ((mins == 1)?" ":"s ") + secs + " sec" + ((secs == 1)?" ":"s ");

		var aboutMsg = "**"+client.user.username+"**\n\
		__About Me__\n\
		**ID:** " + client.user.id +"\n\
		**Playing:** " + ((client.user.game != null) ? client.user.game.name : "Nothing") + "\n\
		**On:** " + client.servers.length + " server"+ ((client.servers.length == 1) ? "" : "s") +"\n\
		**Up Since:** " + new Date(client.readyTime).toUTCString() + " - " + upFor + "\n\
		**Version:** " + process.env.npm_package_version + "\n\
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
