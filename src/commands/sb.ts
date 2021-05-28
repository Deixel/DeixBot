import Discord from "discord.js";
import DeixBotCommand from "../DeixBotCommand";
import { open } from "sqlite";
import sqlite3 from "sqlite3";
import log from "../logger";
import { soundboardRow } from "../interfaces";
import { client } from "../deixbot";

enum SubCmds
{
    play = "play",
    list = "list",
    stop = "stop"
}

export class Sb extends DeixBotCommand
{
    constructor()
    {
        super({
            name: "sb",
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

    populateChoices(self: Sb): Promise<void>
    {
        return new Promise(async (resolve, reject) => {
            try {
                let db = await open({ filename: "./deixbot.sqlite", driver: sqlite3.Database });
                let rows = await db.all<soundboardRow[]>("SELECT soundID, alias FROM soundboard");
                if(rows) {
                    let choices: Discord.ApplicationCommandOptionChoice[] = [];
                    rows.forEach(row => {
                        let sound: Discord.ApplicationCommandOptionChoice = {
                            value: row.soundID,
                            name: row.alias,
                        };
                        choices.push(sound);
                    });
                    log.info(JSON.stringify(choices));
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

    }
}

export default new Sb();