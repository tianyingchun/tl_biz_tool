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

// product sql service
var productSqlService = dataProvider.get("product");

// product spider service.
var productSpiderService = dataProvider("spider", "product");

// authenticating api security.
// router.route("*").all(base.setResponseHeaders, base.securityVerify);

// send customized message to user.
router.post("/auto_extract_upload_products", function(req, res) {
    logger.debug('controller: auto_extract_upload_products...');
    var reqBody = req.body;
    var url = reqBody && reqBody.url || "";
    if (url) {
        // crawl product information.
        productSpiderService.start(url).then(function(result) {
            // invoke sqlserver databse service to add new product into databse.
            productSqlService.addNewProduct(result).then(function(result) {
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
