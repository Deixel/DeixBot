import Discord from "discord.js";
import * as Interface from "./interfaces";
const config: Interface.Config = require("../config");

const client = new Discord.Client({ intents: ["GUILD_MESSAGES", "GUILD_MEMBERS", "DIRECT_MESSAGES", "GUILDS"] });

client.login(config.api_key).then( async () => {
    let globalCmds = await client.application?.commands.fetch();
    console.log("Global: " + JSON.stringify(globalCmds));
    for(let cmd of globalCmds?.array() as Discord.ApplicationCommand[]) {
        console.log("Destroying global command " + cmd.name);
        client.application?.commands.delete(cmd);
    }

    for(let guild of client.guilds.cache.array()) {
        let cmds = await guild.commands.fetch()
        console.log(guild.name +": " + JSON.stringify(cmds) );
        for(let cmd of cmds.array()) {
            console.log("Destroying " + cmd.name + " from guild " + guild.id);
            await guild.commands.delete(cmd);
        }
    }
    client.destroy();
})