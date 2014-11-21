var config = require("../config")();
var debug = require('debug')(config.appName);

/**
 * uniform exception handler
 * @type {Object}
 */
module.exports = {
    /**
     * generated the uniform error model
     * @param  {object} err the error from any operator from server.
     * @return {object}     error model
     */
    getErrorModel: function(err) {
        debug("getErrorModel-> err:", err);
        var _error = {
            status: err.status || 500,
            message: err.message || '',
            stack: err.stack || JSON.stringify(err)
        };
        return {
            failed: true,
            error: _error
        };
    },
    /**
     * Exposed uniform api json response data result structure
     * @param  {object} res   response
     * @param  {object} err err object
     * @return {json}         output json result to client.
     */
    writeJSONError: function(res, err) {
        debug("writeJSONError-> err:", err);
        var status = err.status || 500;
        var message = err.message || "The request internal exception!";
        res.json(status, {
            retCode: status,
            info: null,
            message: message
        });
    }
}