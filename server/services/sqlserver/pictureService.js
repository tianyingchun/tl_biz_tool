var util = require('util');
var _ = require('underscore');
var logger = require('../../helpers/log');
var exception = require('../../helpers/exception');
var pictureDataSchema = require("../../models/Picture");
var PictureSpider = require("../spider/pictureService");

// picture data model.

function PictureDataProvider() {
	// handler
	var extractDataDetailHandler = function(callback, result) {
		if (callback) {
			// remove event target.
			delete result.target;
			// if failed occur for spider biz logics 
			if (result.type == "error") {
				callback(exception.getErrorModel({
					status: 400,
					message: result.message
				}));
			} else {
				callback(result);
			}
		}
	};
	this.autoExtractProductPictures = function(httpUrl, callback) {
		var spider = new PictureSpider(httpUrl);
		spider.addHandler('success', _.bind(extractDataDetailHandler, this, callback));
		spider.addHandler('error', _.bind(extractDataDetailHandler, this, callback));
		spider.start();
	};
};
module.exports = function() {
	return new PictureDataProvider();
};