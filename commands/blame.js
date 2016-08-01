module.exports = {
	alias: "blame",
	description: "Assigns blame appropriately",
	hidden: false,
	action: (client, message, params) => {
		var responsible = params.length > 0 ? params.join(" ") : "Yury";
		client.sendMessage(message.channel, "I blame " + responsible);
		client.deleteMessage(message);
	}
};
