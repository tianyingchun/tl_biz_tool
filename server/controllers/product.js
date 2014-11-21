var express = require('express');
var router = express.Router();
var _ = require("underscore");
var base = require("./base");
var logger = require("../helpers/log");


// data provider singleton.
var dataProvider = require("../dataProvider");

// instance product service.
var productService = dataProvider.getService("product")();

// send customized message to user.
router.post("/auto_extract_upload_products", function(req, res) {
    logger.debug('controller: auto_extract_upload_products...');
    var reqBody = req.body;
    var url = reqBody && reqBody.url || "";
    if (url) {
        // crawl product information.
        productService.crawlProductInfo(url).then(function(result) {
            // to add new product into databse.
            productService.addNewProduct(result).then(function(result) {
                base.apiOkOutput(res, result);
            }, function(err) {
                base.apiErrorOutput(res, err);
            });

        }, function(err) {
            base.apiErrorOutput(res, err);
        });
    } else {
        base.apiErrorOutput(res, base.getErrorModel(400, "the extract page url is required!"));
    }
});

module.exports = router;
