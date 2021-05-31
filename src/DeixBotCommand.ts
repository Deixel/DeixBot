import Discord from "discord.js";


export default abstract class DeixBotCommand {
    public commandData: Discord.ApplicationCommandData;
    public abstract response(interaction: Discord.CommandInteraction): void;

    /** 
     * Whether this command should be registered globally. Defaults to true.
     */
    globalCommand = true;

    /**
     * An optional array of guild IDs that this command should be registered on.
     * If this is undefined, a command will be registered on all guilds.
     * Ignored if globalCommand is true
     */
    guildAllowList: string[] = [];

    constructor(commandData: Discord.ApplicationCommandData) {
        this.commandData = commandData;
    }
}
