import Discord from "discord.js";
import DeixBotCommand from "../DeixBotCommand";
import { open } from "sqlite";
import sqlite3 from "sqlite3";
import log from "../logger";
import { soundboardRow } from "../interfaces";
import { client } from "../deixbot";

export class Sb extends DeixBotCommand
{
    constructor()
    {
        super({
            name: "sb",
            description: "Play something from the soundboard in your current voice channel",
            options: [{
                name: "sound",
                description: "The sound you want to play",
                type: "STRING"
            }],
        })
    }

    populateChoices(self: Sb): Promise<void>
    {
        log.info("Populating sb choices");
        return new Promise(async (resolve, reject) => {
            try {
                let db = await open({ filename: "./deixbot.sqlite", driver: sqlite3.Database });
                let rows = await db.all<soundboardRow[]>("SELECT soundID, alias FROM soundboard");
                log.info("Found " + rows.length + " sounds");
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
                    (self.commandData.options as Discord.ApplicationCommandOption[] )[0].choices = choices;
                    log.info(JSON.stringify(self.commandData.options));
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