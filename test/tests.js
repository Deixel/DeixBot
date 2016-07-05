var assert =  require("chai").assert;
var cmds = require("../commands/commands");
var mysql = require("mysql");
var configFile = require("../config");

function Message(id, channel, author, contents) {
	this.id = id;
	this.channel = channel;
	this.author = author;
	this.content = contents;
}

function Client() {
	this.replies = [];
	this.messages = [];
	this.sendMessage = function(channel, message) {
		this.messages[this.messages.length] = message;
	};
	this.reply = function(message, reply) {
		this.replies[this.replies.length] = reply;
	};
	this.deleteMessage = function() {
		//Do nothing
	};
}

function Channel() {
	this.name = "general";
	this.permissionsOf = function(user) {
		return new Permissions(user);
	};
}

function Permissions(user) {
	this.user = user;
	this.hasPermission = function(perm) {
		if(perm == "administrator" && user == "Deixel") {
			return true;
		}
		else {
			return false;
		}
	};
}

var config = {};
config.cmdprefix = "!";
config.col = "0.25";

describe("Commands", function() {
	var client = new Client();
	before(function() {
		var db_config = {
			host: configFile.mysql.host,
			user: configFile.mysql.user,
			password: configFile.mysql.pass,
			database: configFile.mysql.db
		};
		var connection = mysql.createConnection(db_config);
		connection.connect();


		cmds.setUp(client, config, connection);
	});
	describe("get()", function() {
		it("should return null if command doesn't exist", function() {
			assert.equal(null, cmds.get("test"));
		});

		it("should return a command if command exists", function() {
			var pingCmd =  cmds.get("ping");
			assert.isObject(pingCmd);
			assert.property(pingCmd, "cmd");
			assert.property(pingCmd, "description");
			assert.isFunction(pingCmd.action);
			assert.property(pingCmd, "hidden");
		});
		it("should return the correct command.", function() {
			var blameCmd = cmds.get("blame");
			assert.propertyVal(blameCmd, "description", "Assigns blame appropriately");
			assert.propertyNotVal(blameCmd, "description", "It's like ping-pong, but with words.");
		});
		it("hidden commands should have a hidden property", function() {
			var configCmd = cmds.get("config");
			assert.isTrue(configCmd.hidden);
		});
		it("visible commands should not have a hidden property", function() {
			var geCmd = cmds.get("ge");
			assert.isFalse(geCmd.hidden);
		});
	});
	describe("ping", function() {
		var pingCmd = cmds.get("ping");
		it("should reply with 'pong'", function() {
			var pingMsg = new Message(1, "general", "Deixel", "!ping");
			pingCmd.action(pingMsg);
			assert.equal(client.replies[client.replies.length-1], "pong");
		});
	});
	describe("blame", function() {
		var blameCmd = cmds.get("blame");
		it("should blame Yury when no parameters are set", function() {
			var blameMsg = new Message(1, "general", "Deixel", "!blame");
			blameCmd.action(blameMsg);
			assert.equal(client.messages[client.messages.length-1], "I blame Yury");
		});
		it("should blame a specified string if given", function() {
			var blameMsg = new Message(1, "general", "Deixel", "!blame potato");
			blameCmd.action(blameMsg);
			assert.equal(client.messages[client.messages.length-1], "I blame potato");
		});
	});
	describe("ge", function() {
		var geCmd = cmds.get("ge");
		it("should reply with an error if no item is specified", function() {
			var geMsg = new Message(1, "general", "Deixel", "!ge");
			geCmd.action(geMsg);
			assert.equal(client.replies[client.replies.length-1], "You need to specify an item");
		});
		it("should send a message with the right link if an item is specified", function() {
			var geMsg = new Message(1, "general", "Deixel", "!ge frost dragon");
			geCmd.action(geMsg);
			assert.equal(client.messages[client.messages.length-1], "http://services.runescape.com/m=itemdb_rs/results?query=frost+dragon");
		});
	});
	describe("hs", function() {
		var hsCmd = cmds.get("hs");
		it("should reply with an error if no player is specified", function() {
			var hsMsg = new Message(1, "general", "Deixel", "!hs");
			hsCmd.action(hsMsg);
			assert.equal(client.replies[client.replies.length-1], "You need to specify a player");
		});
		it("should send a message when the right link if a player is specified", function() {
			var hsMsg = new Message(1, "general", "Deixel", "!hs schnee");
			hsCmd.action(hsMsg);
			assert.equal(client.messages[client.messages.length-1], "http://services.runescape.com/m=hiscore/compare?user1=schnee");
		});
	});
	//TODO Add tests for soundboard
	describe("config", function() {
		var configCmd = cmds.get("config");
		it("should reply with an error if the user doesn't have permission", function() {
			var configMsg = new Message(1, new Channel(), "Schnee", "!config cmdprefix |");
			var oldPrefix = config.cmdprefix;
			configCmd.action(configMsg);
			assert.equal(client.replies[client.replies.length-1], "*sticks fingers in ears* lalala I'm not listening!");
			assert.propertyVal(config, "cmdprefix", oldPrefix);
			assert.propertyNotVal(config, "cmdprefix", "|");
		});
		it("should reply with a message and update the config if everything is approved", function() {
			var configMsg = new Message(1, new Channel(), "Deixel", "!config cmdprefix |");
			var oldPrefix = config.cmdprefix;
			configCmd.action(configMsg);
			assert.equal(client.replies[client.replies.length-1], "Updated config");
			assert.propertyNotVal(config, "cmdprefix", oldPrefix);
			assert.propertyVal(config, "cmdprefix", "|");
		});
	});
	describe("report", function() {
		var reportCmd = cmds.get("report");
		it("should send an error if no parameters are given", function() {
			var reportMsg = new Message(1, "general", "Deixel", "!report");
			reportCmd.action(reportMsg);
			assert.equal(client.messages[client.messages.length-1], "Deixel doesn't know how reporting works!");
		});
		it("should send an error if 1 parameter is given", function() {
			var reportMsg = new Message(1, "general", "wof1037", "!report Schnee");
			reportCmd.action(reportMsg);
			assert.equal(client.messages[client.messages.length-1], "wof1037 doesn't know how reporting works!");
		});
		it("should send a report message if all parameters are given", function() {
			var reportMsg = new Message(1, "general", "Shotgun", "!report wof1037 Dirty Hax0r");
			reportCmd.action(reportMsg);
			assert.equal(client.messages[client.messages.length-1], "Shotgun has reported wof1037. Reason: Dirty Hax0r");
		});
	});
	describe("say", function() {
		var sayCmd = cmds.get("say");
		it("should send a message containing any parameters", function() {
			var sayMsg = new Message(1, "general", "Deixel", "!say MAARK NUTT");
			sayCmd.action(sayMsg);
			assert.equal(client.messages[client.messages.length-1], "MAARK NUTT");
		});
	});
	describe("text", function() {
		var textCmd = cmds.get("text");
		it("should send a error message if the tag isn't recognised", function() {
			var textMsg = new Message(1, "general", "Deixel", "!text potato");
			textCmd.action(textMsg, function() {
				assert.equal(client.messages[client.messages.length-1], "404: Message not found.");
			});
		});
		it("should return the appropriate message if the tag is found", function() {
			var textMsg = new Message(1, "general", "Deixel", "!text issues");
			textCmd.action(textMsg, function() {
				assert.equal(client.messages[client.messages.length-1], "https://github.com/Deixel/DeixBot/issues");
			});

		});
	});
});
