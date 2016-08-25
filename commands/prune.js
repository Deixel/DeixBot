var log = require("../logger.js");
module.exports = {
	alias: "prune",
	action: (client, message, params) => {
		client.getChannelLogs(message.channel, 50, {}, (err, msgs) => {
			if(err) log.error(err);
			var myMsgs = msgs.filter(m => m.author.equals(client.user)).slice(0, parseInt(params[0]) + 1);
			if(err) return console.error(err);
			myMsgs.map(m => client.deleteMessage(m, (err) => {if(err) log.error(err);}));
			log.info("Pruned " + myMsgs.length + " messages from " + message.channel.name);
		});
	}
};
