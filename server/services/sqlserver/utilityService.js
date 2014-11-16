var util = require('util');
var _ = require('underscore');
var exception = require('../../helpers/exception');
var logger = require('../../helpers/log');
// https://github.com/kriskowal/q
var Q = require("q");

var productAttribtsDal = new require("../../datalayer/productAttributeDal");
// product data model.
function UtilityDataProvider() {
	/**
	 * 返回所有的ProductAttributes
	 * @return promise List<ProductAttribute> Model.
	 */
	this.getAllProductAttributes = function() {
		return productAttribtsDal.getAllProductAttributes();
	};

	/**
	 * 添加新的产品Attribute
	 * @param {object} productAttribute Model instance.
	 * @return promise<productAttribute>
	 */
	this.addNewProductAttribute = function(productAttribute) {
		return productAttribtsDal.addNewProductAttribute(productAttribute);
	};

	/**
	 * 返回系统支持的所有的产品Attribute 规格ControlType
	 */
	this.getAttributControlTypeIds = function() {
		var deferred = Q.defer();
		// system defiend product attribute control type
		deferred.resolve({
			"DropdownList": 1,
			"RadioList": 2,
			"Checkboxes": 3,
			"TextBox": 4,
			"MultilineTextbox": 10,
			"Datepicker": 20,
			"FileUpload": 30,
			"ColorSquares": 40
		})
		return deferred.promise;
	};
};
module.exports = function() {
	return new UtilityDataProvider();
};