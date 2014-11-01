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
router.post("/auto_extract_upload_products", function(req, res) {
	debug('test debug auto_extract_upload_products...');
	var reqBody = req.body;
	var url = reqBody && reqBody.url || "";
	if (url) {
		productService.extractOnlineProductDetail(url, function(result) {
			if (base.hasPassed(result)) {
				base.apiOkOutput(res, result);
			} else {
				base.apiErrorOutput(res,result.error);
			}
		});
	} else {
		base.apiErrorOutput(res, base.getErrorModel(400, "the extract page url is required!"));
	}
});

module.exports = router;