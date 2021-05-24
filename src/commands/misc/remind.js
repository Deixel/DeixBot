const commando = require("discord.js-commando");
const sqlite = require("sqlite");
const log = require("../../logger.js");
const SQL = require("sql-template-strings");


//remind <me|user> <in|at> <time>
module.exports = class RemindCommand extends commando.Command {
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
					default: "time's up!"
				}
			]
		});
	}

	async run(msg, args) {

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

		if(timeout < 10000){
			return msg.reply("sorry, the timeout has to be at least 10 seconds");
		}
		timeout += Date.now();
		var reminder = {
			person: args.person,
			message: args.message,
			timeout: timeout,
			channel: msg.channel
		};
		var client = msg.client;
		client.reminders.push(reminder);
		sqlite.open("./deixbot.sqlite").then(async (db) => {
			await db.run(SQL`INSERT INTO reminders (channelId, remindee, message, timestamp) VALUES ( ${reminder.channel.id}, ${reminder.person.toString()}, ${reminder.message}, ${reminder.timeout})`).then((row) => {reminder.id = row.lastID;}).catch((err) => {
				log.error(err);
				return msg.channel.send("Sorry, something went wrong!");
			});
		}).catch(log.error);
		if(!client.hasOwnProperty("reminderTimer")) {
			client.reminderTimer = setInterval( client.reminderFunc , 5000);
		}
		msg.channel.send("Reminder set!");
	}
};
