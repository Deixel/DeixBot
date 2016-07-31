module.exports = {
	alias: "img",
	description: "Search for an image on google",
	hidden: false,
	action: (client, message, params, config) => {
		var request = require("request");
		if(params.length > 0) {
			request("https://www.googleapis.com/customsearch/v1?key=" + config.appConfig.googleapi + "&cx=" + config.appConfig.searchid + "&q=" + params.join("+") + "&searchType=image&alt=json&num=10&start=1", function(err, res, body) {
				var data;
				try {
					data = JSON.parse(body);
				}
				catch(error) {
					console.error(error);
				}
				if(!data) {
					console.log(data);
					return client.message("Error");
				}
				else if(!data.items || data.items.length == 0) {
					console.log(data);
					return client.sendMessage(message.channel, "No results found");
				}
				else {
					var result = data.items[Math.floor(Math.random()*10)];
					client.sendMessage(message.channel, result.link);
				}
			});
		}
	}
};
