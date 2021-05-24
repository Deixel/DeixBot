const commando = require("discord.js-commando");

module.exports = class BlameCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: "map",
			group: "misc",
			memberName: "map",
			description: "Link to the livemap",
		});
	}

	async run(msg, args) {
		msg.reply(`<https://deixel.co.uk/dynmap>`);
	}
};
