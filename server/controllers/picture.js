var express = require('express');
var router = express.Router();
var base = require("./base");
var logger = require("../helpers/log");

// data provider singleton.
var dataProvider = require("../dataProvider");

// picture sql server service.
var pictureService = dataProvider.getService("Picture")();

/**
 * API: /picture/auto_extract_product_pictures
 * Crawl all pictures from provider spider repository.
 */
router.post("/auto_extract_product_pictures", function(req, res) {
    logger.debug('controller: auto_extract_product_pictures...');
    var reqBody = req.body;
    var url = reqBody && reqBody.url || "";
    if (url) {
        pictureService.crawlPictures(url).then(function(result) {
            base.apiOkOutput(res, result);
        }, function error(err) {
            base.apiErrorOutput(res, err);
        });
    } else {
        base.apiErrorOutput(res, base.getErrorModel(400, "the extract page url is required!"));
    }
});

module.exports = router;
