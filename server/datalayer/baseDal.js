var sql = require('mssql');
var fs = require("fs-extra");
var _ = require("underscore");
var dataProvider = require("../dataProvider");
var logger = require('../helpers/log');
var utility = require('../helpers/utility');

var BaseModel = dataProvider.getModel("BaseModel");

// remote configs
var remoteServerCfg = fs.readJsonSync("../server_config.json").remote_server_config.configs;

var clothesgate_conn = remoteServerCfg.sqlserver_clothesgate_conn;

logger.debug("DB Config: ", clothesgate_conn.value);
// https://github.com/kriskowal/q
var Q = require("q");

/**
 * Define proxy to connect sqlserver db,
 * @param  {string} sqlStr        sql Str
 * @param  {object} connectionCfg sql connection cfg object.
 * @return {promise}
 */
function _executeSql(sqlStr, connectionCfg) {
	var deferred = Q.defer();
	logger.debug("request sql string: `%s`", sqlStr);
	var connection = sql.connect(connectionCfg || clothesgate_conn.value, function(err) {
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
/**
 * executeNoneQuery
 * @param  {array} sqlParams serialized correpsonding data identity field. it will auto relace sql parameters {0}, {1}.
 * // the arguments like: e.g.  [sqlStr, parameters]
 * @return {number} return effectRow
 */
function executeNoneQuery(sqlParams) {
	if (!_.isArray(sqlParams)) {
		logger.error("executeNoneQuery sqlParams must be array type!");
	}
	// serialized the arguments to sql string.
	var sqlStr = utility.stringFormatSql.apply(this, sqlParams);
	// we need to get effectedrow while exec update, delete, add.
	sqlStr = sqlStr + ";select @@ROWCOUNT as affectedRows;";

	// return promise.
	return _executeSql(sqlStr).then(function success(result) {
		var affectedRows = result[0].affectedRows || 0;
		//delete from picture where id=4;select @@ROWCOUNT as effectRow;
		logger.debug("base dal query result: ", affectedRows);

		return affectedRows;
	});
};

/**
 * executeQuery
 * @param  {array} sqlParams serialized correpsonding data identity field. it will auto relace sql parameters {0}, {1}.
 * // the arguments like: e.g.  [sqlStr, parameters]
 * @return {number} return effectRow
 */
function executeQuery(sqlParams) {
	if (!_.isArray(sqlParams)) {
		logger.error("executeNoneQuery sqlParams must be array type!");
	}
	// serialized the arguments to sql string.
	var sqlStr = utility.stringFormatSql.apply(this, sqlParams);
	// return promise.
	return _executeSql(sqlStr);
};

function executeEntity(Constructor, sqlParams) {

	return executeQuery(sqlParams).then(function success(result) {
		// make sure that the consturcto inherits from BaseModel
		if (Constructor.prototype instanceof BaseModel) {
			if (_.isArray(result) && result.length) {
				_instance = cast2Entity(result[0], Constructor);
			} else {
				_instance = cast2Entity(result, Constructor);
			}
			return _instance;
		} else {
			logger.warn("the model constructor `%s` must be inherits from BaseModel", Constructor.name);
		}
	});
};

function executeList(Constructor, sqlParams) {
	return executeQuery(sqlParams).then(function success(result) {
		// make sure that the consturcto inherits from BaseModel
		if (Constructor.prototype instanceof BaseModel) {
			if (_.isArray(result) && result.length) {
				_instance = cast2EntityList(result, Constructor);
			} else {
				_instance = cast2EntityList([result], Constructor);
			}
			return _instance;
		} else {
			logger.warn("the model constructor `%s` must be inherits from BaseModel", Constructor.name);
		}
	});
};

function cast2EntityList(arrayJson, Constructor) {
	var result = [];
	for (var i = 0; i < arrayJson.length; i++) {
		var json = arrayJson[i];
		result.push(cast2Entity(json, Constructor));
	};
	return result;
};

/**
 * Cast json object into specificed instance model property.
 * @param  {json} json json object
 * @param  {object} dest Constructor instance inherits from BaseModel.
 */
function cast2Entity(json, Constructor) {
	var dest = new Constructor();
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