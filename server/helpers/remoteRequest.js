/**
 * ALl util helper method for signature remote place order for 1qianbao.com
 * @return {[type]} [description]
 */

// serialize object.http://nodejs.org/api/querystring.html
var querystring = require('querystring');
// https://github.com/mikeal/request  Request -- Simplified HTTP client
// http://nodejs.cn/npm/request/
var request = require("request");

var config = require("../config")();
var debug = require('debug')(config.appName);
var exception = require("./exception");

/**
 * Simulator http post form request to access remote server.
 * @param  {string} url     the remote server api url
 * @param  {object} data    the post request data
 * @param  {function} success the success callback
 * @param  {function} failed  the faield callback
 */
var formPost = function(url, data, success, failed) {
    debug("form request data:", data);
    var options = {
        url: url,
        method: "POST",
        form: data,
        strictSSL: false,
        headers: {
            "charset": "utf-8"
        },
        encoding: "utf-8"
    };
    request(options, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            // print result.
            debug("form post result body---->", body);
            if (success) {
                success(querystring.parse(body));
                // success(JSON.parse(body));
            }
        } else {
            failed && failed(error);
        }
    });
};
// for remote json get request .
var getRequest = function(url, success, failed) {
    debug("remote get request url:", url);
    var options = {
        url: url,
        method: "GET",
        strictSSL: false,
        headers: {
            "charset": "utf-8"
        },
        encoding: "utf-8"
    };
    request(options, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            // print result.
            debug("form get result body---->", body);
            if (success) {
                // success(querystring.parse(body));
                success(JSON.parse(body));
            }
        } else {
            failed && failed(error);
        }
    });
};
var utilities = {
    // simulator http form post request.
    formPost: function(url, data, success, failed) {
        formPost(url, data, success, failed);
    },
    getRequest: function(url, success, failed) {
        getRequest(url, success, failed);
    }
};
module.exports = utilities;
