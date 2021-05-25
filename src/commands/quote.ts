import Discord from "discord.js";
import DeixBotCommand from "../DeixBotCommand";
import log from "../logger";

class Quote extends DeixBotCommand {
	constructor()
	{
		super({
			name: "quote",
			description: "Quote a message in this channel",
			options: [{
				name: "message-id",
				type: "STRING",
				description: "The ID of the message from this channel that you want to quote",
				required: true
			}]
		});
	}

	response(interaction: Discord.CommandInteraction): void {
		(interaction.channel as Discord.TextChannel)?.messages.fetch(interaction.options[0].value as string).then((msg) => {
			let response = new Discord.MessageEmbed({
				timestamp: msg.createdAt,
				description: msg.cleanContent,
				footer: {
					text: msg.author.username,
					iconURL: (msg.author.avatarURL() || undefined)
				}
			})
			interaction.reply(response);
		}).catch( (err) => {
			log.error(err);
			interaction.reply("Sorry, something went wrong: (" + err + ")", {ephemeral: true} );
		});
	}
}

export default new Quote();
