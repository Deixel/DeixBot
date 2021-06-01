import Discord from "discord.js";
import DeixBotCommand from "../DeixBotCommand";
import { open } from "sqlite";
import sqlite3 from "sqlite3";
import log from "../logger";
import { soundboardRow, Sound } from "../interfaces";
import { client } from "../deixbot";

enum SubCmds
{
    play = "play",
    list = "list",
    stop = "stop"
}

export class Soundboard extends DeixBotCommand
{
    sounds = new Discord.Collection<number, Sound>();
    globalCommand = false;
    guildAllowList = ["160355542601170944"];
    constructor()
    {
        super({
            name: "soundboard",
            description: "Play something from the soundboard in your current voice channel",
            options: [
                {
                    name: SubCmds.play,
                    description: "Play something from the soundboard",
                    type: "SUB_COMMAND",
                    options: [
                        {
                            name: "sound",
                            description: "The sound you want to play",
                            type: "INTEGER",
                            required: true
                        }
                    ]
                },
                {
                    name: SubCmds.list,
                    description: "List all the available sounds",
                    type: "SUB_COMMAND",
                },
                {
                    name: SubCmds.stop,
                    description: "Stop the currently playing sound",
                    type: "SUB_COMMAND"
                }
            ],
        })
    }


    
    populateChoices(self: Soundboard): Promise<void>
    {
        return new Promise(async (resolve, reject) => {
            try {
                let db = await open({ filename: "./deixbot.sqlite", driver: sqlite3.Database });
                let rows = await db.all<soundboardRow[]>("SELECT * FROM soundboard");
                if(rows) {
                    let choices: Discord.ApplicationCommandOptionChoice[] = [];
                    rows.forEach(row => {
                        let soundOption: Discord.ApplicationCommandOptionChoice = {
                            value: row.soundID,
                            name: row.alias,
                        };
                        choices.push(soundOption);
                        let sound: Sound = {
                            id: row.soundID,
                            alias: row.alias,
                            description: row.description,
                            path: row.path
                        }
                        this.sounds.set(row.soundID, sound);
                    });
                    choices.sort((a,b) => {
                        if(a.name < b.name) {
                            return -1;
                        }
                        else if(a.name > b.name) {
                            return 1;
                        }
                        else {
                            return 0;
                        }
                    });
                    ((self.commandData.options as Discord.ApplicationCommandOption[] )[0].options as Discord.ApplicationCommandOption[])[0].choices = choices;
                    db.close().then(resolve)
                }
                else {
                    log.error("Error: no soundboard entries found in database!");
                    db.close().then(reject);
                }
            }
            catch(err) {
                log.error(err);
                reject();
            }
        });
        
    }

    response(interaction: Discord.CommandInteraction): void {
        interaction.defer(true);
        switch(interaction.options[0].name) {
            case SubCmds.play:
                this.play(interaction);
                break;
            case SubCmds.list:
                this.list(interaction);
                break;
            case SubCmds.stop:
                this.stop(interaction);
                break;
            default:
                interaction.reply("Something went horribly wrong!", {ephemeral: true});
                log.error("Managed to reach default in Sb switch with: " + interaction.options[0].name);
        }
    }

    play(interaction: Discord.CommandInteraction): void 
    {
        interaction.guild?.members.fetch({ user: interaction.member as Discord.GuildMember, force: true, cache: false })?.then( (member) => {
            log.info(JSON.stringify(member.voice.channel));
        });
        let soundId = (interaction.options[0].options as Discord.CommandInteractionOption[])[0].value as number;
        let sound = this.sounds.get(soundId);
        let response = new Discord.MessageEmbed({ 
            description: "Now playing " + sound?.alias,
        });
        interaction.followUp(response);
    }

     list(interaction: Discord.CommandInteraction)
    {
        if(this.sounds.size == 0) {
            interaction.followUp("Sorry, I couldn't find any sounds on the soundboard :disappointed:");
        }
        else {
            let fields : Discord.EmbedFieldData[] = [];
            this.sounds.forEach( (sound)  => {
                fields.push({ name: sound.alias, value: sound.description });
            });
            fields.sort( (a, b) => {
                if(a.name < b.name) {
                    return -1;
                }
                if(a.name > b.name) {
                    return 1;
                }
                return 0;
            });
            let response = new Discord.MessageEmbed({
                title: "Sounds To Choose From",
            }).addFields(fields);
            interaction.followUp(response);
        }
    }

    stop(interaction: Discord.CommandInteraction)
    {
        interaction.guild?.members.fetch(client.user?.id as Discord.UserResolvable).then( (member) => {
            if(member?.voice.channel) {
                member.voice.channel.leave();
                interaction.followUp("Stopped", {ephemeral: true})
            }
            else {
                interaction.followUp("*record scratch*", {ephemeral: true});
            }
        });
    }


}

export default new Soundboard();