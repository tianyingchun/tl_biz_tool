var express = require('express');
var router = express.Router();
var async = require("async");

var base = require("./base");
var logger = require("../helpers/log");
var utility = require("../helpers/utility");
var finder = require('fs-finder');
// data provider singleton.
var dataProvider = require("../dataProvider");
var pictureCfg = dataProvider.getConfig("picture");
var pictureUploadCfg = dataProvider.getConfigNode(pictureCfg, "upload_config");
// picture sql server service.
var pictureService = dataProvider.getService("Picture");
var productService = dataProvider.getService("Product");
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

/**
 * API: /picture/auto_sync_product_pictures_2database
 * @requestBody: {url: ""}
 * first sync the relationship between product and pictures, then transfer all pictures to another dest dir.
 */
router.post("/auto_sync_product_pictures_2database", function(req, res) {

    var reqBody = req.body;

    var url = reqBody && reqBody.url || "";
    // get product sku by given product url.
    var sku = utility.extractProductId(url);

    // picture source directory.
    var picture_source_dir = pictureUploadCfg.picture_source_dir.value;
    // picture synced to directory.
    var picture_synced_to_dir = pictureUploadCfg.picture_synced_to_dir.value;

    logger.debug("sku: %s, picture_source_dir: %s ", sku, picture_source_dir);
    // file matched picture files with sku.
    finder.from(picture_source_dir).findFiles(sku + "_<[0-9]+>", function(files) {

        productService.getProductInfoBySku(sku).then(function(product) {
            logger.debug("current product:", product);

            var productId = product.Id;
            if (productId && productId != 0) {


                var productName = product.Name;
                // check if have product pictures for this productid
                productService.getPicturesByProductId(productId).then(function(productPictureList) {
                    // do some task to upload product pictures.
                    if (!productPictureList || productPictureList.length == 0) {
                        var pictureSyncTasks = [];
                        pictureSyncTasks.push(function(callback) {
                            // insert picture while this picture validated status is ok!
                            // do validate this picture,e.g. max size
                            // get picture seo name.
                            var seName = pictureService.getPictureSeName(productName);

                            callback(null, seName);
                        });
                        // run all picture sync taks.
                        async.parallel(pictureSyncTasks, function(err, results) {
                            base.apiOkOutput(res, results);
                        });
                    } else {
                        // check if existed picture mappings for current productId, if have throw error,
                        // 
                        // we can't allow upload picture if this product has picture mapping.
                        var _message = utility.stringFormat("The sku:`{0}`, product id:`{1}` has existed pictures, can't add repeated picture now!", sku, productId);
                        logger.warn(_message);
                        base.apiErrorOutput(res, new Error(_message));
                    }
                }, function(err) {
                    base.apiErrorOutput(res, err);
                });
            } else {
                var _errorMsg = utility.stringFormat("can't find product basic detail by sku `{0}`, please upload product first!", sku);
                logger.debug(_errorMsg);
                base.apiErrorOutput(res, new Error(_errorMsg));
            }
        }, function(err) {
            base.apiErrorOutput(res, err);
        });
    });
});
// only for testing purpose.
router.get("/test_image_magick", function(req, res) {

    var gm = require('gm'); //.subClass({ imageMagick: true });
    var fs = require('fs');

    // resize and remove EXIF profile data
    gm('D:/Github_Works/extract_dir/orignal.jpg')
        .resize(240, 240)
        .noProfile()
        .write('D:/Github_Works/extract_dir/resized.jpg', function(err) {
            if (!err) {
                base.apiOkOutput(res, "");

            } else {
                console.dir(err);
            }

        });
});


module.exports = router;