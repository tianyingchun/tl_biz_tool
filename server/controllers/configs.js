var express = require('express');
var router = express.Router();
var _ = require("underscore");
var base = require("./base");
var logger = require("../helpers/log");

// data provider singleton.
var dataProvider = require("../dataProvider");
// utility service.
var utilityService = new dataProvider.getService("utility")();

// all dynamic configurations public api.
// 
// 
// Get current crawl provider , default is "aliexpress".
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

// Get clothesgate database connection configs for sqlserver.
router.get("/context/db_clothesgate_envs", function(req, res) {
    var systemCfg = dataProvider.getConfig("system");
    var configs = systemCfg.db_clothesgate_config.configs;
    base.apiOkOutput(res, [
        configs["testEnv"],
        configs["productionEnv"]
    ]);
});

// Get all brands for product configurations.
router.get("/product/get_all_manufacturers", function(req, res) {
    utilityService.getAllManufacturers().then(function success(result) {
        base.apiOkOutput(res, result);
    }, function error(error) {
        base.apiErrorOutput(res, error);
    });
});


module.exports = router;
