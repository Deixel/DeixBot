/*
cmd - what the user types, sans prefix
description - meaningful description, for use with help
action - what the command does
*/

var commands = {};
exports.commands = commands;

function Command(cmd, descr, action) {
	this.cmd = cmd;
	this.description = descr;
	this.action = action;
	commands.push(this);
	console.log(cmd, descr, action)
}

function getParams(content) {
	return content.split(" ").shift();
}

new Command(
	"ping",
	"It's like ping-pong, but with words.",
	function(message) {
		client.reply(message, "pong");
	}
);

new Command(
		"blame",
		"Assigns blame appropriately",
		function(message) {
			client.sendMessage(message.channel, "I blame Yury");
		}
);

new Command(
		"ge",
		"Search the RuneScape Grand Exchange for an item",
		function(message) {
			var item = getParams(message.content).join().replace(/,/g, "+");
			client.sendMessage(message.channel, "http://services.runescape.com/m=itemdb_rs/results?query=" + item);
		}
);
