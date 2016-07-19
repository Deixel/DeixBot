var config = {};

config.apikey = "Discord API Key";

config.mysql = {};
config.mysql.host = "localhost";
config.mysql.user = "user";
config.mysql.pass= "password";
config.mysql.db = "database";

exports.appConfig = config;



var serverConfig = {};
exports.serverConfig = serverConfig;

exports.getServerConfig = function getServerConfig(server, property) {
	if(serverConfig[server.id][property] !== undefined) {
		return serverConfig[server.id][property];
	}
	else {
		return serverConfig["default"][property];
	}
};
