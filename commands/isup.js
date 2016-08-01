module.exports = {
	alias: "isup",
	description: "Check whether a site is down or not",
	hidden: false,
	action: (client, message, params) => {
		client.updateMessage(message, "http://www.isup.me/" + params[0]);
	}
};
