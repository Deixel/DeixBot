module.exports = {
	alias: "lmgtfy",
	description: "Generate a LMGTFY link",
	hidden: false,
	action: (client, message, params) => {
		client.updateMessage(message, "<http://lmgtfy.com/?q=" + params.join("+") + ">");
	}
};
