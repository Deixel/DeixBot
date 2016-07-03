var assert =  require("chai").assert;
var cmds = require("../commands/commands");


describe("Command", function() {
	describe("#get()", function() {
		it("should return null if command doesn't exist", function() {
			assert.equal(null, cmds.get("test"));
		});
		var pingCmd =  cmds.get("ping");
		it("should return a command if command exists", function() {
			assert.property(pingCmd, "description");
		});
		it("should return the correct command.", function() {
			assert.notEqual(pingCmd.description, "Assigns blame appropriately");
			assert.equal(pingCmd.description, "It's like ping-pong, but with words.");
		});


	});
});
