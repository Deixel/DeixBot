import Discord from "discord.js";


export default abstract class DeixBotCommand {
    public commandData: Discord.ApplicationCommandData;
    public abstract response(interaction: Discord.CommandInteraction): void;

    constructor(commandData: Discord.ApplicationCommandData) {
        this.commandData = commandData;
    }
}
