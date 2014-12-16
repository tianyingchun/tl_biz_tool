var express = require('express');
var router = express.Router();
var async = require('async');

var base = require("./base");
var logger = require("../helpers/log");
var utility = require("../helpers/utility");
var finder = require('fs-finder');
var fse = require("fs-extra");
// data provider singleton.
var dataProvider = require("../dataProvider");

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
    var url, destDir;
    if (reqBody) {
        url = reqBody.url || "";
        destDir = reqBody.destDir || ""
    }

    if (url) {
        // make sure that current product has been existed in our system
        var sku = utility.extractProductId(url);

        productService.getProductIdBySku(sku).then(function(productId) {
            if (productId && productId > 0) {
                pictureService.crawlPictures(url, destDir).then(function(result) {
                    base.apiOkOutput(res, result);
                }, function error(err) {
                    base.apiErrorOutput(res, err);
                });
            } else {
                base.apiErrorOutput(res, base.getErrorModel(400, utility.stringFormat("ignored this product sku:`{0}`, url: `{1}`, we can't find it in database!", sku, url)));
            }
        }, function(err) {
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

    var pictureUploadCfg = dataProvider.getConfigNode("picture", "upload_config");
    // picture source directory.
    var picture_source_dir = reqBody.sourceDir || pictureUploadCfg.picture_source_dir.value;
    // picture synced to directory.
    var picture_synced_to_dir = reqBody.syncedToDir || pictureUploadCfg.picture_synced_to_dir.value;

    logger.debug("sku: %s, picture_source_dir: %s ", sku, picture_source_dir);

    // check if allow us upload new pictures, if allow return product basic info.
    productService.ifAllowUsUploadNewPictures(sku).then(function(product) {

        var productName = product.Name;
        var productId = product.Id;
        // get picture seo name.
        var seName = pictureService.getPictureSeName(productName);

        logger.debug("product id %s, name%s: ", productId, productName);

        // check if existed directory path.
        var hasExistedDir = fse.existsSync(picture_source_dir);
        if (hasExistedDir) {
            // file matched picture files with sku.
            finder.from(picture_source_dir).findFiles(sku + "_<[0-9]+>", function(files) {
                // if we can't find files throw error here.
                if (!files || !files.length) {
                    var _fileMsg = "can't find pictures in directory :`" + picture_source_dir + "` with productId: `" + productId + "`";
                    logger.error(_fileMsg);
                    base.apiErrorOutput(res, _fileMsg);
                } else {
                    // save all tasks here.
                    var pictureSyncTasks = [];
                    for (var i = 0; i < files.length; i++) {
                        var file = files[i];

                        logger.debug("matched file: ", file);
                        // use closure to wrapper file name.
                        var syncTask = function(file) {

                            return function(callback) {
                                // insert picture while this picture validated status is ok!
                                // do validate this picture,e.g. max size
                                pictureService.validatePicture(file).then(function(pictureInfo) {

                                    logger.debug("validatePicture result: ", pictureInfo);

                                    var _pictureSourcePath = pictureInfo.filepath;
                                    var _pictureTargetSize = pictureInfo.size;
                                    var _displayOrder = pictureService.getDisplayOrderByPictureName(_pictureSourcePath);

                                    // insert into database, and picture mapping.
                                    return pictureService.getPictureMimeType(_pictureSourcePath).then(function(mimeType) {
                                        logger.debug("the mimeType of uploading picture: ", mimeType);

                                        // insert new picture record into database.
                                        return pictureService.insertPicture(mimeType, seName, true).then(function(newPictureEntity) {

                                            var pictureId = newPictureEntity.Id;
                                            //save new picture to new target directory.
                                            return pictureService.savePictureInFile(_pictureSourcePath, _pictureTargetSize, pictureId, mimeType).then(function(result) {
                                                logger.debug("saved picture success file path: ", result);
                                                callback(null, {
                                                    pictureId: pictureId,
                                                    displayOrder: _displayOrder
                                                });

                                            });

                                        });

                                    });

                                }).fail(function(err) {
                                    callback(err);
                                });
                            };
                        }(file);

                        pictureSyncTasks.push(syncTask);
                    };
                    // run all picture sync taks.
                    async.parallel(pictureSyncTasks, function(err, results) {
                        if (err) {
                            base.apiErrorOutput(res, err);
                        } else {
                            // picture ids.
                            var pictures = results;
                            productService.addProductPictureMappings(productId, pictures).then(function(result) {
                                base.apiOkOutput(res, result);
                            }, function(err) {
                                base.apiErrorOutput(res, err);
                            });
                        }
                    });
                }
            });

        } else {
            throw new Error("can't find picture `picture_source_dir`, please check config settings");
        }
    }).fail(function(err) {
        base.apiErrorOutput(res, err);
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