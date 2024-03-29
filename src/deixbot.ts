#!/usr/bin/env node
import Discord from "discord.js";
import { open, Database } from "sqlite";
import sqlite3 from "sqlite3";
import log from "./logger";
import path from "path";
import fs, { unwatchFile } from "fs";
import fsPromises, { FileHandle } from "fs/promises";
import {responses, Response} from "./resources/responses";
import  commandList from "./CommandList"
import * as Interface from "./interfaces";
import {DeixBot} from "./interfaces";
import DeixBotCommand from "./DeixBotCommand";
//import { Soundboard } from "./commands/soundboard.ts.disabled";
const config: Interface.Config =  require("../config");
let preventGlobalCommands = false;
if(config.prevent_global_commands) {
	log.info("preventGlobalCommands set - all commands will be guild-based");
	preventGlobalCommands = config.prevent_global_commands;
}
if(config.commands_allowlist) {
	log.info("Command Allowlist set to: " + config.commands_allowlist.join(", "));
}


// First, sanity check the config file
if( 
	undefined === config.api_key				||
	undefined === config.owner_id 				)
{
	log.error("A required config option is missing! The following fields are required: api_key, owner_id, minecraft_guild_id, minecraft_chat_chat_channel, minecraft_chat_in_pipe, minecraft_chat_out_pipe");
	process.exit(1);
}


// The bot object itself, extends Discord.Client so we can attach a few extra properties to the object
export const client = new DeixBot({ intents: ["GUILD_MESSAGES", "GUILD_MEMBERS", "DIRECT_MESSAGES", "GUILDS", "GUILD_VOICE_STATES"] }); 

// Open the config database, then login
open({filename: path.join(__dirname,"deixbot.sqlite"), driver: sqlite3.Database}).then( (rdb) => {
	log.info("Successfully opened database");
	rdb.migrate({ migrationsPath: "../src/migrations/" }).then(() => {
		client.db = rdb;
		client.login(config.api_key).then(() => {
			log.info("Logged in with token");
			client.createRemindManager();
		}).catch( (err) => {
			log.error("Failed to login: " + err);
			process.exit(1);
		});
	});
}).catch(log.error);

// Successfully logged in, set up the playing messages and commands
client.once("ready", () => {
	log.info("Client is ready");
	if(client.user !== null) {
		log.info(`Logged in as ${client.user.username}#${client.user.discriminator}`);
	}
	log.info(`Client has cached ${client.channels.cache.size} channels across ${client.guilds.cache.size} guilds`);
	updatePlaying();
	setInterval(updatePlaying, 600000);
	commandList.forEach( (cmd, name) => {
		if(config.commands_allowlist) {
			if(!config.commands_allowlist.includes(name)) {
				log.info("Skipping registering " + name + " as it's not on the allow list");
				return;
			}
		}
		//Special case as sb needs to do some DB queries before it can be registered
		/*
		if(name === "soundboard") {
			(cmd as Soundboard).populateChoices(cmd as Soundboard).then( () => {
				registerCommand(cmd);
			})
		}
		else {
			registerCommand(cmd);
		}*/
		registerCommand(cmd);
	});
});

async function registerCommand(cmd: DeixBotCommand) {
	try {
		
		if(cmd.globalCommand && !preventGlobalCommands) {
			log.info("Registering global command " + cmd.commandData.name);
			let registeredCmd = await client.application?.commands.create(cmd.commandData);
			if(!client.registeredCommands.get("GLOBAL")) {
				client.registeredCommands.set("GLOBAL", []);
			}
			client.registeredCommands.get("GLOBAL")?.push(registeredCmd as Discord.ApplicationCommand);
		}
		else {
			let guilds = client.guilds.cache;
			for(let [, guild] of guilds) {
				let guildId = guild.id;
				if(cmd.guildAllowList.length > 0 && !cmd.guildAllowList.includes(guildId)) {
					log.info("Skipping " + cmd.commandData.name + " on guild " + guildId);
					continue;
				}
				let registeredCmd = await client.guilds.cache.get(guildId)?.commands.create(cmd.commandData);
				if(!client.registeredCommands.get(guildId)) {
					client.registeredCommands.set(guildId,[]);
				}
				client.registeredCommands.get(guildId)?.push(registeredCmd as Discord.ApplicationCommand);
				log.info("Registered " + cmd.commandData.name + " on guild " + guildId);
			}
		}	
	}
	catch (err) {
		log.error(err);
	}
}

