var util = require('util');
var _ = require('underscore');
var config = require("../../config")();
var exception = require('../../helpers/exception');
var productDataSchema = require("../../models/Product");
var debug = require('debug')(config.appName);

var Spider = require("../../helpers/spider");
// product data model.

function ProductDataProvider() {
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
	this.extractOnlineProductDetail = function(httpUrl, callback) {
		var spider = new Spider(httpUrl);
		spider.addHandler('success', _.bind(extractDataDetailHandler, this, callback));
		spider.addHandler('error', _.bind(extractDataDetailHandler, this, callback));
		spider.start();
	};
};

module.exports = function() {
	return new ProductDataProvider();
};