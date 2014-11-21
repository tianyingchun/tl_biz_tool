var express = require('express');
var router = express.Router();
var _ = require("underscore");
var base = require("./base");
var logger = require("../helpers/log");
// data provider singleton.
var dataProvider = require("../dataProvider");

// catalog service
var catalogService = dataProvider.getService("catalog")();

// send customized message to user.
router.post("/addProducts2Category", function(req, res) {
    var reqBody = req.body;
    catalogService.addProducts2Category(reqBody, function(result) {
        base.apiOkOutput(res, result);
    });
});

module.exports = router;
