var assert =  require("chai").assert;
var cmds = require("../commands/commands");


describe("Commands", function() {
	describe("get()", function() {
		it("should return null if command doesn't exist", function() {
			assert.equal(null, cmds.get("test"));
		});

		it("should return a command if command exists", function() {
			var pingCmd =  cmds.get("ping");
			assert.property(pingCmd, "cmd");
			assert.property(pingCmd, "description");
			assert.property(pingCmd, "action");
			assert.property(pingCmd, "hidden");
		});
		it("should return the correct command.", function() {
			var blameCmd = cmds.get("blame");
			assert.equal(blameCmd.description, "Assigns blame appropriately");
			assert.notEqual(blameCmd.description, "It's like ping-pong, but with words.");
		});
		it("hidden commands should have a hidden property", function() {
			var configCmd = cmds.get("config");
			assert.equal(configCmd.hidden, true);
		});
		it("visible commands should not have a hidden property", function() {
			var geCmd = cmds.get("ge");
			assert.equal(geCmd.hidden, false);
		});
	});
});
