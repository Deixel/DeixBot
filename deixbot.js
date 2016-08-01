var Discord = require("discord.js");
var mysql = require("mysql");
var log = require(__dirname + "/logger.js");
var config =  require("./config");
var appConfig = config.appConfig;

var connection;
config.connection = connection;
var serverConfig = config.serverConfig;
var getServerConfig = config.getServerConfig;

var commands = {};

commands.help = {
	alias: "help",
	description: "This help message!",
	hidden: false,
	action: (client, message) => {
		var helpStr = "```";
		for(var cmd in commands) {
			if(!commands[cmd].hidden) {
				helpStr = helpStr.concat(getServerConfig(message.server, "cmdprefix"), commands[cmd].alias, ": ", commands[cmd].description, "\n");
			}
		}
		helpStr = helpStr.concat("```");
		client.sendMessage(message.channel, helpStr);
	}
};

commands.load = {
	alias: "load",
	description: "Load a command",
	hidden: true,
	action: (client, message, params) => {
		if(message.author.id == appConfig.ownerid) {
			try {
				commands[params[0]] = require("./commands/" + params[0] + ".js");
				client.sendMessage(message.channel, "Successfully loaded " + params[0]);
				log.info("Loaded " + params[0]);
			}
			catch(err) {
				client.sendMessage(message.channel, "Failed to load " + params[0]);
				log.error(err);
			}
		}
		else {
			client.sendMessage(message.channel, ":no_entry: **Permission Denied** :no_entry:");
		}
	}
};

commands.unload = {
	alias: "unload",
	description: "Unload a command",
	hidden: true,
	action:  (client, message, params) => {
		if(message.author.id == appConfig.ownerid) {
			try {
				delete commands[params[0]];
				delete require.cache["./commands/" + params[0] + ".js"];
				client.sendMessage(message.channel, "Successfully unloaded " + params[0]);
				log.info("Unloaded " + params[0]);
			}
			catch(err) {
				client.sendMessage(message.channel, "Failed to unload " + params[0]);
				log.error(err);
			}
		}
		else {
			client.sendMessage(message.channel, ":no_entry: **Permission Denied** :no_entry:");
		}
	}
};

commands.reload = {
	alias: "reload",
	description: "Reload a command",
	hidden: true,
	action: (client, message, params) => {
		if(message.author.id == appConfig.ownerid) {
			// commands.unload.action(client, message, params);
			// commands.load.action(client, message, params);
			try {
				delete commands[params[0]];
				delete require.cache[require.resolve("./commands/" + params[0] + ".js")];
				commands[params[0]] = require("./commands/" + params[0] + ".js");
				client.sendMessage(message.channel, "Successfully reloaded " + params[0]);
				log.info("Reloaded " + params[0]);
			}
			catch(err) {
				client.sendMessage(message.channel, "Failed to reload " + params[0]);
				log.error(err);
			}

		}
	}
};

function loadCommands() {
	var fs = require("fs");
	var files = fs.readdirSync("./commands");
	var loaded = 0;
	for(let file of files) {
		if(file.endsWith(".js")) {
			commands[file.slice(0, -3)] = require("./commands/" + file);
			loaded++;
		}
	}
	log.info("Loaded  " + loaded + " commands!");
}

function db_connect() {
	connection = mysql.createConnection(appConfig.mysql);
	connection.connect(function(err) {
		if(err) {
			log.error(err);
			setTimeout(db_connect, 2000);
		}
	});
	connection.on("error", function(err) {
		if(err.code === "PROTOCOL_CONNECTION_LOST") {
			db_connect();
		}
		else {
			return log.error(err);
		}
	});
}

function getParams(content) {
	var params = content.split(" ");
	if(content.indexOf(client.user.mention()) > -1) {
		params.shift();
	}
	params.shift();
	return params;
}

var client = new Discord.Client({autoReconnect: true});

client.on("message", function(message) {
	if(message.content.toLowerCase().indexOf("hello") > -1 && message.isMentioned(client.user)) {
		return client.sendMessage(message.channel, "Hello " + message.author);
	}
	else if(message.content.toLowerCase().indexOf("who gta") > -1) {
		return message.reply("oooh oooh me! I'll play!");
	}
	else if(message.content.startsWith(getServerConfig(message.server, "cmdprefix"))) {

		var cmdArray = message.content.substring(getServerConfig(message.server, "cmdprefix").length).split(" ");
		var cmd = commands[cmdArray[0]];

		if(cmd != null) {
			cmd.action(client, message, getParams(message.content), config);
		}
	}
	else if(message.isMentioned(client.user)) {
		cmdArray = message.content.split(" ");
		cmd = commands[cmdArray[1]];

		if(cmd != null) {
			cmd.action(client, message, getParams(message.content), config);
		}
	}
});

//Called once the bot is logged in and ready to use.
client.on("ready", function() {
	db_connect();
	log.info("Established connection to database.");
	updatePlaying();
	setInterval(updatePlaying, 600000);

	connection.query("SELECT configName, configValue FROM configs ORDER BY configID ASC", function(err, rows) {
		if(err) {
			return log.error(err);
		}
		serverConfig["default"] = {};
		for(var i = 0;i < rows.length; i++) {
			serverConfig["default"][rows[i].configName] = rows[i].configValue;
			log.info("Set default '"+ rows[i].configName + "' to '" + rows[i].configValue + "'.");
		}
	});

	connection.query("SELECT serverConfig.serverId, serverConfig.value, configs.configName FROM serverConfig INNER JOIN configs on serverConfig.configId= configs.configId", function(err, rows) {
		if(err) {
			return log.error(err);
		}
		for(var server of client.servers) {
			serverConfig[server.id] = {};
		}
		for(var i = 0; i < rows.length; i++) {
			serverConfig[rows[i].serverId][rows[i].configName] = rows[i].value;
		}
	});
	loadCommands();
});

function updatePlaying() {
	connection.query("SELECT playingString FROM playing ORDER BY RAND() LIMIT 1", function(err, rows) {
		if(err) {
			return log.error(err);
		}
		client.setPlayingGame(rows[0].playingString);
	});
}

//Handle a CTRL+C to actually shutdown somewhat cleanly
process.on("SIGINT", function() {
	client.logout(function(error) {
		if(error) {
			return log.error(error);
		}
		process.exit(0);
	});
});

client.loginWithToken(appConfig.apikey, function(err){
	if(err) {
		return log.error(err);
	}
});
