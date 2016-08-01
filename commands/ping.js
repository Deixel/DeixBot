module.exports = {
	alias: "ping",
	description: "It's like ping-pong, but with words!",
	hidden: false,
	action: (client, message) => {
		client.reply(message, "ponging in `" + (Date.now() - message.timestamp) + "`ms");
	}
};
