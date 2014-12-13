var express = require('express');
var router = express.Router();
var base = require("./base");
var logger = require("../helpers/log");

// data provider singleton.
var dataProvider = require("../dataProvider");

//  product service.
var productService = dataProvider.getService("Product");

/**
 * API: /product/auto_extract_products
 * auto crawl product information.
 */
router.post("/auto_extract_products", function(req, res) {
    logger.debug('controller: auto_extract_products...');
    var reqBody = req.body;
    var url = reqBody && reqBody.url || "";
    if (url) {
        // crawl product information.
        productService.crawlProductInfo(url).then(function(result) {
            if (result.hasErrors) {
                base.apiErrorOutput(res, result.errors);
            } else {
                base.apiOkOutput(res, result);
            }
        }, function(err) {
            base.apiErrorOutput(res, err);
        });
    } else {
        base.apiErrorOutput(res, base.getErrorModel(400, "the extract page url is required!"));
    }
});
/**
 * API: /product/auto_extract_upload_products
 * {url:"",categoryIds:[],manufacturerIds:[]}
 * manufacturerIds is optional now
 * auto crawl product information and then add new product info to database.
 */
router.post("/auto_extract_upload_products", function(req, res) {
    logger.debug('controller: auto_extract_upload_products...');
    var reqBody = req.body;

    var url, categoryIds, manufacturerIds;

    if (reqBody) {
        url = reqBody.url || "";
        categoryIds = reqBody.categoryIds || [];
        manufacturerIds = reqBody.manufacturerIds || [];
    }
    if (!url || !categoryIds.length) {
        base.apiErrorOutput(res, base.getErrorModel(400, "make sure that `url` or `categoryIds[]`is required!"));
    } else {
        // crawl product information.
        productService.crawlProductInfo(url).then(function(crawlProductInfo) {
            if (crawlProductInfo.hasErrors) {
                base.apiErrorOutput(res, crawlProductInfo.errors);
            } else {
                // to add new product into databse.
                productService.addNewProduct(crawlProductInfo, categoryIds, manufacturerIds).then(function(result) {
                    base.apiOkOutput(res, result);
                }, function(err) {
                    base.apiErrorOutput(res, err);
                });
            }
        }, function(err) {
            base.apiErrorOutput(res, err);
        });
    }
});

/**
 * API: /product/update_product_specification_attributes
 * provider single api to batch update product specification attributes for existed products.
 */
router.post("/update_product_specification_attributes", function(req, res) {
    logger.debug('controller: auto_extract_upload_products...');
    var reqBody = req.body;

    var url;

    if (reqBody) {
        url = reqBody.url || "";
    }
    if (!url) {
        base.apiErrorOutput(res, base.getErrorModel(400, "make sure that `url` is required!"));
    } else {
        // crawl product information.
        productService.crawlProductInfo(url).then(function(crawlProductInfo) {
            if (crawlProductInfo.hasErrors) {
                base.apiErrorOutput(res, crawlProductInfo.errors);
            } else {
                // get crawl product infomation.
                var specAttribts = crawlProductInfo.specAttribts;
                var sku = crawlProductInfo.sku;
                productService.updateProductSpecificationAttributes(sku, specAttribts).then(function(result) {
                    base.apiOkOutput(res, result);
                }, function(err) {
                    base.apiErrorOutput(res, err);
                });
            }
        }, function(err) {
            base.apiErrorOutput(res, err);
        });
    }
});

module.exports = router;