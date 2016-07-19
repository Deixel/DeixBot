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
	if(typeof serverConfig[server.id][property] !== undefined) {
		console.log(serverConfig[server.id][property]);
		return serverConfig[server.id][property];
	}
	else {
		console.log(server.conifg["default"][property]);
		return serverConfig["default"][property];
	}
};
