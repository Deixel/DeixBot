var assert =  require("chai").assert;
var cmds = require("../commands/commands");


describe("Commands", function() {
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
		it("should fail", function() {
			assert.fail(true, false);
		});
	});
	describe("blame", function() {
		it("should fail", function() {
			assert.fail(true, false);
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
