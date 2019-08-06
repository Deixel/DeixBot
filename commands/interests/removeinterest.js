const commando = require('discord.js-commando');

module.exports = class RemoveInterestCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'removeinterest',
			aliases: ['rminterest'],
			group: 'interests',
			memberName: 'removeinterest',
			description: 'Remove an interest',
			guildOnly: true,
			args: [
				{
					key: 'interest',
					type: 'role',
					prompt: 'what interest do you want to remove?',
					validate: (value) => {
						return value.startsWith('g_') ? true : "that's not a valid interest";
					},
				}
			],
		});
	}

	async run (msg, args) {
		const role = args.interest;
		var user = msg.guild.member(msg.author);
		if(user.roles.has(role.id)) {
			msg.guild.member(msg.author).removeRole(role);
			return msg.reply('you have been removed from ' + role.name);
		}
		else {
			return msg.reply('that is not one of your interests!');
		}
	}
};
