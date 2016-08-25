var config = {};

config.ownerid = "Owner's User ID";
config.apikey = "Discord API Key";
config.searchid = "Google Custom Search Key";
config.googleapi = "Google API Key";

config.mysql = {};
config.mysql.host = "localhost";
config.mysql.user = "user";
config.mysql.pass= "password";
config.mysql.db = "database";

exports.appConfig = config;



var serverConfig = {};
exports.serverConfig = serverConfig;

exports.getServerConfig = function getServerConfig(server, property) {
	if(serverConfig[server.id] !== undefined && serverConfig[server.id][property] !== undefined) {
		return serverConfig[server.id][property];
	}
	else {
		return serverConfig["default"][property];
	}
};