// logger utilities
var winston = require('winston');
var fs = require("fs-extra");
var dateFormat = require("./dateformat");
var path = require("path");
winston.emitErrs = true;

var localServerCfg = fs.readJsonSync("../server_config.json").local_server_config.configs;

var logdir = localServerCfg.logdir && localServerCfg.logdir.value || "./logs";

if (logdir) {
	fs.ensureDirSync(logdir);
}
// make log files with current day.
var _filename = path.join(logdir, dateFormat(new Date(), "YYYY-MM-DD") + ".log");

fs.ensureFileSync(_filename);

var logger = new winston.Logger({
	transports: [
		new winston.transports.File({
			level: 'info',
			filename: _filename || './logs/all-logs.log',
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