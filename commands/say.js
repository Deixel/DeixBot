module.exports = {
	alias: "say",
	description: "Words and words and words",
	hidden: true,
	action: (client, message, params) => {
		client.sendMessage(message.channel, params.join(" "));
		client.deleteMessage(message);
	}
};
