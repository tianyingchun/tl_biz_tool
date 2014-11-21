var logger = require('../helpers/log');
// data provider singleton.
var dataProvider = require("../dataProvider");

var PictureDal = dataProvider.getDataAccess("picture");

// picture spider service.
var pictureSpiderDal = dataProvider.getDataAccess("spider", "picture")();

function PictureDataProvider() {

    // picture Dal instance.
    var pictureDal = new PictureDal();

    // 更新图片信息
    this.updatePicture = function(picture, sucessedCb, failedCb) {
        // promise update picture 
        var promise = pictureDal.updatePicture(picture);
        promise.then(sucessedCb, failedCb || sucessedCb);
    };
    // 获取图片信息实体
    this.getPictureById = function(pictureId, sucessedCb, failedCb) {
        // promise update picture 
        var promise = pictureDal.getPictureById(pictureId);
        promise.then(sucessedCb, failedCb || sucessedCb);
    };
    // 删除图片
    this.deletePicture = function(pictureId, sucessedCb, failedCb) {
        // promise update picture 
        var promise = pictureDal.deletePicture(pictureId);
        promise.then(sucessedCb, failedCb || sucessedCb);
    };
    /**
     * crawl picture from specified http url.
     * @param  {string} httpUrl product http url.
     * @return {promise}
     */
    this.crawlPictures = function(httpUrl) {
    	return pictureSpiderDal.crawlPictures(httpUrl);
    };

};
module.exports = PictureDataProvider;
