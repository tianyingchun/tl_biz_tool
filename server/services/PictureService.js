//https://github.com/aheckmann/gm
//
var logger = require('../helpers/log');
var utility = require('../helpers/utility');
var Q = require("q");
var path = require("path");
// data provider singleton.
var dataProvider = require("../dataProvider");

var pictureDal = dataProvider.getDataAccess("Picture");

var PictureModel = dataProvider.getModel("Picture");


var pictureCfg = dataProvider.getConfig("picture");

var pictureCfgCrawl = dataProvider.getConfigNode(pictureCfg, "crawl_config");

// picture spider service.
var pictureSpiderDal = dataProvider.getDataAccess("spider", "Picture");

function PictureDataProvider() {
    // 更新图片信息
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
    this.insertPicture = function(mimeType, seoFilename, isNew, displayOrder) {
        var pictureModel = new PictureModel(mimeType, seoFilename, isNew, displayOrder);

        var deferred = Q.defer();

        // insert picture to db.
        pictureDal.insertPicture(pictureModel).then(function(newPicture) {

            // insert picture 


        }, function(err) {
            deferred.reject(err);
        });

        return deferred.promise;
    };
    // 获取图片信息实体
    this.getPictureById = function(pictureId) {
        // promise update picture 
        return pictureDal.getPictureById(pictureId);
    };
    // 删除图片
    this.deletePicture = function(pictureId) {
        // promise update picture 
        return pictureDal.deletePicture(pictureId);
    };
    /**
     * crawl picture from specified http url.
     * @param  {string} httpUrl product http url.
     * @return {promise}
     */
    this.crawlPictures = function(httpUrl) {
        return pictureSpiderDal.crawlPictures(httpUrl);
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

    // 
    // helper methods.
    // --------------------------------------------
    // 
    function savePictureInFile(pictureId, pictureBinary, mimeType) {

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

        var targetFilePath = path.join(pictureCfgCrawl.syncedto_dir.value, localFilename);

        logger.debug("sync picture target file path: ", targetFilePath);


        // TODO..Using `node-imagemagick`
        // File.WriteAllBytes(targetFilePath, pictureBinary);
    };
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
            case "jpg":
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