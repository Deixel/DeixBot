const commando = require('discord.js-commando');

module.exports = class ListGroupsCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'listinterests',
			aliases: ['lsinterests'],
			group: 'interests',
			memberName: 'listinterests',
			description: 'List all groups on the Guild',
			guildOnly: true
		});
	}

	async run (msg) {
		var memberGroups = msg.guild.member(msg.author).roles.filter( r => { return r.name.startsWith('g');}).map(r => r.name);
		var groupNames = msg.guild.roles.filter(r => { return r.name.startsWith('g_');}).map(r => r.name).filter( e => { return memberGroups.indexOf(e) == -1; });
		return msg.channel.sendMessage('**' + msg.author.username + '\'s Current Interests**\n' + memberGroups.join('\n') + '\n\n**Available Groups**\n' + groupNames.join('\n'));
	}
};
