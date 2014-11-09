var sql = require('mssql');
var config = require('../config')();
var logger = require('../helpers/log');
var utility = require('../helpers/utility');
// https://github.com/kriskowal/q
var Q = require("q");

/**
 * executeNoneQuery
 * @param  {arguments} serialized correpsonding data identity field. it will auto relace sql parameters {0}, {1}.
 * // the arguments like: e.g.  (sqlStr, parameters)
 * @return {number} return effectRow
 */
function executeNoneQuery() {
	// serialized the arguments to sql string.
	var sqlStr = utility.stringFormat.apply(this, arguments);
	var deferred = Q.defer();

	logger.debug("request sql string: ", sqlStr);

	var connection = sql.connect(config.sqlserver, function(err) {
		if (err) {
			logger.error("sql connection excetion", err);
			deferred.reject(new Error(err));
		} else {
			var request = new sql.Request(connection); // or: var request = connection.request();

			request.query(sqlStr, function(err, recordset) {
				if (err) {
					deferred.reject(new Error(err));
				} else {
					deferred.resolve(recordset);
				}
			});
		}
	});
	return deferred.promise;
};

module.exports = {
	executeNoneQuery: executeNoneQuery
};