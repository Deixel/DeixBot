const commando = require('discord.js-commando');

module.exports = class AddInterestCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'addinterest',
			group: 'interests',
			memberName: 'addinterest',
			description: 'Add an interest to access their channel(s)',
			guildOnly: true,
			args: [
				{
					key: 'interest',
					type: 'role',
					prompt: 'what interest do you want to add?',
					validate: (value) => {
						return value.startsWith('g_') ? true : 'that is not a valid interest')
					}
				}
			]
		});
	}

	async run (msg, args) {
		const role = args.interest;
		var user = msg.guild.member(msg.author);
		if(!user.roles.has(role.id)) {
			msg.guild.member(msg.author).addRole(role);
			return msg.reply('you have been added to ' + role.name);
		}
		else {
			return msg.reply('this is already one of your interests!');
		}
	}
};
