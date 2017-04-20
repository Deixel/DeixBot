const commando = require('discord.js-commando');

module.exports = class RemoveInterestCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'removeinterest',
			aliases: ['rminterest'],
			group: 'interests',
			memberName: 'removeinterest',
			description: 'Remove an interest',
			args: [
				{
					key: 'interest',
					type: 'role',
					prompt: 'What interest do you want to remove?'
				}
			]
		});
	}

	async run (msg, args) {
		const role = args.interest;
		var user = msg.guild.member(msg.author);
		if(user.roles.has(role.id) && role.name.startsWith('g_')) {
			msg.guild.member(msg.author).removeRole(role);
			return msg.reply('you have been removed from ' + role.name);
		}
		else {
			if(!role.name.startsWith('g_')) 
				return msg.reply('that\'s not a valid option...');
			else
				return msg.reply('you are not a member of this group!');
		}
	}
};
