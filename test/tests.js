var assert =  require("chai").assert;
var cmds = require("../commands/commands");

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
}

var config = {};
config.cmdprefix = "!";
config.col = "0.25";

describe("Commands", function() {
	var client = new Client();
	before(function() {
		cmds.setUp(client, config, null);
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
		it("should fail", function() {
			assert.fail(true, false);
		});
	});
	describe("hs", function() {
		it("should fail", function() {
			assert.fail(true, false);
		});
	});
	describe("sb", function() {
		it("should fail", function() {
			assert.fail(true, false);
		});
	});
	describe("config", function() {
		it("should fail", function() {
			assert.fail(true, false);
		});
	});
	describe("botissues", function() {
		it("should fail", function() {
			assert.fail(true, false);
		});
	});
	describe("report", function() {
		it("should fail", function() {
			assert.fail(true, false);
		});
	});
	describe("say", function() {
		it("should fail", function() {
			assert.fail(true, false);
		});
	});
	describe("help", function() {
		it("should fail", function() {
			assert.fail(true, false);
		});
	});
});
