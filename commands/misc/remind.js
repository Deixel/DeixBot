const commando = require("discord.js-commando");
const log = require("../../logger.js");

//remind <me|user> <in|at> <time>
module.exports = class QuoteCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: "remind",
			group: "misc",
			memberName: "remind",
			description: "Set a reminder",
			args: [
				{
					key: "person",
					type: "string",
					prompt: "who am I reminding?",
					parse: (val, msg) => {
						if(val === "me")
							return msg.author;
						else
							return val;
					}
				},
				{
					key: "delim",
					type: "string",
					prompt: "delimiter",
					validate: (val) => {
						return val === "in"; //|| val === "at";
					}
				},
				{
					key: "length",
					type: "integer",
					prompt: "how long?",
					validate: (val) => val > 0
				},
				{
					key: "unit",
					type: "string",
					prompt: "what unit?",
					validate: (val) => {
						let validUnits = ["s", "sec", "secs", "second", "seconds", "m", "min", "mins", "minute", "minutes", "h", "hour", "hours"];
						return validUnits.includes(val);
					}
				},
				{
					key: "message",
					type: "string",
					prompt: "what message?",
					default: "Time's up!"
				}
			]
		});
	}

	async run(msg, args) {
		msg.channel.send("Reminder set!").then(() => {
			var timeout = 1000 * args.length;
			switch (args.unit) {
				case "s":
				case "sec":
				case "secs":
				case "second":
				case "seconds":
					break;
				case "m":
				case "min":
				case "mins":
				case "minute":
				case "minutes":
					timeout *= 60;
					break;
				case "h":
				case "hour":
				case "hours":
					timeout *= 60*60;
			}
			setTimeout(() => msg.channel.send(`Hey ${args.person}, ${args.message}`), timeout);
		});
		//msg.channel.send(`Setting a reminder for ${args.person} ${args.delim} ${args.length} ${args.unit}`);
	}
};
