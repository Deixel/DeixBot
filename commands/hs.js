module.exports = {
	alias: "hs",
	description: "Search the RuneScape High Scores for a player",
	hidden: false,
	action: (client, message, params) => {
		if(params.length > 0) {
			client.sendMessage(message.channel, "Loading...", function(err, msg) {
				var player = params.join("_");
				var http = require("http");
				http.get("http://services.runescape.com/m=hiscore/index_lite.ws?player=" + player, function(res) {
					res.setEncoding("utf8");
					var hsRaw = "";
					res.on("data", function(d) {
						hsRaw = hsRaw.concat(d);
					});
					res.on("end", function() {
						var numSkills = 27;
						var skillRaw = hsRaw.split("\n");
						var skillNames = require("../resources/rs-skill-names");
						var output = "";
						for(var i = 0; i <= numSkills; i++) {
							var sTemp = skillRaw[i].split(",");
							output = output.concat(skillNames[i] + ": " + sTemp[2] + " (" + sTemp[1] + ")\n");
						}
						client.updateMessage(msg, "**" + player + "'s Skills**\n```Javascript\n" + output + "```");
					});
				});
			});
		}
		else client.reply(message, "You need to specify a player!");
	}
};
