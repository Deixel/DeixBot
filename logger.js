var winston = require("winston");
var dateFormat = require("dateformat");
module.exports = new winston.Logger ({
	transports: [
		new winston.transports.Console({
			timestamp: function() {
				var now = new Date();
				return dateFormat(now, "yyyy-mm-dd HH:MM:ss");
			},
			level: "debug",
			json: false,
			colorize: true,
			prettyPrint: true
		}),
		new winston.transports.File({
			timestamp: function() {
				var now = new Date();
				return dateFormat(now, "yyyy-mm-dd HH:MM:ss");
			},
			level: "info",
			filename: "./logs/deixbot.log",
			maxSize: 100000,
			maxFiles: 10,
			json: false,
			prettyPrint: true,
			tailable: true
		})
	]
});
