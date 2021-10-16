import Discord from "discord.js";
import DeixBotCommand from "../DeixBotCommand";
import { open } from "sqlite";
import sqlite3 from "sqlite3";
import log from "../logger";
import { pickgameRow } from "../interfaces";

enum SubCmds
{
	please = "please",
	list = "list",
	add = "add",
	remove = "remove"
}

class PickGame extends DeixBotCommand {
	constructor()
	{
		super({
			name: "pickgame",
			description: "Pick a game from the list",
			options: [
				{
					name: SubCmds.please,
					type: "SUB_COMMAND",
					description: "Ask me to pick a game",
				},
				{
					name: SubCmds.list,
					type: "SUB_COMMAND",
					description: "See the list of games to pick from",
				},
				{
					name: SubCmds.add,
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
					name: SubCmds.remove,
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
		let subcommand = interaction.options.data[0].name;
		switch(subcommand){
			case SubCmds.please:
				this.pick(interaction);
				break;
			case SubCmds.list:
				this.list(interaction);
				break;
			case SubCmds.add:
				this.add(interaction);
				break;
			case SubCmds.remove:
				this.remove(interaction);
				break;
			default:
				interaction.reply("Something went horribly wrong!");
				log.error("Managed to reach default in PickGame switch with: " + subcommand);
		}
	}

	async pick(interaction: Discord.CommandInteraction)
	{
		try {
			await interaction.deferReply();
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
			interaction.followUp("Sorry, something went wrong!");
		}
	}

	async list(interaction: Discord.CommandInteraction)
	{
		try {
			await interaction.deferReply();
			let db = await open({filename: "./deixbot.sqlite", driver: sqlite3.Database});
			let games = await db.all("SELECT gameName FROM pickgame");
			if(games.length != 0) {
				let gameList = games.map( (g: pickgameRow) => g.gameName ).join("\n");
				let response = new Discord.MessageEmbed({
					title: "Games To Choose From",
					description: gameList
				});
				interaction.followUp({ embeds: [response] });
			}		
			else {
				interaction.followUp("Sorry, I couldn't find any games in the list :disappointed:");
			}
			db.close();
		}
		catch (err) {
			log.error(err);
			interaction.followUp("Sorry, something went wrong!");
		}
	}

	async add(interaction: Discord.CommandInteraction)
	{
		try {
			await interaction.deferReply();
			let newGame = interaction.options.data[0].options?.[0].value;

			let db = await open({filename: "./deixbot.sqlite", driver: sqlite3.Database});
			await db.run("INSERT INTO pickgame ( gameName ) VALUES ( ? )", newGame);
			interaction.followUp("Added `" + newGame +"` to the list!");
			db.close();
			
		}
		catch (err) {
			log.error(err);
			interaction.followUp("Sorry, something went wrong!");
		}
	}

	async remove(interaction:Discord.CommandInteraction)
	{
		try {
			await interaction.deferReply();
			let oldGame = interaction.options.data[0].options?.[0].value;

			let db = await open({filename: "./deixbot.sqlite", driver: sqlite3.Database});
			await db.run("DELETE FROM pickgame WHERE gameId = (SELECT gameId FROM pickgame WHERE gameName = ? LIMIT 1)", oldGame)
			interaction.followUp("Removed `" + oldGame +"` from the list!");
			db.close();
		}
		catch (err) {
			log.error(err);
			interaction.followUp("Sorry, something went wrong!");
		}

		
	}
}

export default new PickGame();