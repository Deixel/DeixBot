import DeixBotCommand from "../DeixBotCommand";
import Discord from "discord.js";
import log from "../logger";
import { Reminder, ReminderOptions } from "../interfaces";
import { client } from "../deixbot";

enum params {
    person = "person",
    time = "time",
    units = "units",
    message = "message",
}

enum units {
    seconds = "seconds",
    minutes = "minutes",
    hours = "hours",
}

class Remind extends DeixBotCommand 
{
    constructor()
    {
        super({
            name: "remind",
            description: "Set a reminder for the future",
            options: [
                {
                    name: params.person,
                    type: "MENTIONABLE",
                    description: "Who do you want to remind?",
                    required: true
                },
                {
                    name: params.time,
                    type: "INTEGER",
                    description: "How far in the future should I remind them?",
                    required: true
                },
                {
                    name: params.units,
                    type: "STRING",
                    description: "Select a unit of time",
                    required: true,
                    choices: [
                        {
                            name: units.seconds,
                            value: units.seconds
                        },
                        {
                            name: units.minutes,
                            value: units.minutes
                        },
                        {
                            name: units.hours,
                            value: units.hours
                        }
                    ]
                },
                {
                    name: params.message,
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
            interaction.defer({ephemeral: true});
            let mentionable = interaction.options.data[ReminderOptions.person]
            let isPerson = (mentionable.role === undefined);
            let person = "<@" + (isPerson ? "" : "&") + mentionable + ">";

            let delayTime = interaction.options.getInteger(params.time) as number;
            let unit = interaction.options.getString(params.units);
            let multiplier = 1;
            switch(unit) {
                case units.hours:
                    multiplier *= 60; // 3600
                case units.minutes:
                    multiplier *= 60; // 60
                    break;
            }
            delayTime *= multiplier * 1000; // JS epochs are in ms
            let remindEpoch = Date.now() + delayTime;
            let channel = interaction.channel as Discord.TextChannel;
            let message = interaction.options.getString(params.message) as string;

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
                let member = mentionable.member as Discord.GuildMember;
                name = member?.displayName;
                url = member?.user.avatarURL();
            }
            else {
                name = mentionable.role?.name as string;
            }
            response.setFooter(name, url || undefined);
            interaction.followUp({ embeds: [response] });
        } 
        catch(err) {
            log.error(err);
            interaction.followUp("Sorry, something went wrong!");
        }

    }
}

export default new Remind();