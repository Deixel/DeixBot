const commando = require('discord.js-commando');

module.exports = class JoinGroupCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'joingroup',
			group: 'groups',
			memberName: 'joingroup',
			description: 'Join a group to access their channel(s)',
			args: [
				{
					key: 'group',
					type: 'string',
					prompt: 'What group do you want to join?'
				}
			]
		});
	}

	async run (msg, args) {
		const group = args.group;
		var user = msg.guild.member(msg.author);
		var groupToJoin = msg.guild.roles.find('name', group);
		if(user.roles.find('id', groupToJoin.id)) {
			return msg.guild.member(msg.author).addRole(groupToJoin);
		}
		else {
			return msg.channel.sendMessage('You are already a member of this group!');
		}
	}
};
