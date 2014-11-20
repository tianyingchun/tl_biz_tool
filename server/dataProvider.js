var fs = require("fs-extra");
var config = require("./config/index")();
var logger = require("./helpers/log");

/**
 * in order to support multi data spider source.
 * @param  {string} dalName data access name
 */
function getCurrentSpiderRepository(dalName){
    
};
module.exports = {
    /**
     * Get data service singleton constructor.
     * @param  {string} serviceName  the service name, e.g.  product, user
     * @return {constructor}
     */
    getService: function(serviceName) {
        if (serviceName) {
            return require("services/" + serviceName);
        } else {
            logger.error("We must provider a service name to auto fecth service constructor!");
        }
    },
    /**
     * Get data access corresponding constructor.
     * @param  {string} provider the data provider default value configed from /config/index.js
     * @param  {string} dalName service name, e.g. catalogDal  canbe write catalog also with short cut name.
     * @return {constructor}  DataAccess class.
     */
    getDataAccess: function(provider, dalName) {
        if (arguments.length == 1) {
            dalName = provider;
            provider = config.defaultDataProvider;
        }
        if (dalName) {
            dalName = dalName.replace(/Dal$/ig, "") + "Dal";
        } else {
            logger.error("We must provider data access name!");
        }
        switch (provider) {
            case "spider":
                dalName = getCurrentSpiderRepository(dalName);
                break;
        }

        return require(["datalayer", provider, dalName].join('/'));
    },
    /**
     * Get model entity constructor
     * @param  {string} modelName model constructor name.
     * @return {constructor}  entity model class.
     */
    getModel: function(modelName) {
        if (modelName) {
            return require("models/" + modelName);
        } else {
            logger.error("We must provider a model name to fetch model constructor!");
        }
    },
    getConfig: function() {
        return {

        }
    }
};