module.exports = {
	alias: "ge",
	description: "Search the RuneScape Grand Exchange for an item",
	hidden: false,
	action: (client, message, params) => {
		if(params.length > 0) client.sendMessage(message.channel, "http://services.runescape.com/m=itemdb_rs/results?query=" + params.join("+"));
		else client.reply(message, "You need to specify an item!");
	}
};
