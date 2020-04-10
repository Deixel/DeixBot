const commando = require("discord.js-commando");
const sqlite = require("sqlite");
const log = require("../../logger.js");

module.exports = class PickFrom extends commando.Command {
	constructor(client) {
		super(client, {
			name: "pickfrom",
			group: "misc",
			memberName: "pickfrom",
			description: "Let me pick from your options!",
			args: [
				{
					key: "picklist",
					type: "string",
					prompt: "what do you want to pick from?",
					infinite: true,
				}
			]
		});
	}

	async run(msg, args) {
		return msg.channel.send("And the winner is... `" + args.picklist[Math.floor(Math.random() * args.picklist.length)] + "`!");

	}
};
