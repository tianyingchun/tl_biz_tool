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
 * API:  /product/auto_publish_products_of_category
 * auto pushlish product of specificed category.
 */
router.post("/auto_publish_products_of_category", function(req, res) {
    logger.debug('controller: auto_publish_products_of_category...');
    var reqBody = req.body;
    var categoryId = reqBody && reqBody.categoryId || "";
    if (categoryId) {
        productService.pushlishProducts(categoryId).then(function(result) {
            base.apiOkOutput(res, result);
        }, function(err) {
            base.apiErrorOutput(res, err);
        })
    } else {
        base.apiErrorOutput(res, base.getErrorModel(400, "the categoryId is required!"));
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
 * data:{url:""}
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
/**
 * API: /product/update_product_attributes
 *
 * "productAttribts": {
        "Color": [
            {
                "title": "Black",
                "value": "000"
            },
            {
                "title": "Khaki",
                "value": "dac9b9"
            }
        ],
        "Size": [
            {
                "title": "L",
                "value": "L"
            },
            {
                "title": "M",
                "value": "M"
            }
        ]
    }
 * provider single api to batch update product specification attributes for existed products.
 */
router.post("/update_product_attributes", function(req, res) {
    logger.debug('controller: update_product_attributes...');
    var reqBody = req.body;

    var sku, productId, specAttribts;

    if (reqBody) {
        sku = reqBody.url || "";
        productId = reqBody.productId || "";
        specAttribts = reqBody.specAttribts || null;
    }
    if (!sku || !productId || !specAttribts) {
        base.apiErrorOutput(res, base.getErrorModel(400, "make sure that `sku, productId, specAttribts` is required!"));
    } else {
        base.apiOkOutput(res, "oktestiong...");
    }
});

/**
 *API: /product/get_product_attribtues
 * data:{sku:'38004517023'}
 */
router.post("/get_product_attribtues", function(req, res) {
    logger.debug('controller: get_product_attribtues...');
    var reqBody = req.body;

    var sku;

    if (reqBody) {
        sku = reqBody.sku || "";
    }
    if (!sku) {
        base.apiErrorOutput(res, base.getErrorModel(400, "make sure that `sku` is required!"));
    } else {
        productService.getProductAttributesBySku(sku).then(function(results) {
            base.apiOkOutput(res, results);
        }, function(err) {
            base.apiErrorOutput(res, err);
        });
    }
});
module.exports = router;