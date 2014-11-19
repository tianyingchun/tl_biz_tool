var util = require('util');
var _ = require('underscore');
var logger = require('../../helpers/log');
var exception = require('../../helpers/exception');
var pictureDataSchema = require("../../models/Picture");
var PictureDal = require("../../datalayer/pictureDal");
// picture data model.

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

};
module.exports = function() {
	return new PictureDataProvider();
};