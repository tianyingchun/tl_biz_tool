var express = require('express');
var router = express.Router();
var base = require("./base");
var logger = require("../helpers/log");
// data provider singleton.
var dataProvider = require("../dataProvider");

// utility service
var utilityService = dataProvider.getService("Utility")();

/**
 * API: /utility/get_attribute_controltypes
 * 返回所有的 产品Attribute对应的Control Types
 */
router.get("/get_attribute_controltypes", function(req, res) {
	utilityService.getAttributControlTypeIds().then(function success(result) {
		base.apiOkOutput(res, result);
	}, function error(error) {
		base.apiErrorOutput(res, error);
	});
});
/**
 * API:/utility/get_all_product_attributes
 * 返回所有的 Product Attributes 列表
 */
router.get("/get_all_product_attributes", function(req, res) {
	utilityService.getAllProductAttributes().then(function success(result) {
		base.apiOkOutput(res, result);
	}, function error(error) {
		base.apiErrorOutput(res, error);
	});
});

/**
 * API:/utility/add_new_product_attribute
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
 * API:/utility/get_all_categoris
 * 获取系统所有的品牌Manufacturer 
 * @return  List<Manufacturer>
 */
router.get("/get_all_categoris", function(req, res) {
	utilityService.getAllCatagory().then(function success(result) {
		base.apiOkOutput(res, result);
	}, function error(error) {
		base.apiErrorOutput(res, error);
	});
});
module.exports = router;