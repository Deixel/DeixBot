var config = {};

config.ownerid = '113310775887536128';
config.apikey = 'Bot MTkwNjM4NzMxNTIxMjk0MzQ2.CjxMUg.1qAK1KMw-bVlr026QPsKLl2lOI0';
config.searchid = "014643218746883041398:ihe61ot95-a";
config.googleapi = "AIzaSyCJqKshhvDf_twy1-IPpGJZpRVtijE84GQ";
config.games = [];

config.mysql={}
config.mysql.host = 'localhost';
config.mysql.user = 'deixbot';
config.mysql.password = 'hnuInOlrg9c3MFOk';
config.mysql.database = 'deixbot';

exports.appConfig = config;

var serverConfig = {};
exports.serverConfig = serverConfig;

exports.getServerConfig = function getServerConfig(server, property) {
	if(server !== undefined && serverConfig[server.id][property] !== undefined) {
		return serverConfig[server.id][property];
	}
	else {
		return serverConfig["default"][property];
	}
};
