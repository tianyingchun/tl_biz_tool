var express = require('express');
var router = express.Router();
var _ = require("underscore");
var config = require("../config")();
var base = require("./base");
var logger = require("../helpers/log");
// data provider singleton.
var dataProvider = require("../services/dataProvider");

// remote request.
var request = require("../helpers/remoteRequest");

// utility service
var utilityService = dataProvider.get("utility");

// authenticating api security.
// router.route("*").all(base.setResponseHeaders, base.securityVerify);
// 
/**
 * 返回所有的 产品Attribute对应的Control Types
 */
router.post("/get_attribute_controltypes", function(req, res) {
	utilityService.getAttributControlTypeIds().then(function success(result) {
		base.apiOkOutput(res, result);
	}, function error(error) {
		base.apiErrorOutput(res, error);
	});
});
/**
 * 返回所有的 Product Attributes 列表
 */
router.post("/get_all_product_attributes", function(req, res) {
	utilityService.getAllProductAttributes().then(function success(result) {
		base.apiOkOutput(res, result);
	}, function error(error) {
		base.apiErrorOutput(res, error);
	});
});

/**
 * 增加新的ProductAttributes
 */
router.post("/add_new_product_attribute", function(req, res) {
	var productAttribute = req.body;
	utilityService.addNewProductAttribute(productAttribute).then(function success(result) {
		base.apiOkOutput(res, result);
	}, function error(error) {
		base.apiErrorOutput(res, error);
	});
});

/**
 * 获取系统所有的品牌Manufacturer 
 * @return  List<Manufacturer>
 */
router.post("/get_all_manufacturers", function(req, res) {
	utilityService.getAllManufacturers().then(function success(result) {
		base.apiOkOutput(res, result);
	}, function error(error) {
		base.apiErrorOutput(res, error);
	});
});

/**
 * 获取系统所有的品牌Manufacturer 
 * @return  List<Manufacturer>
 */
router.post("/get_all_categoris", function(req, res) {
	utilityService.getAllCatagory().then(function success(result) {
		base.apiOkOutput(res, result);
	}, function error(error) {
		base.apiErrorOutput(res, error);
	});
});
module.exports = router;