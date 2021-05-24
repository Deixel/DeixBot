import Discord = require("discord.js");
import { open, Database } from "sqlite";
import sqlite3 from "sqlite3";
import log from "./logger";
const appConfig =  require("../config");
import path from "path";
import SQL from "sql-template-strings";
import fs from "fs";
import util from "util";
import {responses} from "./resources/responses";
import  commandList from "./CommandList"
var db: Database;

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

interface Reminder {
	id: number;
	person: string;
	message: string;
	timeout: number;
	channel: Discord.TextChannel;
}

class DeixBot extends Discord.Client {
	reminders: Reminder[] = [];
	reminderTimer: NodeJS.Timeout | undefined;

	constructor(options: Discord.ClientOptions) {
		super(options);
	}

	reminderFunc() {
		this.reminders.forEach((val, index) => {
			if(Date.now() > val.timeout) {
				val.channel.send(`Hey ${val.person}, ${val.message}`);
				this.reminders.splice(index, 1);
				db.run(SQL`DELETE FROM reminders WHERE reminderId = ${val.id}`);
			}
			if(this.reminders.length == 0) {
				if(this.reminderTimer !== undefined) {
					clearInterval(this.reminderTimer as NodeJS.Timeout);
				}
				delete this.reminderTimer;
			}
		});
	};
}

//const client = new DeixBot({ intents: ["GUILD_MESSAGES", "GUILD_MEMBERS", "DIRECT_MESSAGES"] });
const client = new Discord.Client({ intents: ["GUILD_MESSAGES", "GUILD_MEMBERS", "DIRECT_MESSAGES", "GUILDS"] });


client.once("ready", () => {
	log.info("Client is ready");
	if(client.user !== null) {
		log.info(`Logged in as ${client.user.username}#${client.user.discriminator}`);
	}
	log.info(`Client has cached ${client.channels.cache.size} channels across ${client.guilds.cache.size} guilds`);
	updatePlaying();
	setInterval(updatePlaying, 600000);
	commandList.forEach( cmd => {
		log.info("Creating command " + cmd.commandData.name)
		client.guilds.cache.get("160355542601170944")?.commands.create(cmd.commandData);
	});
	
	//log.debug("Trying to restore reminders...");
	// db.all("SELECT * FROM reminders").then((rows) => {
	// 	if(rows.length > 0) {
	// 		rows.forEach((row) =>{
	// 			if(row.timestamp < Date.now()) {  //Cleanup any old reminders that happened while we were offline
	// 				log.debug(`Cleaning up old reminder ${row.reminderId}`);
	// 				db.run(SQL`DELETE FROM reminders WHERE reminderId = ${row.reminderId}` ).catch(log.error);
	// 			}
	// 			else {
	// 				var channel = client.channels.cache.get(row.channelId);
	// 				if(channel !== undefined) {
	// 					var reminder : Reminder = {
	// 						id: row.reminderId,
	// 						person: row.remindee,
	// 						message: row.message,
	// 						timeout: row.timestamp,
	// 						channel: channel as Discord.TextChannel
	// 					};
	// 					log.debug(`Loaded reminder ${row.reminderId} | ${row.remindee} | ${row.message} | ${row.timestamp} | ${(channel as Discord.TextChannel).name}`);
	// 					client.reminders.push(reminder);
	// 				}
	// 				else {
	// 					log.debug(`Can't find channel with id ${row.channelId}`);
	// 					db.run(SQL`DELETE FROM reminders WHERE reminderId = ${row.reminderId}`).catch(log.error);
	// 				}
	// 			}
	// 		});
	// 		if(client.reminders.length > 0) {
	// 			client.reminderTimer = setInterval(client.reminderFunc, 5000);
	// 		}
	// 	}
	// }).catch(log.error);
});

client.on("interaction", (interaction) => {
	if(!interaction.isCommand()) return;
	let name = interaction.commandName;
	commandList.get(name)?.response(interaction);
});

open({filename: path.join(__dirname,"deixbot.sqlite"), driver: sqlite3.Database}).then( (rdb) => {
	log.info("Successfully opened database");
	db = rdb;
	db.migrate().then(() => {
		client.login(appConfig.apikey).then(() => {
			log.info("Logged in with token");
		}).catch( (err) => {
			log.error("Failed to login: " + err);
			process.exit(1);
		});
	});
}).catch(log.error);

function updatePlaying() {
	db.get("SELECT playingString from playing ORDER BY RANDOM() LIMIT 1").then((game) => {
		if(client.user !== undefined) {
			(client.user as Discord.ClientUser).setActivity(game.playingString, {type: "PLAYING"});
		}
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
	client.destroy();
	db.close().then(process.exit(0));
});

process.on("unhandledRejection", (reason, promise) => {
	log.error(`Unhandled Promise Rejection at Promise ${promise} Reason: ${reason}`);
});

client.on("disconnect", (event) => {
	log.error(`Client has disconnected: ${event.reason} ( ${event.code})`);
	db.close().then(process.exit(1));
});
