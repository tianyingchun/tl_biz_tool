/**
 * Provider base util function for all child controller.
 * @type {[type]}
 */
var _ = require("underscore");
var path = require('path');
var exception = require("../helpers/exception");
var config = require("../config")();
//  set project debug facade.
var debug = require('debug')(config.appName);

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
    } else if(config.port) {
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
    debug("getBaseUrl(): ", baseUrl);
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
                info: info,
                message: ''
            });
        } else {
            this.apiErrorOutput(res, info.error);
        }
    },
    /**
     * capture all api request, and attach response content-Type:'application/json' and other headers
     * @param  {object}   req  http request
     * @param  {object}   res  http response
     * @param  {Function} next next
     */
    setResponseHeaders: function(req, res, next) {
        res.set({
            "Content-Type": "application/json"
        });
        next();
    },
    /**
     * for all server page error
     * @param  {string} message the error message
     * @param  {object} err     the error object
     * @return {object}         the error.html page.
     */
    errorPageModel: function(message, err) {
        return {
            message: err.message || message,
            error: err
        };
    }, 
    /**
     * Get root url of current website.
     */
    getBaseUrl: function(req, queryPath) {
        return getBaseUrl(req, queryPath);
    }, 
    /**
     * Check if service invoke callback has contains error.
     * true: no error.
     *
     */
    hasPassed: function(result) {
        // has error information.
        if (result && result.failed === true) {
            return false;
        }
        return true;
    }
};
module.exports = base;