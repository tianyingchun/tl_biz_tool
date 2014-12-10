/**
 * Provider base util function for all child controller.
 * @type {[type]}
 */
var _ = require("underscore");
var path = require('path');
var exception = require("../helpers/exception");
var config = require("../config/index")();
var logger = require("../helpers/log");
/**
 * Get application base url
 * @param  {request} req       http request
 * @param  {quer} queryPath query path  'order/list' -->http://baidu.com:10/virtual/order/list
 */
var getBaseUrl = function(req, queryPath) {
    var rootPath = [req.host.toString()];
    // for local environment.
    if (config.mode != 'production' && config.port) {
        rootPath.push(":" + config.port);
    } else if (config.nginxPort) {
        // if public access url has port number eg. ngix server. (10.x.x.x:8082--->localhost:3000)
        // we need to set baseurl port.
        rootPath.push(":" + config.nginxPort);
    } else if (config.port) {
        rootPath.push(":" + config.port);
    }
    if (config.virtualDir) {
        rootPath.push("/" + config.virtualDir);
    }
    if (queryPath) {
        rootPath.push("/" + queryPath);
    }
    // return
    var baseUrl = req.protocol + "://" + path.normalize(rootPath.join(""));
    logger.debug("getBaseUrl(): ", baseUrl);
    return baseUrl;
};
var base = {
    name: "base",
    mixin: function(source, target) {
        return _.extend(source || {}, target);
    },
    /**
     * Out api error message format
     * @param  {response} res
     * @param  {object} the Error instance.
     */
    apiErrorOutput: function(res, error) {
        if (_.isString(error)) {
            error = new Error(error);
        }
        if (error && error.error) {
            error = error.error;
        }
        exception.writeJSONError(res, error);
    },
    /**
     * Output successed json information to client
     */
    apiOkOutput: function(res, info) {
        if (this.hasPassed(info)) {
            res.json({
                retCode: 1,
                info: _.isUndefined(info) ? null : info,
                message: ''
            });
        } else {
            this.apiErrorOutput(res, info.error);
        }
    },
    hasPassed: function(result) {
        // has error information.
        if (result && result.failed === true) {
            return false;
        }
        return true;
    },
    /**
     * capture all api request, and attach response content-Type:'application/json' and other headers
     * @param  {object}   req  http request
     * @param  {object}   res  http response
     * @param  {Function} next next
     */
    setResponseHeaders: function(req, res, next) {
        if (res) {
            res.set({
                "Content-Type": "application/json"
            });
        }
        if (next) next();
    },
    getErrorModel: function(code, message) {
        var _error = {
            status: code || 500,
            message: message || ''
        };
        return exception.getErrorModel(_error);
    },
    /**
     * Get root url of current website.
     */
    getBaseUrl: function(req, queryPath) {
        return getBaseUrl(req, queryPath);
    }
};
module.exports = base;