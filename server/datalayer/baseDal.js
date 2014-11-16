var sql = require('mssql');
var fs = require("fs-extra");
var _ = require("underscore");
var BaseModel = require("../models/BaseModel");
var logger = require('../helpers/log');
var utility = require('../helpers/utility');
// remote configs
var remoteServerCfg = fs.readJsonSync("../server_config.json").remote_server_config.configs;

var clothesgate_conn = remoteServerCfg.sqlserver_clothesgate_conn;

// https://github.com/kriskowal/q
var Q = require("q");

/**
 * executeNoneQuery
 * @param  {array} sqlParams serialized correpsonding data identity field. it will auto relace sql parameters {0}, {1}.
 * // the arguments like: e.g.  [sqlStr, parameters]
 * @return {number} return effectRow
 */
function executeNoneQuery(sqlParams) {
	// serialized the arguments to sql string.
	var sqlStr = utility.stringFormat.apply(this, sqlParams);
	var deferred = Q.defer();

	logger.debug("request sql string: `%s`", sqlStr);

	var connection = sql.connect(clothesgate_conn.value, function(err) {
		if (err) {
			logger.error("sql connection excetion: ", err);
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

function executeEntity(Constructor, sqlParams) {

	return executeNoneQuery(sqlParams).then(function success(result) {

		var _instance = new Constructor();
		// make sure that the consturcto inherits from BaseModel
		if (_instance instanceof BaseModel) {
			if (_.isArray(result) && result.length) {
				_instance = cast2Entity(result[0], _instance);
			} else {
				_instance = cast2Entity(result, _instance);
			}
			return _instance;
		} else {
			logger.warn("the model constructor `%s` must be inherits from BaseModel", Constructor.name);
		}
	});
};

function executeList(Constructor, sqlParams) {
	return executeNoneQuery(sqlParams).then(function success(result) {
		var _instance = new Constructor();
		// make sure that the consturcto inherits from BaseModel
		if (_instance instanceof BaseModel) {
			if (_.isArray(result) && result.length) {
				_instance = cast2EntityList(result, _instance);
			} else {
				_instance = cast2EntityList([result], _instance);
			}
			return _instance;
		} else {
			logger.warn("the model constructor `%s` must be inherits from BaseModel", Constructor.name);
		}
	});
};

function cast2EntityList(arrayJson, dest) {
	var result = [];
	for (var i = 0; i < arrayJson.length; i++) {
		var json = arrayJson[i];
		result.push(cast2Entity(json, dest));
	};
	return result;
};

/**
 * Cast json object into specificed instance model property.
 * @param  {json} json json object
 * @param  {object} dest Constructor instance inherits from BaseModel.
 */
function cast2Entity(json, dest) {
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
	executeEntity: executeEntity,
	executeList: executeList,
	cast2Entity: cast2Entity
};