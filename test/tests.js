var assert =  require("chai").assert;
var cmds = require("../commands/commands");

describe("Command", function() {
	describe("#get()", function() {
		it("should return null if command doesn't exist", function() {
			assert.equal(null, cmds.get("test"));
		});
		it("should not return a command if command exists", function() {
			assert.typeOf(cmds.get("ping"), Command);
		});
	});
});
