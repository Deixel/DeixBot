const commando = require('discord.js-commando');

module.exports = class StopSoundboard extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'stopsb',
			group: 'soundboard',
			memberName: 'stopsb',
			description: 'Stop whatever is currently playing from the soundboard'
		});
	}

	async run(msg) {
		var voiceChannel = msg.guild.member(msg.client.user).voiceChannel;
		if(voiceChannel) {
			voiceChannel.leave();
		}
		else {
			msg.channel.sendMessage('*record scratch*');
		}
	}
};
