var log = require(__dirname + "/logger.js");
module.exports = {
	alias: "config",
	description: "Admin can configure bot settings",
	hidden: true,
	action: (client, message, params, config) => {
		var connection = config.connection;
		if(message.channel.permissionsOf(message.author).hasPermission("administrator")) {
			//No params or 'list'
			if(params.length == 0 || (params.length == 1 && params[0] == "list")) {
				var propList = "```\n";
				for(var prop in config.serverConfig["default"]) {
					propList = propList.concat(prop +": " + config.getServerConfig(message.server, prop) + "\n");
				}
				client.sendMessage(message.channel, propList + "```");
			}
			else if(params.length == 2) {
				//UPDATE serverConfig, configs SET serverConfig.value="£" WHERE configs.configName="cmdprefix" AND serverConfig.configID = configs.configID AND serverId=123456
				client.sendMessage(message.channel, "Working...", function(err1, msg) {
					connection.query("SELECT serverConfig.serverConfigId FROM serverConfig INNER JOIN configs on serverConfig.configId = configs.configId WHERE serverConfig.serverId=? AND configs.configName=?", [message.server.id,params[0]], function(err, rows) {
						if(err) return log.error(err);
						if(rows.length > 0) {
							connection.query("UPDATE serverConfig, configs SET serverConfig.value=? WHERE configs.configName=? AND serverConfig.configID = configs.configID  AND serverConfig.serverId=?", [params[1], params[0], message.server.id], function(err2, res) {
								if(err2) return log.error(err);
								if(res.affectedRows != 0) {
									client.updateMessage(msg, "Updated `" + params[0] + "` to `" + params[1] + "`" );
									config.serverConfig[message.server.id][params[0]] = params[1];
								}
							});
						}
						else {
							connection.query("INSERT INTO serverConfig (serverId, value, configID) VALUES (?, ?, (SELECT configs.configID FROM configs WHERE configs.configName=?))", [message.server.id, params[1], params[0]], function(err3, result2) {
								if(err3) {
									if(err3.code === "ER_BAD_NULL_ERROR") {
										return client.updateMessage(msg, "Sorry, that's an invalid config.");
									}
									else return log.error(err3);
								}
								if(result2.affectedRows != 0) {
									client.updateMessage(msg, "Updated `" + params[0] + "` to `" + params[1] + "`" );
									config.serverConfig[message.server.id][params[0]] = params[1];
								}
							});
						}
					});
				});
			}
			else {
				client.reply(message, "Check yo parameters");
			}
		}
		else {
			client.reply(message, "Bitch, you need to check yo privileges.");
		}
	}
};
