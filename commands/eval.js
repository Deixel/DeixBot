module.exports = {
	alias: "eval",
	description: "Run some code",
	hidden: true,
	action: (client, message, params, config) => {
		//TODO Remove hardcoded ID
		if(message.author.id === config.appConfig.ownerid){
			var vm = require("vm");
			params = params.join(" ");
			var benchmark = Date.now();
			var result;
			//TODO is VM needed? Will eval() do?
			var context = {
				message: message,
				client: client,
				console: console
			};
			try {
				result = vm.runInNewContext(params, context);
			}
			catch(error) {
				result = error;
			}
			benchmark = Date.now() - benchmark;
			client.sendMessage(message.channel, "```js\n" + params + "\n--------------------\n" + result + "\n--------------------\n" + "in " + benchmark + "ms```");
		}
		else {
			client.sendMessage(message.channel, ":no_entry: **Permission Denied** :no_entry:");
		}
	}
};