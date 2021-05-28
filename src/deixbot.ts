#!/usr/bin/env node
import Discord = require("discord.js");
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
import { Sb } from "./commands/sb";
const config: Interface.Config =  require("../config");

// First, sanity check the config file
if( 
	undefined === config.api_key				||
	undefined === config.minecraft_chat_channel	||
	undefined === config.minecraft_chat_in_pipe	||
	undefined === config.minecraft_chat_out_pipe||
	undefined === config.minecraft_guild_id 	||
	undefined === config.owner_id 				)
{
	log.error("A required config option is missing! The following fields are required: api_key, owner_id, minecraft_guild_id, minecraft_chat_chat_channel, minecraft_chat_in_pipe, minecraft_chat_out_pipe");
	process.exit(1);
}

if( undefined === config.test_guild_id ) {
	log.warn("test_guild_id is undefined in config, will register all commands globally");
}
else {
	log.info("Commands will only be registered in guild " + config.test_guild_id);
}

// The bot object itself, extends Discord.Client so we can attach a few extra properties to the object
export const client = new DeixBot({ intents: ["GUILD_MESSAGES", "GUILD_MEMBERS", "DIRECT_MESSAGES", "GUILDS"] }); 

// Open the config database, then login
open({filename: path.join(__dirname,"deixbot.sqlite"), driver: sqlite3.Database}).then( (rdb) => {
	log.info("Successfully opened database");
	rdb.migrate().then(() => {
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
	commandList.forEach( cmd => {
		if(cmd.commandData.name === "sb") {
			(cmd as Sb).populateChoices(cmd as Sb).then( () => {
				registerCommand(cmd);
			})
		}
		else {
			registerCommand(cmd);
		}
	});
});

function registerCommand(cmd: DeixBotCommand) {
	log.info("Registering command " + cmd.commandData.name);
	log.info(JSON.stringify(cmd.commandData));
	// Discord can take up to an hour to update global commands, so when testing only register then in the test guild (updates instantly)
	if(config.test_guild_id){
		client.guilds.cache.get(config.test_guild_id)?.commands.create(cmd.commandData).then( (cmd) => {
			client.registeredCommands.push(cmd);
		}).catch( err => console.error );
	}
	else {
		client.application?.commands.create(cmd.commandData).then( (cmd) => {
			client.registeredCommands.push(cmd);
		});
	}
}

// Someone has sent a slash command, respond to it
client.on("interaction", (interaction) => {
	if(!interaction.isCommand()) return;
	let name = interaction.commandName;
	commandList.get(name)?.response(interaction);
});

// Used to randomly set the Playing status
function updatePlaying() {
	client.db?.get("SELECT playingString from playing ORDER BY RANDOM() LIMIT 1").then((game: Interface.playingRow) => {
		(client.user as Discord.ClientUser).setActivity(game.playingString, {type: "PLAYING"});
	}).catch(log.error);
}

client.on("message", (msg) => {
	//Ignore anything we've sent ourselves, so we don't get stuck in an infinite loop
	if(msg.author.id === (client.user as Discord.ClientUser).id) return;

	// If we're not in the minecraft chat channel, see if there are any chat responses we need to give
	if(msg.channel.id !== config.minecraft_chat_channel) {
		responses.forEach( (e) => {
			if(e.check(msg)) return e.action(msg);
		});
	}
	// If we are in the minecraft chat channel, mirror the chat over to minecraft
	if(msg.channel.id === config.minecraft_chat_channel) {
		var message = "[" + msg.author.username + "]" + " " + msg.cleanContent;
		fs.writeFile(config.minecraft_chat_out_pipe, message, (err) => log.error);
	}
});

// Someone was added to the minecraft guild, send them the welcome message
client.on("guildMemberAdd", (member) => {
	if(member.guild.id === config.minecraft_guild_id) {
		member.send(`Sal-u-tations, ${member.user.username}! Welcome to ${member.guild.name}!

			Be sure to check out the rules and installation instructions in <#${config.minecraft_guild_rules_channel}}>.
			I also have a number of useful abilities. Just say \`!help\` at any time to see those!

			If you have any questions, just ask <@${config.owner_id}}>.`);
	}
});

// Generic catch-all error reporter
client.on("error", log.error);

//Open the minecraft chat in-pipe and regularly poll it for new messages
var pipeChecker: NodeJS.Timeout;
var pipeCheckerFd: FileHandle | null;
fsPromises.open(config.minecraft_chat_in_pipe, fs.constants.O_RDONLY | fs.constants.O_NONBLOCK, 0o644).then( (fd) => {
	pipeCheckerFd = fd;
	pipeChecker = setInterval( () => {
		fd.read(Buffer.alloc(16384), 0, 16384, null).then( (result) => { 
			let buffer = result.buffer;
			let bytesRead = result.bytesRead;
			if(bytesRead > 0) {
				buffer = buffer.slice(0, bytesRead);
				var message = buffer.toString();
				var channel = client.channels.cache.get(config.minecraft_chat_channel) as Discord.TextChannel;
				channel.send(message);
			}
		});
	}, 1000);
}).catch(log.error);

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
	for(let i = 0; i < client.registeredCommands.length; i++) {
		let cmd = client.registeredCommands[i];
		log.info("Deleting command " + cmd.name);
		if(config.test_guild_id){
			await client.guilds.cache.get(config.test_guild_id)?.commands.delete(cmd);
		}
		else {
			await client.application?.commands.delete(cmd);
		}
	}
	client.destroy();
	await client.db?.close();
	log.info("Client destroyed");
	process.exit(0);
}

// Promise failed somewhere and we didn't catch it properly
process.on("unhandledRejection", (reason, promise) => {
	log.error(`Unhandled Promise Rejection at Promise ${promise} Reason: ${reason}`);
});

// Discord has disconnected unexpectedly, shutdown and let pm2 restart us
client.on("disconnect", (event) => {
	log.error(`Client has disconnected: ${event.reason} ( ${event.code})`);
	client.db?.close().then(process.exit(1));
});
