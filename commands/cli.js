module.exports = {
	alias: "cli",
	description: "Run a terminal command",
	hidden: true,
	action: (client, message, params) => {
		//TODO Remove hardcoded ID
		if(message.author.id === "113310775887536128") {
			var exec = require("child_process").exec;
			params = params.join(" ");
			var benchmark = Date.now();
			exec(params, {timeout: 5000}, function(error, stdout, stderr) {
				if(error) {
					console.error(error);
				}
				benchmark = Date.now() - benchmark;
				client.sendMessage(message.channel, "```bash\n" + params + "\n--------------------\n" + stdout + stderr + "\n--------------------\nin " + benchmark + "ms```");
			});
		}
		else {
			client.sendMessage(":no_entry: **Permission Denied** :no_entry:");
		}
	}
};
