var express = require('express');
var router = express.Router();
var base = require("./base");
var logger = require("../helpers/log");

// data provider singleton.
var dataProvider = require("../dataProvider");
// utility service.
var utilityService = dataProvider.getService("Utility");
// all dynamic configurations public api.
// -----------------------------------------------------------

/**
 * API: /configs/context/get_crawl_provide
 * Get current crawl provider , default is "aliexpress".
 */
router.get("/context/get_crawl_provider", function(req, res) {
    var aliexpress = {
        name: "aliexpress",
        key: "aliexpress"
    };
    var ebay = {
        key: "ebay",
        name: "ebay"
    };
    base.apiOkOutput(res, [aliexpress, ebay]);
});

/**
 * API: /configs/context/db_clothesgate_envs
 * Get clothesgate database connection configs for sqlserver.
 */
router.get("/context/db_clothesgate_envs", function(req, res) {
    var configs = dataProvider.getConfigNode("system", "db_clothesgate_config");
    base.apiOkOutput(res, [
        configs["testEnv"],
        configs["productionEnv"]
    ]);
});

/**
 * API:/configs/product/get_all_manufacturers
 * Get all brands for product configurations.
 */
router.get("/get_all_manufacturers", function(req, res) {
    utilityService.getAllManufacturers().then(function success(result) {
        base.apiOkOutput(res, result);
    }, function error(error) {
        base.apiErrorOutput(res, error);
    });
});


module.exports = router;