var Q = require("q");
var path = require("path");
var fse = require("fs-extra");
//http://www.graphicsmagick.org/INSTALL-windows.html#installing-using-installer-package
//using node gm libaray we need to first install graphicsmagick libaray
//test>>: gm convert logo: logo.gif
//https://github.com/aheckmann/gm
//
var gm = require('gm');
var logger = require('../helpers/log');
var utility = require('../helpers/utility');

// data provider singleton.
var dataProvider = require("../dataProvider");

var PictureModel = dataProvider.getModel("Picture");

function PictureDataProvider() {

    var pictureCfgUpload = dataProvider.getConfigNode("picture", "upload_config");
    // picture spider service.
    var pictureSpiderDal = dataProvider.getDataAccess("spider", "Picture");

    var pictureDal = dataProvider.getDataAccess("Picture");

    /**
     * Update picture information
     * @param  {object} picture PictureModel instance.
     * @return {promise}
     */
    this.updatePicture = function(picture) {
        // promise update picture   
        return pictureDal.updatePicture(picture);
    };
    /**
     * Inserts a picture
     * @param  {String}  mimeType    The picture MIME type
     * @param  {string}  seoFilename seo image file name
     * @param  {Boolean} isNew       A value indicating whether the picture is new
     * @return {promise}
     */
    this.insertPicture = function(mimeType, seoFilename, isNew) {

        var pictureModel = new PictureModel(mimeType, seoFilename, isNew);

        var deferred = Q.defer();

        // insert picture to db.
        pictureDal.insertPicture(pictureModel).then(function(newPicture) {

            // insert picture 
            deferred.resolve(newPicture);

        }, function(err) {
            deferred.reject(err);
        });

        return deferred.promise;
    };
    /**
     * Get picture entity info by id.
     * @param  {number} pictureId pictureId
     * @return {promise}
     */
    this.getPictureById = function(pictureId) {
        // promise update picture 
        return pictureDal.getPictureById(pictureId);
    };
    /**
     * Delete picture from database.
     * @param  {number} pictureId picture id number.
     * @return {promise}
     */
    this.deletePicture = function(pictureId) {
        // promise update picture 
        return pictureDal.deletePicture(pictureId);
    };
    /**
     * crawl picture from specified http url.
     * @param  {string} httpUrl product http url.
     * @param  {string} destDir product picture save target directory.
     * @return {promise}
     */
    this.crawlPictures = function(httpUrl, destDir) {
        return pictureSpiderDal.crawlPictures(httpUrl, destDir);
    };

    /**
     * the product name
     * @param  {string} string name  the picture name default is product name.
     * @return {string} converted product seo name.
     */
    this.getPictureSeName = function(name) {
        var okChars = "abcdefghijklmnopqrstuvwxyz1234567890 _-";
        name = name.replace(/^\s+|\s+$/g, "").toLowerCase();
        //non western chars should be converted.
        if (!name) {
            return null;
        }
        var result = [];
        for (var i = 0; i < name.length; i++) {
            var c2 = c = name[i];
            if (!!~okChars.indexOf(c2)) {
                result.push(c2);
            }
        };
        var name2 = result.join("");
        name2 = name2.replace(/\s+/g, "-");
        name2 = name2.replace(/--/g, "-");
        name2 = name2.replace(/__/g, "_");

        return name2;

    };
    /**
     * @sync method.
     * Get displayorderby give picture path
     * @param  {string} picturePath picture path
     * @return {number} displayOrder.
     */
    this.getDisplayOrderByPictureName = function(picturePath) {
        var displayOrder = 0;
        if (picturePath) {
            displayOrder = parseInt(picturePath.match(/[^_/]*$/)[0].replace(/.\w*$/, ""));
        }
        return displayOrder;
    };
    /**
     * Updates a SEO filename of a picture
     * @param {number} pictureId   picture id number.
     * @param {string} seoFilename seo file name.
     */
    this.setSeoFilename = function(pictureId, seoFilename) {
        var deferred = Q.defer();
        var _this = this;
        var picture = this.getPictureById(pictureId).then(function(picture) {
            //update if it has been changed
            if (seoFilename != picture.SeoFilename) {
                //update picture 
                picture.SeoFilename = seoFilename;
                picture.IsNew = true;
                picture.PictureBinary = new byte[0];
                _this.updatePicture(picture).then(function(newPicture) {

                    deferred.resolve(newPicture);

                }, function(err) {

                    deferred.reject(err);

                });
            }
        }, function(err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };
    /**
     * Validation picture if match our website requirement, e.g. maxsize.
     * @param  {string} picturePath full file path.
     * @return {promise} {size:{weight:xx,height:xxx}, filepath:''}
     */
    this.validatePicture = function(picturePath) {
        var deferred = Q.defer();
        var _this = this;
        var fileExisted = fse.existsSync(picturePath);
        if (fileExisted) {
            gm(picturePath).size(function(err, size) {
                if (err) {
                    deferred.reject(err);
                } else {
                    var maxSize = _this.getPictureMaximumSize();

                    logger.debug("picture maxSize:`%s`, size: `%s`", maxSize, size);

                    var newSize = size;
                    if ((size.height > maxSize) || (size.width > maxSize)) {
                        newSize = _this.calculateDimensions(size, maxSize);
                    }
                    deferred.resolve({
                        filepath: picturePath,
                        size: newSize
                    });
                }
            });
        } else {
            var _existMsg = utility.stringFormat("can't find the picture with path: `{0}`", picturePath);
            logger.warn(_existMsg);
            deferred.reject(_existMsg);
        }
        return deferred.promise;
    };

    this.getPictureMaximumSize = function() {
        var maxSize = parseInt(pictureCfgUpload.picture_maximum_size.value);
        return maxSize;
    };
    /**
     * Get mimetype for given picture path
     * @param  {string} picturePath picture path
     * @return {promise} - returns the image format (gif, jpeg, png, etc)
     */
    this.getPictureMimeType = function(picturePath) {
        var deferred = Q.defer();
        var fileExisted = fse.existsSync(picturePath);

        if (fileExisted) {
            gm(picturePath).format(function(err, value) {
                if (err) {
                    deferred.reject(err);
                } else {
                    value = value ? value.toLowerCase() : "jpeg";
                    deferred.resolve(value);
                }
            });
        } else {
            var _errorMsg = utility.stringFormat("can't find picture with given path `{0}`", picturePath);
            logger.error(_errorMsg);
            deferred.reject(_errorMsg);
        }
        return deferred.promise;
    };


    this.savePictureInFile = function(pictureOriginPath, newSize, pictureId, mimeType) {

        var deferred = Q.defer();

        var lastPart = getFileExtensionFromMimeType(mimeType);

        function formatId(pictureId) {
            pictureId = pictureId.toString();
            var len = pictureId.length;
            var formatter = "0000000";
            if (len > formatter.length) {
                logger.error("The length of pictureId > '0000000'");
                return pictureId;
            } else {
                var regex = new RegExp("0{" + len + "}$");
                return "0000000".replace(regex, pictureId);
            }
        };
        var localFilename = utility.stringFormat("{0}_0.{1}", formatId(pictureId), lastPart);

        // make sure the dest directory has created!
        fse.ensureDirSync(pictureCfgUpload.picture_synced_to_dir.value);

        var targetFilePath = path.join(pictureCfgUpload.picture_synced_to_dir.value, localFilename);

        logger.debug("sync picture target file path: `%s` ", targetFilePath);

        // resize width, height.
        gm(pictureOriginPath).resize(newSize.width, newSize.height).write(targetFilePath, function(err) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve("sync picture target file path: `" + targetFilePath + "` success!");
            }
        });
        return deferred.promise;
    };

    // 
    // helper methods.
    // --------------------------------------------
    // 

    /**
     * Returns the file extension from mime type.
     * @param  {string} string mimeType    Mime type
     * @return {string} File extension
     */
    function getFileExtensionFromMimeType(mimeType) {
        if (mimeType == null)
            return null;
        var parts = mimeType.split('/');
        var lastPart = parts[parts.length - 1];
        switch (lastPart) {
            case "pjpeg":
            case "jpeg":
                lastPart = "jpg";
                break;
            case "x-png":
                lastPart = "png";
                break;
            case "x-icon":
                lastPart = "ico";
                break;
        }
        return lastPart;
    };

    /**
     * Calculates picture dimensions whilst maintaining aspect
     * @param  {bject} originalSize  {width: xx,height:''} The original picture size
     * @param  {number} int          targetSize  The target picture size (longest side)
     * @return {object} new picture size.
     */
    function calculateDimensions(originalSize, targetSize) {
        var newSize = {};
        if (originalSize.height > originalSize.width) // portrait 
        {
            newSize.width = parseInt(originalSize.width * parseFloat(targetSize / parseFloat(originalSize.height)));
            newSize.height = targetSize;
        } else // landscape or square
        {
            newSize.height = parseInt(originalSize.height * parseFloat(targetSize / parseFloat(originalSize.width)));
            newSize.width = targetSize;
        }
        return newSize;
    };

};
module.exports = PictureDataProvider;
