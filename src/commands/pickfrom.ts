import DeixBotCommand from "../DeixBotCommand";
import Discord from "discord.js";

class PickFrom extends DeixBotCommand {

    constructor()
    {
        super({ 
            name: "pickfrom",
            description: "Let me pick something for you",
            options: [{
                name: "list",
                type: "STRING",
                description: "A space seperated list of things to pick from",
                required: true
            }]
        
         });
    }

    response(interaction: Discord.CommandInteraction): void {
        let list = (interaction.options[0].value as string).split(" ");
        interaction.reply("The winner is: `" + list[Math.floor(Math.random() * list.length)] + "`!");
    }

}

export default new PickFrom();
