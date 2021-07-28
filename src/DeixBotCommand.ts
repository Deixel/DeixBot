import Discord from "discord.js";


export default abstract class DeixBotCommand {
    /** 
     * Describes the slash command and required parameters to Discord.
     * See https://discord.js.org/#/docs/main/master/typedef/ApplicationCommandData for details
     */
    public commandData: Discord.ApplicationCommandData;

    /**
     * This is the function that is called when the slash command is run by a user.
     * This function is only called for the correct command, so there is no need to check the name before responding
     * @param interaction The Interaction object passed to us by Discord.
     */
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
