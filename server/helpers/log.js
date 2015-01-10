// logger utilities
var winston = require('winston');
var fs = require("fs-extra");
var dateFormat = require("./dateformat");
var path = require("path");

winston.emitErrs = false;
// data provider singleton.
var dataProvider = require("../dataProvider");

var serverCfg = dataProvider.getConfig("system");

var localServerCfg = dataProvider.getConfigNode(serverCfg, "log_config");

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
			level: 'error',
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
	exitOnError: true
});
module.exports = logger;
module.exports.stream = {
	write: function(message, encoding) {
		logger.info(message);
	}
};