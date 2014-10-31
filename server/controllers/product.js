var express = require('express');
var router = express.Router();
var _ = require("underscore");
var config = require("../config")();
var base = require("./base");
var debug = require('debug')(config.appName);

// data provider singleton.
var dataProvider = require("../services/dataProvider");

// remote request.
var request = require("../helpers/remoteRequest");

// area service
var productService = dataProvider.get("product");

// authenticating api security.
// router.route("*").all(base.setResponseHeaders, base.securityVerify);

// send customized message to user.
router.post("/uploadProduct", function(req, res) {
    var reqBody = req.body;
    productService.uploadProduct(reqBody, function(result) {
        base.apiOkOutput(res, result);
    });
});

module.exports = router;
