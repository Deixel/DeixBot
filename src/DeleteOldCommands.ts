import Discord from "discord.js";
import * as Interface from "./interfaces";
const config: Interface.Config = require("../config");

const client = new Discord.Client({ intents: ["GUILD_MESSAGES", "GUILD_MEMBERS", "DIRECT_MESSAGES", "GUILDS"] });

client.login(config.api_key).then( async () => {
    let globalCmds = await client.application?.commands.fetch();
    console.log("Global: " + JSON.stringify(globalCmds));
        if(globalCmds !== undefined) {
        for(let cmd of globalCmds.values()) {
            console.log("Destroying global command " + cmd.name);
            client.application?.commands.delete(cmd);
        }
    }

    for(let guild of client.guilds.cache.values()) {
        let cmds = await guild.commands.fetch()
        console.log(guild.name +": " + JSON.stringify(cmds) );
        for(let [cmdName, cmd] of cmds) {
            console.log("Destroying " + cmd.name + " from guild " + guild.id);
            await guild.commands.delete(cmd);
        }
    }
    client.destroy();
})