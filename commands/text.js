var log = require("../logger.js");
module.exports = {
	alias: "text",
	"description": "Quickly print some saved text",
	hidden: false,
	action: (client, message, params, config, cb) => {
		var connection = config.connection;
		if(params.length == 0 || (params.length > 0 && params[0] === "list")) {
			connection.query("SELECT alias FROM quicktext", function(err, rows) {
				if(err) {
					return log.error(err);
				}
				var textList = "";
				for(var i = 0; i < rows.length; i++) {
					textList = textList.concat(rows[i].alias + " ");
				}
				client.sendMessage(message.channel, textList);
			});
		}
		else if(params.length > 0) {
			if(params[0] === "add") {
				var newText = {};
				client.awaitResponse(message, "What tag would you like to add " + message.author + "?", function(err, msg1) {
					if(err) {
						return log.error(err);
					}
					newText.alias = msg1.content;
					connection.query("SELECT alias FROM quicktext WHERE alias = ?", [newText.alias], function(err, rows) {
						if(err) {
							return log.error(err);
						}
						if(rows.length != 0) {
							client.sendMessage(message.channel, "Sorry, that tag already exists.");
						}
						else {
							client.awaitResponse(msg1, "And what should `" + newText.alias +"` display?", function(err, msg2) {
								if(err) {
									return log.error(err);
								}
								newText.contents = msg2.content;
								connection.query("INSERT INTO quicktext SET ?", newText, function(err) {
									if(err) {
										return log.error(err);
									}
									client.reply(msg2, "Added `" + newText.alias + "`");
								});
							});
						}
					});

				});
			}
			else {
				connection.query("SELECT contents FROM quicktext WHERE alias = ?", params[0], function(err, rows) {
					if(err) {
						return log.error(err);
					}
					if(rows.length == 0) {
						client.sendMessage(message.channel, "404: Message not found.");
					}
					else {
						client.sendMessage(message.channel, rows[0].contents);
					}
					//Pretty much only used for testing
					if(cb != null)	{
						cb();
					}
				});
			}
		}
	}
};
