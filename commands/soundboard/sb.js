const commando = require("discord.js-commando");
const log = require("../../logger.js");
const sqlite = require("sqlite");

module.exports = class SoundboardCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: "sb",
			group: "soundboard",
			memberName: "sb",
			aliases: ["soundboard"],
			description: "Play something from the soundboard in your current voice channel",
			guildOnly: true,
			examples: ["sb", "sb gamenight", "sb bh 3"],
			args: [
				{
					key: "sound",
					type: "string",
					prompt: "what do you want to play?",
					default: ""
				},
				{
					key: "count",
					type: "integer",
					min: 1,
					max: 10,
					default: 1,
					prompt: "how many times do you want to play it?"
				}
			]
		});
	}

	async run(msg, args) {
		if(args.sound === "" || args.sound === "list") {
			msg.channel.startTyping();
			sqlite.open("./deixbot.sqlite").then( (db) => {
				db.all("SELECT alias, description FROM soundboard").then( (results) => {
					var sbList = "```ruby\n";
					for(var i = 0; i < results.length; i++) {
						sbList = sbList.concat(results[i].alias + ": " + results[i].description + "\n");
					}
					sbList = sbList.concat("```");
					msg.channel.stopTyping();
					db.close().then ( () => {
						return msg.channel.send(sbList);
					});
				});
			}).catch(log.error);
		}
		else {
			var voiceChannelToJoin = msg.guild.member(msg.author).voiceChannel;
			var myVoiceChannel = msg.guild.member(msg.client.user).voiceChannel;
			if(voiceChannelToJoin) {
				if(!myVoiceChannel) {
					if(voiceChannelToJoin.joinable) {
						sqlite.open("./deixbot.sqlite").then( (db) => {
							db.get("SELECT path from soundboard WHERE alias = ?", args.sound).then( (result) => {
								if(result !== undefined) {
									voiceChannelToJoin.join().then( (voiceConn) => {
										playSoundboard(voiceConn, result.path, args.count).then( () => { db.close(); return voiceChannelToJoin.leave(); } );
									}).catch( (err) => {
										log.error(err);
										db.close();
										return msg.reply("whoops! something went wrong!");
									});
								}
								else {
									db.close();
									return msg.channel.send("Invalid sound");
								}
							});
						}).catch(log.error);
					}
					else {
						return msg.reply("sorry, I'm not allowed in there :frowning:");
					}
				}
				else {
					return msg.reply("sorry, I'm already playing something on this server!");
				}
			}
			else {
				return msg.channel.send("*starts humming*");
			}
		}
	}
};


function playSoundboard(voiceConnection, filePath, iterations) {
	return new Promise( (resolve) => {
		var streamDispatch = voiceConnection.playFile("./resources/sounds/" + filePath);
		streamDispatch.once("end", () => {
			if(iterations > 1) {
				playSoundboard(voiceConnection, filePath, iterations-1).then( () => resolve());
			}
			else {
				resolve();
			}
		});
	});
}
