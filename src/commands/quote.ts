import Discord from "discord.js";
import DeixBotCommand from "../DeixBotCommand";
import log from "../logger";

class Quote extends DeixBotCommand {
	constructor()
	{
		super({
			name: "quote",
			description: "Quote a message from this server",
			options: [{
				name: "message-id",
				type: "STRING",
				description: "The ID of the message from this server that you want to quote",
				required: true
			}]
		});
	}

	async response(interaction: Discord.CommandInteraction): Promise<void> {
		interaction.defer();
		return new Promise<void>( async (resolve, reject) => {
			let messageId = interaction.options[0].value as string;
			let channels = interaction.guild?.channels.cache.array().filter( ch => ch.type === "text" );
			channels?.unshift(interaction.channel as Discord.GuildChannel);
			for(let channel of channels as Discord.GuildChannel[]) {
				try {
					let msg = await (channel as Discord.TextChannel).messages.fetch(messageId);
					let response = new Discord.MessageEmbed({
						timestamp: msg.createdAt,
						description: msg.cleanContent,
						footer: {
							text: msg.author.username + (msg.channel.id !== interaction.channelID ? " in #" + (msg.channel as Discord.GuildChannel).name : ""),
							iconURL: (msg.author.avatarURL() || undefined)
						}
					})
					interaction.followUp(response);
					return resolve();
				}
				catch (err) {
					if(err.message === "Unknown Message") {
						continue;
					}
					else {
						interaction.followUp("Sorry, something went wrong!", {ephemeral: true});
						log.error(err);
						return reject(err);
					}
				}

			}
			interaction.followUp("Sorry, I couldn't find that message!", {ephemeral: true})
		});
	}

	findMessage(interaction: Discord.CommandInteraction)
	{

	}
}

export default new Quote();
