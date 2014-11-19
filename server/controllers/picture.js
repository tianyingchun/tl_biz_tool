var express = require('express');
var router = express.Router();
var _ = require("underscore");
var base = require("./base");
var logger = require("../helpers/log");

// data provider singleton.
var dataProvider = require("../services/dataProvider");

// remote request.
var request = require("../helpers/remoteRequest");

// picture spider service
var pictureSpiderService = dataProvider.get("spider", "picture");

// picture sql server service.
var pictureSqlService = dataProvider.get("picture");


// authenticating api security.
// router.route("*").all(base.setResponseHeaders, base.securityVerify);

// send customized message to user.
router.post("/auto_extract_product_pictures", function(req, res) {
    logger.debug('controller: auto_extract_product_pictures...');
    var reqBody = req.body;
    var url = reqBody && reqBody.url || "";
    if (url) {
        pictureSpiderService.start(url).then(function(result) {
            base.apiOkOutput(res, result);
        }, function error(err) {
            base.apiErrorOutput(res, err);
        });
    } else {
        base.apiErrorOutput(res, base.getErrorModel(400, "the extract page url is required!"));
    }
});

router.get("/sql_server_connection_test", function(req, res) {
    var pictureId = 10;
    pictureSqlService.getPictureById(pictureId, function(result) {

        logger.debug("picture controller success: ", result);
        base.apiOkOutput(res, result);

    }, function(err) {

        logger.debug("picture controller error: ", err);
        base.apiErrorOutput(res, err);

    });
})
module.exports = router;
