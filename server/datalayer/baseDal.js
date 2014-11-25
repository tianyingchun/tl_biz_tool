var _ = require("underscore");
var sql = require("mssql");
// https://github.com/kriskowal/q
var Q = require("q");

var dataProvider = require("../dataProvider");
var logger = require('../helpers/log');
var utility = require('../helpers/utility');

var BaseModel = dataProvider.getModel("BaseModel");

// get current context database configs
var contextCfg = dataProvider.getConfig("context");

var clothesgate_conn = dataProvider.getConfigNode(contextCfg, "db_config", "db_clothesgate_config");

logger.debug("DB Config: ", clothesgate_conn);

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
        this.input(_paramKey, item);
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
    var connection = sql.connect(connectionCfg || clothesgate_conn, function(err) {
        if (err) {
            logger.error("sql connection excetion: ", err);
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

            logger.debug("request sql string: `%s` | parameter counts: `%s`", sqlStr, sqlParams.length - 1);

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
            } else {
                _instance = cast2Entity(result, Constructor);
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
            } else {
                _instance = cast2EntityList([result], Constructor);
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

module.exports = {
    executeNoneQuery: executeNoneQuery,
    executeEntity: executeEntity,
    executeList: executeList,
    cast2Entity: cast2Entity
};
