var fs = require("fs-extra");
var config = require("./config/index")();
var logger = require("./helpers/log");

function getConfig(type) {
    var config = {};
    if (!type) {
        logger.error("We must provider type name to get specifie config node!");
        return config;
    }
    switch (type) {
        case "product":
            config = fs.readJsonSync("../app_configs/product_config.json");
            break;
        case "picture":
            config = fs.readJsonSync("../app_configs/picture_config.json");
            break;
        case "system":
            config = fs.readJsonSync("../app_configs/system_config.json");
            break;
        case "context":
            config = fs.readJsonSync("../app_configs/context_config.json");
            break;
    }
    // logger.debug("current config info: ", config);
    return config;
};
/**
 * in order to support multi data spider source.
 * @param  {string} dalName data access name
 */
function getCurrentSpiderRepository(dalName) {
    var contextCfg = getConfig("context");
    var spiderProvider = "aliexpress";
    try {
        var spiderProvider = contextCfg.crawl_config.configs.crawl_provider.value;
    } catch (e) {
        logger.error("get current spider repository failed!: ", e);
        spiderProvider = "aliexpress";
    }
    return spiderProvider + "/" + dalName;
};
module.exports = {
    /**
     * Get data service singleton constructor.
     * @param  {string} serviceName  the service name, e.g.  product, user
     * @return {constructor}
     */
    getService: function(serviceName) {
        if (serviceName) {
            serviceName = serviceName.replace(/Service$/ig, "") + "Service";
            var ServiceClass = require("./services/" + serviceName);
            return new ServiceClass();
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
        var DataAccessClass = require(["./datalayer", provider, dalName].join('/'));
        
        return new DataAccessClass();
    },
    /**
     * Get model entity constructor
     * @param  {string} modelName model constructor name.
     * @return {constructor}  entity model class.
     */
    getModel: function(modelName) {
        if (modelName) {
            return require("./models/" + modelName);
        } else {
            logger.error("We must provider a model name to fetch model constructor!");
        }
    },
    /**
     * Get configurations for specificed type
     * @param  {string} type  config node type.
     * @return {object}       return config nodes.
     */
    getConfig: function(type) {
        return getConfig(type);
    },
    /**
     * The short cut method to fetch specificed last config node value.
     * e.g. system_config.json
     *
     * (system_config, "db_clothesgate_config", "testEnv")
     * it will try to get system_config.db_clothesgate_config.configs.testEnv.value.
     * @param  {object} configRoot via invoke getConfig("system");
     * @param  {string} nodeName   'db_clothesgate_config'
     * @param  {string} keyName    'testEnv'
     * @return {any}    string | object
     */
    getConfigNode: function(configRoot, nodeName, keyName) {
        var cfgValue = "";
        try {
            cfgValue = configRoot[nodeName].configs[keyName].value;
        } catch (e) {
            logger.error("get config node failed!", e);
        }
        return cfgValue;
    }
};