import Discord from "discord.js";
import DeixBotCommand from "../DeixBotCommand";
import log from "../logger";

enum params {
	messageId = "message-id",
}

class Quote extends DeixBotCommand {
	constructor()
	{
		super({
			name: "quote",
			description: "Quote a message from this server",
			options: [{
				name: params.messageId,
				type: "STRING",
				description: "The ID of the message from this server that you want to quote",
				required: true
			}]
		});
	}

	async response(interaction: Discord.CommandInteraction): Promise<void> {
		interaction.deferReply();
		return new Promise<void>( async (resolve, reject) => {
			let messageId = interaction.options.getString(params.messageId) as Discord.Snowflake;
			let guildChannels = interaction.guild?.channels.cache.filter( ch => ch.type === "GUILD_TEXT" )
			let channelsToSearch: Discord.Channel[] = [interaction.channel as Discord.GuildChannel];
			guildChannels?.forEach( (channel) => { channelsToSearch.push(channel) } );
			for(let channel of channelsToSearch) {
				try {
					let msg = await (channel as Discord.TextChannel).messages.fetch(messageId);
					let response = new Discord.MessageEmbed({
						timestamp: msg.createdAt,
						description: msg.cleanContent,
						footer: {
							text: msg.author.username + (msg.channel.id !== interaction.channelId ? " in #" + (msg.channel as Discord.GuildChannel).name : ""),
							iconURL: (msg.author.avatarURL() || undefined)
						}
					})
					interaction.followUp({ embeds: [response] });
					return resolve();
				}
				catch (err) {
					if( (err as any).message === "Unknown Message") {
						continue;
					}
					else {
						interaction.followUp("Sorry, something went wrong!");
						log.error(err);
						return reject(err);
					}
				}

			}
			interaction.followUp("Sorry, I couldn't find that message!")
		});
	}
}

export default new Quote();
