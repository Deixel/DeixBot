var winston = require("winston");
const {combine, timestamp, printf, } = winston.format;

const myFormat = printf( ({level, message, timestamp }) => {
	return `${timestamp} [${level}]: ${message}`;
});
module.exports = winston.createLogger ({
	format: combine(
		timestamp(),
		myFormat
	),
	transports: [
		new winston.transports.Console({
			level: "debug",
		}),
		new winston.transports.File({
			level: "error",
			filename: "./logs/deixbot.log",
			maxsize: 10000,
			maxFiles: 10,
			tailable: true,
		})
	]
});