// Someone has sent a slash command, respond to it
client.on("interactionCreate", (interaction) => {
	if(!interaction.isCommand()) return;
	let name = interaction.commandName;
	commandList.get(name)?.response(interaction);
});

// Used to randomly set the Playing status
function updatePlaying() {
	client.db?.get("SELECT playingString, activityType from playing ORDER BY RANDOM() LIMIT 1").then((game: Interface.playingRow) => {
		(client.user as Discord.ClientUser).setActivity({ name: game.playingString, type: game.activityType});
	}).catch(log.error);
}

client.on("messageCreate", (msg) => {
	//Ignore anything we've sent ourselves, so we don't get stuck in an infinite loop
	if(msg.author.id === (client.user as Discord.ClientUser).id) return;

	// If we are in the minecraft chat channel, mirror the chat over to minecraft
	if(config.minecraft && msg.channel.id === config.minecraft.chat_channel) {
		var message = "[" + msg.author.username + "]" + " " + msg.cleanContent;
		fs.writeFile(config.minecraft.chat_out_pipe as string, message, (err) => log.error);
	}
	// We should only do responses outside the minecraft channel
	else {
		responses.forEach( (e) => {
			if(e.check(msg)) return e.action(msg);
		});
	}
});

// Someone was added to the minecraft guild, send them the welcome message
if(config.minecraft) {
	client.on("guildMemberAdd", (member) => {
		if(member.guild.id === config.minecraft?.guild_id) {
			member.send(`Sal-u-tations, ${member.user.username}! Welcome to ${member.guild.name}!

				Be sure to check out the rules and installation instructions in <#${config.minecraft?.guild_rules_channel}}>.
				I also have a number of useful abilities. Just say \`!help\` at any time to see those!

				If you have any questions, just ask <@${config.owner_id}}>.`);
		}
	});
}

// Generic catch-all error reporter
client.on("error", (err) => { log.error(err) });

//Open the minecraft chat in-pipe and regularly poll it for new messages
var pipeChecker: NodeJS.Timeout;
var pipeCheckerFd: FileHandle | null;
if(config.minecraft){
	fsPromises.open(config.minecraft.chat_in_pipe, fs.constants.O_RDONLY | fs.constants.O_NONBLOCK, 0o644).then( (fd) => {
		pipeCheckerFd = fd;
		pipeChecker = setInterval( () => {
			fd.read(Buffer.alloc(16384), 0, 16384, null).then( (result) => { 
				let buffer = result.buffer;
				let bytesRead = result.bytesRead;
				if(bytesRead > 0) {
					buffer = buffer.slice(0, bytesRead);
					var message = buffer.toString();
					var channel = client.channels.cache.get(config.minecraft?.chat_channel as Discord.Snowflake) as Discord.TextChannel;
					channel.send(message);
				}
			});
		}, 1000);
	}).catch(log.error);
}

// CTRL-C received, tidy up and shutdown
process.on("SIGINT", () => {
	log.info("SIGINT received")
	clearInterval(pipeChecker);
	if(pipeCheckerFd != null) {
		pipeCheckerFd.close().then(() => {
			finishExit();
		});
	}
	else {
		finishExit();
	}
});

async function finishExit()
{
	for(let [guildId, guildCmds] of client.registeredCommands) {
		for(let cmdIndex = 0; cmdIndex < guildCmds.length; cmdIndex++ ) {
			let cmd = guildCmds[cmdIndex];
			log.info("Deleting command " + cmd.name + " from guild " + guildId);
			await client.guilds.cache.get(guildId as Discord.Snowflake)?.commands.delete(cmd);
		}
	}
	client.destroy();
	await client.db?.close();
	log.info("Client destroyed");
	process.exit(0);
}

// Promise failed somewhere and we didn't catch it properly
process.on("unhandledRejection", (reason, promise) => {
	log.error(`Unhandled Promise Rejection at Promise ${JSON.stringify(reason)} Reason: ${reason}`);
});

// Discord has disconnected unexpectedly, shutdown and let pm2 restart us
client.on("disconnect", (event) => {
	log.error(`Client has disconnected: ${event.reason} ( ${event.code})`);
	client.db?.close().then(process.exit(1));
});
