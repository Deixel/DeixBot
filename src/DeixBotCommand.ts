import Discord from "discord.js";


export default abstract class DeixBotCommand {
    public commandData: Discord.ApplicationCommandData;
    public abstract response(interaction: Discord.CommandInteraction): void;
    // An optional array of guild IDs that this command should be registered on.
    // If this is undefined, a command will be registered on all guilds.
    guildAllowList: string[] = [];

    constructor(commandData: Discord.ApplicationCommandData) {
        this.commandData = commandData;
    }
}
