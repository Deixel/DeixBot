const Commando = require("discord.js-commando");
const sqlite = require("sqlite");
const log = require(__dirname + "/logger.js");
const config =  require("./config");
const appConfig = config.appConfig;
const path = require("path");
const SQL = require("sql-template-strings");

var db;

var responses = require("./resources/responses.js");

var reloadResponses = {
	check: (msg) => {
		return msg.author.id === appConfig.ownerid && /(!reboot responses|!reboot chat|reboot speech)/.test(msg.cleanContent);
	},
	action: (msg) => {
		msg.channel.send("Rebooting speech module...").then( () => {
			delete require.cache[require.resolve("./resources/responses.js")];
			responses = [];
			responses = require("./resources/responses.js");
			responses.push(reloadResponses);
			return msg.channel.send("Speech module back online! Sal-u-tations!");
		});
	}
};

responses.push(reloadResponses);

const client = new Commando.Client({
	owner: appConfig.ownerid,
	commandPrefix: "!",
});

client.reminders = [];

client.reminderFunc = () => {
	client.reminders.forEach((val, index) => {
		if(Date.now() > val.timeout) {
			val.channel.send(`Hey ${val.person}, ${val.message}`);
			client.reminders.splice(index, 1);
			db.run(SQL`DELETE FROM reminders WHERE reminderId = ${val.id}`);
		}
		if(client.reminders.length == 0) {
			clearInterval(client.reminderTimer);
			delete client.reminderTimer;
		}
	});
};

client.registry
	.registerGroups([
		["soundboard", "Soundboard"],
		["misc", "Misc"]
	])
	.registerDefaults()
	.registerCommandsIn(path.join(__dirname, "commands"));

client.setProvider(sqlite.open(path.join(__dirname, "settings.sqlite3")).then(sdb => new Commando.SQLiteProvider(sdb))).catch(log.error);

client.once("ready", () => {
	log.info("Client is ready");
	log.info(`Logged in as ${client.user.tag}`);
	log.info(`Client has cached ${client.channels.size} channels across ${client.guilds.size} guilds`);
	updatePlaying();
	setInterval(updatePlaying, 600000);
	log.info("Trying to restore reminders...");
	db.all("SELECT * FROM reminders").then((rows) => {
		if(rows.length > 0) {
			rows.forEach((row) =>{
				if(row.timestamp < Date.now()) {  //Cleanup any old reminders that happened while we were offline
					log.info(`Cleaning up missed reminder ID ${row.reminderId}`);
					db.run(SQL`DELETE FROM reminders WHERE reminderId = ${row.reminderId}` ).catch(log.error);
				}
				else {
					var channel = client.channels.get(row.channelId);
					if(typeof channel !== "undefined") {
						var reminder = {
							person: row.remindee,
							message: row.message,
							timeout: row.timestamp,
							channel: channel
						};
						log.debug(`Loaded reminder ${row.reminderId} | ${row.remindee} | ${row.message} | ${row.timestamp} | ${channel.name}`);
						client.reminders.push(reminder);
					}
					else {
						log.debug(`Can't find channel with id ${row.channelId}`);
						db.run(SQL`DELETE FROM reminders WHERE reminderId = ${row.reminderId}`).catch(log.error);
					}
				}
			});
			if(client.reminders.length > 0) {
				client.reminderTimer = setInterval(client.reminderFunc, 5000);
			}
		}
	}).catch(log.error);
});

sqlite.open(path.join(__dirname,"deixbot.sqlite")).then( (rdb) => {
	log.info("Successfully opened database");
	db = rdb;
	db.migrate().then(() => {
		client.login(appConfig.apikey).then(() => {
			log.info("Logged in with token");
		}).catch( () => {
			log.error("Failed to login");
			process.exit(1);
		});
	});
}).catch(log.error);

function updatePlaying() {
	db.get("SELECT playingString from playing ORDER BY RANDOM() LIMIT 1").then((game) => {
		client.user.setActivity(game.playingString, {type: "PLAYING"});
	}).catch(log.error);
}

client.on("message", (msg) => {
	if(msg.author.id !== client.user.id) {
		responses.forEach( (e) => {
			if(e.check(msg)) return e.action(msg);
		});
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

process.on("SIGINT", () => {
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
