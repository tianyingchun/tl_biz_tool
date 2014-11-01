// logger utilities
var winston = require('winston');
var fs = require("fs-extra");
var dateFormat = require("./dateformat");
var path = require("path");
winston.emitErrs = true;

var serverCfg = fs.readJsonSync("../server_config.json").server;

if (serverCfg.logDir) {
	fs.ensureDirSync(serverCfg.logDir);
}
var fileName = fs.ensureFileSync(path.join(serverCfg.logDir, dateFormat(new Date(),"YYYY-MM-DD")+".log"));
var logger = new winston.Logger({
	transports: [
		new winston.transports.File({
			level: 'info',
			filename: fileName || './logs/all-logs.log',
			handleExceptions: true,
			json: true,
			maxsize: 5242880, //5MB
			maxFiles: 5,
			colorize: false
		}),
		new winston.transports.Console({
			level: 'debug',
			handleExceptions: true,
			json: false,
			colorize: true
		})
	],
	exitOnError: false
});
module.exports = logger;
module.exports.stream = {
	write: function(message, encoding) {
		logger.info(message);
	}
};