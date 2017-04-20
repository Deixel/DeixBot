const commando = require('discord.js-commando');

module.exports = class AddInterestCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'addinterest',
			group: 'interests',
			memberName: 'addinterest',
			description: 'Add an interest to access their channel(s)',
			args: [
				{
					key: 'interest',
					type: 'role',
					prompt: 'What interest do you want to add?'
				}
			]
		});
	}

	async run (msg, args) {
		const role = args.interest;
		var user = msg.guild.member(msg.author);
		if(!user.roles.has(role.id) && role.name.startsWith('g_')) {
			msg.guild.member(msg.author).addRole(role);
			return msg.reply('you have been added to ' + role.name);
		}
		else {
			if(!role.name.startsWith('g_')) 
				return msg.reply('that\'s not a valid option...');
			else
				return msg.reply('you are already a member of this group!');
		}
	}
};
