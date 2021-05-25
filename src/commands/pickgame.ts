import Discord from "discord.js";
import DeixBotCommand from "../DeixBotCommand";
import { open } from "sqlite";
import sqlite3 from "sqlite3";
import path from "path";
import log from "../logger";

interface pickgameRow
{
	gameId: number,
	gameName: string
}

class PickGame extends DeixBotCommand {
	constructor()
	{
		super({
			name: "pickgame",
			description: "Pick a game from the list",
			options: [
				{
					name: "please",
					type: "SUB_COMMAND",
					description: "Ask me to pick a game",
				},
				{
					name: "list",
					type: "SUB_COMMAND",
					description: "Add a new game to the list",
				},
				{
					name: "add",
					type: "SUB_COMMAND",
					description: "The game you want to add",
					options: [{
						name: "game",
						description: "The game you want to add",
						type: "STRING",
						required: true
					}]
				},
				{
					name: "remove",
					type: "SUB_COMMAND",
					description: "The game you want to remove",
					options: [{
						name: "game",
						description: "The game you want to remove",
						type: "STRING",
						required: true
					}]
				},
			]
		});
	}

	response(interaction: Discord.CommandInteraction): void {
		switch(interaction.options[0].name){
			case "please":
				this.pick(interaction);
				break;
			case "list":
				this.list(interaction);
				break;
			case "add":
				this.add(interaction);
				break;
			case "remove":
				this.remove(interaction);
				break;
			default:
				interaction.reply("Something went horribly wrong!", {ephemeral: true});
				log.error("Managed to reach default in PickGame switch");
		}
	}

	async pick(interaction: Discord.CommandInteraction)
	{
		try {
			await interaction.defer();
			let db = await open({filename: "./deixbot.sqlite", driver: sqlite3.Database});
			let game: pickgameRow | undefined = await db.get("SELECT gameName FROM pickgame ORDER BY RANDOM() LIMIT 1");
			if(game) {
				interaction.followUp("And the winner is: `" + game.gameName + "`!");
			}		
			else {
				interaction.followUp("Sorry, I couldn't find any games in the list :disappointed:");
			}
			db.close();
		}
		catch (err) {
			log.error(err);
			interaction.followUp("Sorry, something went wrong!", {ephemeral: true});
		}
	}

	async list(interaction: Discord.CommandInteraction)
	{
		try {
			await interaction.defer();
			let db = await open({filename: "./deixbot.sqlite", driver: sqlite3.Database});
			let games = await db.all("SELECT gameName FROM pickgame");
			if(games.length != 0) {
				let gameList = games.map( (g: pickgameRow) => g.gameName ).join("\n");
				let response = new Discord.MessageEmbed({
					title: "Games To Choose From",
					description: gameList
				});
				interaction.followUp(response);
			}		
			else {
				interaction.followUp("Sorry, I couldn't find any games in the list :disappointed:");
			}
			db.close();
		}
		catch (err) {
			log.error(err);
			interaction.followUp("Sorry, something went wrong!", {ephemeral: true});
		}
	}

	async add(interaction: Discord.CommandInteraction)
	{
		try {
			await interaction.defer();
			let newGame = interaction.options[0].options?.[0].value;

			let db = await open({filename: "./deixbot.sqlite", driver: sqlite3.Database});
			db.run("INSERT INTO pickgame ( gameName ) VALUES ( ? )", newGame).then( () => {
				interaction.followUp("Added `" + newGame +"` to the list!");
			});
		}
		catch (err) {
			log.error(err);
			interaction.followUp("Sorry, something went wrong!", {ephemeral: true});
		}
	}

	async remove(interaction:Discord.CommandInteraction)
	{
		interaction.reply("Game removed");
	}
}

export default new PickGame();
/*
module.exports = class BlameCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: "pickgame",
			group: "misc",
			memberName: "pickgame",
			description: "Can't decide on something to play? Let me pick for you.",
			args: [
				{
					key: "operation",
					type: "string",
					prompt: "what do you want to do?",
					default: "pick",
					validate: (value) => {
						return value === "add" || value === "remove" || value === "pick" || value === "list" || value === "please";
					}
				},
				{
					key: "game",
					type: "string",
					prompt: "what game to do you want to add/remove?",
					default: ""
				}
			]
		});
	}

	async run(msg, args) {
		sqlite.open("./deixbot.sqlite").then( (db) => {
			if(args.operation === "pick" || args.operation === "please") {
				msg.channel.startTyping();
				db.get("SELECT gameName FROM pickgame ORDER BY RANDOM() LIMIT 1").then( (game) => {
					msg.channel.stopTyping();
					if(game) {
						if(args.operation === "please") {
							return msg.channel.send(`And the winner is: \`${game.gameName}\`!`);
						}
						else {
							return msg.channel.send("Why are you asking me? You're just going to play Overwatch anyway...");
						}
					}
					else {
						return msg.channel.send("Couldn't find any games in the list");
					}
				}).catch(log.error);
			}
			else if(args.operation === "add") {
				msg.channel.startTyping();
				db.run("INSERT INTO pickgame ( gameName ) VALUES ( ? )", args.game).then( () => {
					msg.channel.stopTyping();
					return msg.channel.send(`Added ${args.game} to the list`);
				}).catch( (err) => {
					msg.stopTyping();
					msg.channel.send("Whoops. Something went wrong. Sorry :frowning:");
					return log.error(err);
				});
			}
			else if(args.operation === "remove") {
				msg.channel.startTyping();
				db.run("DELETE FROM pickgame WHERE gameId = (SELECT gameId FROM pickgame WHERE gameName = ? LIMIT 1)", args.game).then( () => {
					msg.channel.stopTyping();
					return msg.channel.send(`Removed ${args.game} from the list`);
				}).catch(log.error);
			}
			else if(args.operation === "list") {
				msg.channel.startTyping();
				db.all("SELECT gameName FROM pickgame").then( (rows) => {
					if(rows.length === 0) {
						msg.channel.stopTyping();
						return msg.channel.send("There are no games in the list right now!");
					}
					else {
						var gameList = "`" + rows.map( g => g.gameName ).join("` `") + "`";
						msg.channel.stopTyping();
						return msg.channel.send(`**Games to Choose From**\n${gameList}`);
					}
				}).catch(log.error);
			}
		});
	}
};
*/