var log = require("../logger.js");
module.exports = {alias: "sb",
    description: "Play something from the soundboard.",
    hidden: false,
	action: (client, message, params, config) => {
		var voiceChannel = message.author.voiceChannel;
		if(params.length == 0 || (params.length > 0 && params[0] == "list")) {
			listSoundboard(config, function(sbList){
				client.sendMessage(message.channel, sbList);
			});
		}
		else if(voiceChannel != null) {
			config.connection.query("SELECT path FROM soundboard WHERE alias = ?", [params[0]], function(err, rows) {
				if(err)	{
					return log.error(err);
				}
				if(rows.length == 0) {
					client.sendMessage(message.channel, "I have no idea what that is, " + message.author);
					listSoundboard(config, (sbList) => {
						client.sendMessage(message.channel, sbList);
					});
				}
				else if (rows.length > 1) {
					log.warn("Soundboard alias " + params[0] + "returned multiple paths");
				}
				else {
					var filePath = rows[0].path;
					client.joinVoiceChannel(voiceChannel, function(err, voiceConnection) {
						if(err) {
							return log.error(err);
						}
						params.length == 2 ? playSoundboard(config, voiceConnection, filePath, parseInt(params[1])) : playSoundboard(config, voiceConnection, filePath);
					});
				}
			});
		}
		else {
			client.sendMessage(message.channel, "*starts humming*");
		}
	}
};

function listSoundboard(config, cb) {
	config.connection.query("SELECT alias, description FROM soundboard", function(err, rows) {
		if(err) {
			return log.error(err);
		}
		var sbList = "```";
		for(var i = 0; i < rows.length; i++) {
			sbList = sbList.concat(rows[i].alias + ": " + rows[i].description + "\n");
		}
		sbList = sbList.concat("```");
		cb(sbList);
	});
}

function playSoundboard(config, voiceConnection, filePath, iterations = 1) {
	voiceConnection.playFile(filePath, {volume: config.getServerConfig(voiceConnection.server, "vol")}, function(err, intent) {
		if(err){
			return log.error(err);
		}
		intent.on("error", function(err) {
			return log.error(err);
		});
		intent.once("end", function() {
			if(iterations <= 1) {
				voiceConnection.client.leaveVoiceChannel(voiceConnection);
			}
			else {
				playSoundboard(config, voiceConnection, filePath, iterations-1);
			}
		});
	});
}
