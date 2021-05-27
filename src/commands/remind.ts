import DeixBotCommand from "../DeixBotCommand";
import Discord from "discord.js";
import log from "../logger";
import { Reminder, ReminderOptions } from "../interfaces";
import { client } from "../deixbot";

class Remind extends DeixBotCommand 
{
    constructor()
    {
        super({
            name: "remind",
            description: "Set a reminder for the future",
            options: [
                {
                    name: "person",
                    type: "MENTIONABLE",
                    description: "Who do you want to remind?",
                    required: true
                },
                {
                    name: "time",
                    type: "INTEGER",
                    description: "How far in the future should I remind them?",
                    required: true
                },
                {
                    name: "units",
                    type: "STRING",
                    description: "Select a unit of time",
                    required: true,
                    choices: [
                        {
                            name: "seconds",
                            value: "seconds"
                        },
                        {
                            name: "minutes",
                            value: "minutes"
                        },
                        {
                            name: "hours",
                            value: "hours"
                        }
                    ]
                },
                {
                    name: "message",
                    type: "STRING",
                    description: "What message do you want to send them?",
                    required: true
                }
            ]
        });
    }

    async response(interaction: Discord.CommandInteraction)
    {
        try {
            interaction.defer(true);
            let isPerson = (interaction.options[ReminderOptions.person].role === undefined);
            let person = "<@" + (isPerson ? "" : "&") + interaction.options[ReminderOptions.person].value + ">";

            let delayTime: number = interaction.options[ReminderOptions.time].value as number;
            let units = interaction.options[ReminderOptions.units].value;
            let multiplier = 1;
            switch(units) {
                case "hours":
                    multiplier *= 60; // 3600
                case "minutes":
                    multiplier *= 60; // 60
                    break;
            }
            delayTime *= multiplier * 1000; // JS epochs are in ms
            let remindEpoch = Date.now() + delayTime;
            let channel = interaction.channel as Discord.TextChannel;
            let message = interaction.options[ReminderOptions.message].value as string;

            let reminder: Reminder = {
                person: person,
                message: message,
                timeout: remindEpoch,
                channel: channel
            }
            client.reminderManager?.add(reminder);
            let response = new Discord.MessageEmbed({
                timestamp: new Date(remindEpoch),
                title: "Reminder Set!",
                description: message,
            });
            let name;
            let url;
            if(isPerson) {
                let member = (await interaction.guild?.members.fetch(interaction.options[ReminderOptions.person].value as string));
                name = member?.displayName;
                url = member?.user.avatarURL();
            }
            else {
                name = (await interaction.guild?.roles.fetch(interaction.options[ReminderOptions.person].value as string))?.name;
            }
            response.setFooter(name, url || undefined);
            interaction.followUp(response);
        } 
        catch(err) {
            log.error(err);
            interaction.followUp("Sorry, something went wrong!", {ephemeral: true});
        }

    }
}

export default new Remind();