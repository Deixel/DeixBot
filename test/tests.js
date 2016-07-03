var assert =  require("chai").assert;
var cmds = require("../commands/commands");

function Command(cmd, descr, action, hidden = false) {
	this.cmd = cmd;
	this.description = descr;
	this.action = action;
	this.hidden = hidden;
	//commands[cmd]=this;
}

describe("Command", function() {
	describe("#get()", function() {
		it("should return null if command doesn't exist", function() {
			assert.equal(null, cmds.get("test"));
		});
		it("should return a command if command exists", function() {
			assert.typeOf(cmds.get("ping"), Command);
		});
	});
});
