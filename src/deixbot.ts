#!/usr/bin/env node
import Discord = require("discord.js");
import { open, Database } from "sqlite";
import sqlite3 from "sqlite3";
import log from "./logger";
const appConfig: Interface.Config =  require("../config");
import path from "path";
import fs from "fs";
import {responses} from "./resources/responses";
import  commandList from "./CommandList"
import * as Interface from "./interfaces";
import {DeixBot} from "./interfaces";

/*responses.push(new Response( 
	(msg: Discord.Message) => {
		return msg.author.id === appConfig.ownerid && /(!reboot responses|!reboot chat|reboot speech)/.test(msg.cleanContent);
	},
	(msg: Discord.Message) => {
		msg.channel.send("Rebooting speech module...").then( () => {
			delete require.cache[require.resolve("./resources/responses.js")];
			responses = [];
			responses = require("./resources/responses.js");
			responses.push(reloadResponses);
			return msg.channel.send("Speech module back online! Sal-u-tations!");
		});
	}
));*/

open({filename: path.join(__dirname,"deixbot.sqlite"), driver: sqlite3.Database}).then( (rdb) => {
	log.info("Successfully opened database");
	rdb.migrate().then(() => {
		client.db = rdb;
		client.login(appConfig.apikey).then(() => {
			log.info("Logged in with token");
			client.createRemindManager();
		}).catch( (err) => {
			log.error("Failed to login: " + err);
			process.exit(1);
		});
	});
}).catch(log.error);


export const client = new DeixBot({ intents: ["GUILD_MESSAGES", "GUILD_MEMBERS", "DIRECT_MESSAGES", "GUILDS"] }); 


client.once("ready", () => {
	log.info("Client is ready");
	if(client.user !== null) {
		log.info(`Logged in as ${client.user.username}#${client.user.discriminator}`);
	}
	log.info(`Client has cached ${client.channels.cache.size} channels across ${client.guilds.cache.size} guilds`);
	updatePlaying();
	setInterval(updatePlaying, 600000);
	commandList.forEach( cmd => {
		log.info("Creating command " + cmd.commandData.name);
		if(appConfig.guildid){
			client.guilds.cache.get(appConfig.guildid)?.commands.create(cmd.commandData).then( (cmd) => {
				client.registeredCommands.push(cmd);
			}).catch( err => console.error );
		}
		else {
			client.application?.commands.create(cmd.commandData).then( (cmd) => {
				client.registeredCommands.push(cmd);
			});
		}
		
	});
	

});

client.on("interaction", (interaction) => {
	if(!interaction.isCommand()) return;
	let name = interaction.commandName;
	commandList.get(name)?.response(interaction);
});



function updatePlaying() {
	client.db?.get("SELECT playingString from playing ORDER BY RANDOM() LIMIT 1").then((game: Interface.playingRow) => {
		(client.user as Discord.ClientUser).setActivity(game.playingString, {type: "PLAYING"});
	}).catch(log.error);
}
var minecraftChatChannel = "801603076473094165" 
client.on("message", (msg) => {
	if(msg.author.id === (client.user as Discord.ClientUser).id) return;

	if(msg.channel.id !== minecraftChatChannel) {
		responses.forEach( (e) => {
			if(e.check(msg)) return e.action(msg);
		});
	}
	if(msg.channel.id === minecraftChatChannel) {
		var message = "[" + msg.author.username + "]" + " " + msg.cleanContent;
		fs.writeFile("/tmp/DiscordToMinecraft", message, (err) => log.error);
	}
});

client.on("guildMemberAdd", (member) => {
	if(member.guild.id === "344447107874291715") {
		member.send(`Sal-u-tations, ${member.user.username}! Welcome to ${member.guild.name}!

			Be sure to check out the rules and installation instructions in <#344447108301979658>.
			I also have a number of useful abilities. Just say \`!help\` at any time to see those!

			If you have any questions, just ask <@113310775887536128>.`);
	}
});

//client.on("debug", (info) => log.info(info));

client.on("error", (error) => log.error);

// var pipeChecker: NodeJS.Timeout;
// var pipeCheckerFd: number | null;
// fs.open("/tmp/MinecraftToDiscord", "r", (err: any, fd: any) => {
// 	pipeCheckerFd = fd;
// 	pipeChecker = setInterval( () => {
// 		var data = fs.read(fd, Buffer.alloc(16384), 0, 16384, null, (err, bytesRead, buffer) => { 
// 			if(err) {
// 				log.error(err)
// 			}
// 			if(bytesRead > 0) {
// 				buffer = buffer.slice(0, bytesRead);
// 				var message = buffer.toString();
// 				var channel = client.channels.cache.get("801603076473094165") as Discord.TextChannel;
// 				channel.send(message);
// 			}
// 		});
// 	}, 1000);

// });

process.on("SIGINT", () => {
	log.info("SIGINT received")
	// clearInterval(pipeChecker);
	// if(pipeCheckerFd != null) {
	// 	fs.close(pipeCheckerFd, (err) => log.error);
	// }
	client.registeredCommands.forEach( async cmd => {
		log.info("Deleting command " + cmd.name);
		if(appConfig.guildid){
			await client.guilds.cache.get(appConfig.guildid)?.commands.delete(cmd);
		}
		else {
			await client.application?.commands.delete(cmd);
		}
	});
	log.info("All commands destroyed");
	client.destroy();
	client.db?.close().then(process.exit(0));
});

process.on("unhandledRejection", (reason, promise) => {
	log.error(`Unhandled Promise Rejection at Promise ${promise} Reason: ${reason}`);
});

client.on("disconnect", (event) => {
	log.error(`Client has disconnected: ${event.reason} ( ${event.code})`);
	client.db?.close().then(process.exit(1));
});
