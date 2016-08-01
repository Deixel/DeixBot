module.exports = {
	alias: "about",
	description: "About me!",
	hidden: false,
	action: (client, message) => {
		var calc = client.uptime / 1000;
		var secs = Math.floor(calc % 60);
		calc /= 60;
		var mins = Math.floor(calc % 60);
		calc /= 60;
		var hours = Math.floor(calc % 24);
		calc = Math.floor(calc / 24);
		var upFor = calc + " day" + ((calc == 1)?" ":"s ") + hours + " hour" + ((hours == 1)?" ":"s ") + mins + " min" + ((mins == 1)?" ":"s ") + secs + " sec" + ((secs == 1)?" ":"s ");

		var aboutMsg = "**"+client.user.username+"**\n\
		__About Me__\n\
		**ID:** " + client.user.id +"\n\
		**Playing:** " + ((client.user.game != null) ? client.user.game.name : "Nothing") + "\n\
		**On:** " + client.servers.length + " server"+ ((client.servers.length == 1) ? "" : "s") +"\n\
		**Up Since:** " + new Date(client.readyTime).toUTCString() + " - " + upFor + "\n\
		**Version:** " + require("../package.json").version + "\n\
		__Creator__\n\
		**Name:** <@113310775887536128> \n\
		**Website:** <http://www.deixel.co.uk>\n\
		**Source:** <https://github.com/Deixel/DeixBot>\n\
		__Dev__\n\
		**Language:** Node.JS\n\
		**Library:** Discord.js (<https://github.com/hydrabolt/discord.js/>)\n";
		client.sendMessage(message.channel, aboutMsg);
	}
};
