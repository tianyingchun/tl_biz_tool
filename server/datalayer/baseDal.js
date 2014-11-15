var sql = require('mssql');
var fs = require("fs-extra");
var logger = require('../helpers/log');
var utility = require('../helpers/utility');
// remote configs
var remoteServerCfg = fs.readJsonSync("../server_config.json").remote_server_config.configs;

var clothesgate_conn = remoteServerCfg.sqlserver_clothesgate_conn;

// https://github.com/kriskowal/q
var Q = require("q");

var toString = Object.prototype.toString;

var isObject = function(obj) {
	return toString.call(obj) === "[object Object]";
}
var isArray = function(obj) {
	return toString.call(obj) === "[object Array]";
}

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

	var connection = sql.connect(clothesgate_conn.value, function(err) {
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

function cast2Entity(json, constructor) {
	var dest = new constructor();
	var toString = Object.prototype.toString;
	if (typeof json === "undefined" || toString.call(json) !== "[object Object]") {
		return dest;
	}
	for (var i in json) {
		if (dest.hasOwnProperty(i)) {
			dest[i] = json[i];
		}
	}
	return dest;
};

module.exports = {
	executeNoneQuery: executeNoneQuery,
	cast2Entity: cast2Entity
};