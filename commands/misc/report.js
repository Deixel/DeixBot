const commando = require("discord.js-commando");

module.exports = class BlameCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: "report",
			group: "misc",
			memberName: "report",
			description: "Report them leet hax0rz",
			args: [
				{
					key: "chitter",
					type: "string",
					prompt: "who is the dirty chitter?"
				},
				{
					key: "reason",
					type: "string",
					prompt: "what did they do?",
					default: "Hax"
				}
			]
		});
	}

	async run(msg, args) {
		msg.channel.sendMessage(msg.author + " has reported " + args.chitter + ". Reason: " + args.reason);
		msg.delete();
	}
};
