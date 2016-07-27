var Discord = require("discord.js");
var config =  require("./config");
var appConfig = config.appConfig;
var cmds = require("./commands/commands");
var mysql = require("mysql");
var db_config = {
	host: appConfig.mysql.host,
	user: appConfig.mysql.user,
	password: appConfig.mysql.pass,
	database: appConfig.mysql.db
};
var connection;
var serverConfig = config.serverConfig;
var getServerConfig = config.getServerConfig;

function db_connect() {
	connection = mysql.createConnection(db_config);
	connection.connect(function(err) {
		if(err) {
			console.error(err);
			setTimeout(db_connect, 2000);
		}
	});
	connection.on("error", function(err) {
		if(err.code === "PROTOCOL_CONNECTION_LOST") {
			db_connect();
		}
		else {
			return console.log(err);
		}
	});
}

function getParams(content) {
	var params = content.split(" ");
	if(content.indexOf(client.user.mention()) > 1) params.shift();
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
		var cmdStr = cmdArray[0];

		var cmd = cmds.get(cmdStr);

		if(cmd != null) {
			cmd.action(message);
		}

	}
	else if(message.isMentioned(client.user)) {
		cmdArray = message.content.split(" ");
		cmd = cmds.get(cmdArray[1]);

		if(cmd != null) {
			cmd.action(message);
		}
	}
});

//Called once the bot is logged in and ready to use.
client.on("ready", function() {
	db_connect();
	console.log("Established connection to database.");
	updatePlaying();
	setInterval(updatePlaying, 600000);

	connection.query("SELECT configName, configValue FROM configs ORDER BY configID ASC", function(err, rows) {
		if(err) {
			console.error(err);
		}
		serverConfig["default"] = {};
		for(var i = 0;i < rows.length; i++) {
			serverConfig["default"][rows[i].configName] = rows[i].configValue;
			console.log("Set default '"+ rows[i].configName + "' to '" + rows[i].configValue + "'.");
		}
	});

	connection.query("SELECT serverConfig.serverId, serverConfig.value, configs.configName FROM serverConfig INNER JOIN configs on serverConfig.configId= configs.configId", function(err, rows) {
		if(err) {
			console.error(err);
		}
		for(var server of client.servers) {
			serverConfig[server.id] = {};
		}
		for(var i = 0; i < rows.length; i++) {
			serverConfig[rows[i].serverId][rows[i].configName] = rows[i].value;
		}
	});

	cmds.setUp(client, config, connection);
});

function updatePlaying() {
	connection.query("SELECT playingString FROM playing ORDER BY RAND() LIMIT 1", function(err, rows) {
		if(err) {
			console.error(err);
		}
		client.setPlayingGame(rows[0].playingString);
	});
}

//Handle a CTRL+C to actually shutdown somewhat cleanly
process.on("SIGINT", function() {
	client.logout(function(error) {
		if(error) {
			console.error(error);
		}
		process.exit(0);
	});
});

client.loginWithToken(appConfig.apikey, function(err){
	if(err) {
		console.error(err);
	}
});
