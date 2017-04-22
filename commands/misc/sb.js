const commando = require('discord.js-commando');
const log = require('../../logger.js');

module.exports = class SoundboardCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'sb',
			group: 'misc',
			memberName: 'sb',
			aliases: ['soundboard'],
			description: 'Play something from the soundboard in your current voice channel',
			guildOnly: true,
			args: [
				{
					key: 'sound',
					type: 'string',
					prompt: 'what do you want to play?'
				},
				{
					key: 'count',
					type: 'integer',
					min: 1,
					max: 10,
					default: 1,
					prompt: 'how many times do you want to play it?'
				}
			]
		});
	}

	async run(msg, args) {
		var voiceChannelToJoin = msg.guild.member(msg.author).voiceChannel;
		var myVoiceChannel = msg.guild.member(msg.client.user).voiceChannel;
		if(voiceChannelToJoin) {
			if(!myVoiceChannel) {
				if(voiceChannelToJoin.joinable) {
					voiceChannelToJoin.join().then( (voiceConn) => {
						var streamDispatch = voiceConn.playFile('./resources/sounds/gamenight.mp3');
						streamDispatch.once('end', () => {
							voiceChannelToJoin.leave();
						});
					}).catch( (err) => {
						log.error(err); 
						msg.reply('whoops! something went wrong!');
					});
				}
				else {
					msg.reply('sorry, I\'m not allowed in there :frowning:');
				}
			}
			else {
				msg.reply('sorry, I\'m already playing something on this server!');
			}	
		}
		else {
			msg.channel.sendMessage('*starts humming*');
		}
	}
};
