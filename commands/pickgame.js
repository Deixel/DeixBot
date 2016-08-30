module.exports = {
	alias: "pickgame",
	description: "Can't decide what game to pick?",
	hidden: false,
	action: (client, message, params, config) => {
		var games = config.appConfig.games;
		if(params.length >= 1) {
			if(params[0] === "list") {
				client.sendMessage(message.channel, games.length == 0 ? "No games in list" : games.join());
			}
			else if(params[0] === "add") {
				params.shift();
				let gameToAdd = params.join(" ");
				games.push(gameToAdd);
				client.sendMessage(message.channel, "Added `" + gameToAdd + "` to the list");
			}
			else if(params[0] === "remove") {
				params.shift();
				let gameToRemove = params.join(" ");
				let index = games.indexOf(gameToRemove);
				if(index > -1) {
					games.splice(index, 1);
					client.sendMessage(message.channel, "Removed `" + gameToRemove + "` from the list.");
				}
				else {
					client.sendMessage(message.channel, "`" + gameToRemove + "` is not in the list.");
				}
			}
		}
		else {
			if(games.length > 0) {
				client.sendMessage(message.channel, "AND THE WINNER IS: `" + games[parseInt(Math.random() * games.length)] + "`!");
			}
			else  {
				client.sendMessage(message.channel, "No games available!");
			}
		}
	}
};
