var express = require('express');
var router = express.Router();
var base = require("./base");
var logger = require("../helpers/log");

// data provider singleton.
var dataProvider = require("../dataProvider");

//  product service.
var productVariantService = dataProvider.getService("ProductVariant");

/**
 *API: /product/detail/get_product_variant_attribtues
 * data:{sku:'38004517023'}
 */
router.post("/get_product_variant_attribtues", function(req, res) {
	logger.debug('controller: get_product_variant_attribtues...');
	var reqBody = req.body;

	var sku;

	if (reqBody) {
		sku = reqBody.sku || "";
	}
	if (!sku) {
		base.apiErrorOutput(res, base.getErrorModel(400, "make sure that `sku` is required!"));
	} else {
		productVariantService.getProductVariantAttributesBySku(sku).then(function(results) {
			base.apiOkOutput(res, results);
		}, function(err) {
			base.apiErrorOutput(res, err);
		});
	}
});

module.exports = router;