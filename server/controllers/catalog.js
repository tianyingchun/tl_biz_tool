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
var catalogService = dataProvider.get("catalog");

// authenticating api security.
// router.route("*").all(base.setResponseHeaders, base.securityVerify);

// send customized message to user.
router.post("/addProducts2Category", function(req, res) {
    var reqBody = req.body;
    catalogService.addProducts2Category(reqBody, function(result) {
        base.apiOkOutput(res, result);
    });
});

module.exports = router;
