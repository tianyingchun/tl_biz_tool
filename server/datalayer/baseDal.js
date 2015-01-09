var _ = require("underscore");
var sql = require("mssql");
// https://github.com/kriskowal/q
var Q = require("q");

var dataProvider = require("../dataProvider");
var logger = require('../helpers/log');
var utility = require('../helpers/utility');

var BaseModel = dataProvider.getModel("BaseModel");

// get current context database configs
var clothesgate_conn = dataProvider.getConfigNode("context", "db_config", "db_clothesgate_config");

logger.debug("DB Config: ", clothesgate_conn);

// while sql connection failed, retryTime.
var retryTime = 0;
/**
 * Parepare sql parameters using built-in with SQL injection protection.
 * @param  {object} request new sql.Request()
 * @param  {array} sqlData  [sqlstring, parameters]
 * @return {string}         serilized sql command string.
 */
function _prepareSqlParameters(request, sqlData) {
    // get prepared sql command string.
    var preparedSql = utility.stringFormatSql(function(idx, item) {
        var _paramKey = "param" + idx;
        // https://github.com/patriksimek/node-mssql
        // support customized sql datatype. ["VarBinary",value]
        if (_.isArray(item)) {
            var sqlType = sql[item[0]];
            var sqlVal = item[1];
            switch (item[0]) {
                // for decimal keep 2.33.
                // request.input("Price", sql.Decimal(10, 2), 155.33);
                case "Decimal":
                    sqlType = sql["Decimal"](10, 2);
                    sqlVal = parseFloat(sqlVal);
                    break;
            }
            this.input(_paramKey, sqlType, sqlVal);
        } else {
            this.input(_paramKey, item);
        }
        return "@" + _paramKey;
    }, request, sqlData);

    return preparedSql;
};
/**
 * Define proxy to connect sqlserver db,
 * @param  {array} sqlParams  required [sqlstring, parameters]
 * @param  {string} queryType required sql query type: [executeNoneQuery, executeQuery, executeEntity,executeList]
 * @param  {object} connectionCfg optional: sql connection cfg object.
 * @return {promise}
 */
function _executeSql(sqlParams, queryType, connectionCfg) {
    var deferred = Q.defer();

    // callback(err, connection), if has err, connect is undefined.
    function _sqlConnection(callback) {
        try {
            var connection = sql.connect(connectionCfg || clothesgate_conn, function(err) {
                if (err) {
                    logger.error("sql connection excetion: ", err);
                    switch (err.code.toUpperCase().trim()) {
                        //Socket error. retry once.
                        case "ESOCKET":
                        case "ETIMEOUT":
                            // time ++;
                            retryTime++;
                            logger.warn("retry sql.connection times: ", retryTime);
                            if (retryTime < 3) {
                                _sqlConnection(callback);
                                return;
                            } else {
                                callback(err);
                            }
                            break;
                    }
                    callback(err);
                } else {
                    // reset retryTime while connect successfully!
                    retryTime = 0;
                    callback(null, connection);
                }
            });
        } catch (ex) {
            retryTime++;
            logger.error("sql connection excetion occurs: then retry again ", ex);
            logger.warn("retry sql.connection times: ", retryTime);
            _sqlConnection(callback);
            return;
        }
    };
    _sqlConnection(function(err, connection) {
        if (err) {
            logger.error("sql connection excetion in _sqlConnection(): ", err);
            deferred.reject(err);
        } else {
            var request = new sql.Request(connection); // or: var request = connection.request();

            var sqlStr = _prepareSqlParameters(request, sqlParams);
            // remove last `;`
            var _len = sqlStr.length - 1;

            if (sqlStr[_len] == ";") {
                sqlStr = sqlStr.slice(0, _len);
            }
            // special deal for specificed query type.
            switch (queryType) {
                // for `executeNoneQuery` we add ROWCOUNT as return affectedRows.
                case "executeNoneQuery":
                    sqlStr = sqlStr + ";select @@ROWCOUNT as affectedRows;";
                    break;
            }

            logger.debug("sql command string: `%s` | parameter counts: `%s`", sqlStr, sqlParams.length - 1);

            request.query(sqlStr, function(err, recordset) {
                if (err) {
                    deferred.reject(err);
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
    // return promise.
    return _executeSql(sqlParams, "executeNoneQuery").then(function success(result) {

        var affectedRows = result[0].affectedRows || 0;
        //delete from picture where id=4;select @@ROWCOUNT as effectRow;
        logger.debug("executeNoneQuery() affectedRows: ", affectedRows);

        return affectedRows;
    });
};

/**
 * executeQuery
 * @param  {array} sqlParams serialized correpsonding data identity field. it will auto relace sql parameters {0}, {1}.
 * // the arguments like: e.g.  [sqlStr, parameters]
 * @return {number} return effectRow
 */
function executeQuery(sqlParams, queryType) {

    if (!_.isArray(sqlParams)) {
        logger.error("executeNoneQuery sqlParams must be array type!");
    }
    // return promise.
    return _executeSql(sqlParams, queryType || "executeQuery");
};

function executeEntity(Constructor, sqlParams) {

    return executeQuery(sqlParams, "executeEntity").then(function success(result) {
        var _instance = null;
        // make sure that the consturcto inherits from BaseModel
        if (result && Constructor.prototype instanceof BaseModel) {
            if (_.isArray(result) && result.length) {
                _instance = cast2Entity(result[0], Constructor);
            }
        } else {
            logger.warn("the model constructor `%s` must be inherits from BaseModel", Constructor.name);
        }
        return _instance;
    });
};

function executeList(Constructor, sqlParams) {

    return executeQuery(sqlParams, "executeList").then(function success(result) {
        var _instance = null;
        // make sure that the consturcto inherits from BaseModel
        if (result && Constructor.prototype instanceof BaseModel) {
            if (_.isArray(result) && result.length) {
                _instance = cast2EntityList(result, Constructor);
            }
        } else {
            logger.warn("the model constructor `%s` must be inherits from BaseModel", Constructor.name);
        }
        return _instance;
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

/**
 * Directly get simple promise
 * @param  {object} err  error, if err==null, return correct promise. we ignore second parameter.
 * @param  {object} results, if err==null, we deal with results.
 * @return {promise}
 */
function promise(err, results) {
    var deferred = Q.defer();
    // has error here.
    if (err) {
        deferred.reject(err);
    } else {
        deferred.resolve(results);
    }
    return deferred.promise;
};

module.exports = {
    executeNoneQuery: executeNoneQuery,
    executeEntity: executeEntity,
    executeList: executeList,
    cast2Entity: cast2Entity,
    promise: promise,
    buildResultMessages: utility.buildResultMessages
};