module.exports = {
	alias: "report",
	description: "Report them hax0rz",
	hidden: false,
	action: (client, message, params) => {
		if(params.length > 1) {
			var hax0r = params.shift();
			var reason = params.join(" ");
			var report = message.author + " has reported " + hax0r + ". Reason: " + reason;
			client.sendMessage(message.channel, report);
		}
		else client.sendMessage(message.channel, message.author + " doesn't know how reporting works!");
		client.deleteMessage(message);
	}
};
