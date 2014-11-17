var util = require('util');
var _ = require('underscore');
var exception = require('../../helpers/exception');
var logger = require('../../helpers/log');

var ProductAttributeDal = require("../../datalayer/productAttributeDal");
var ManufacturerDal = require("../../datalayer/manufacturerDal");

// product attributes data access instance.
var productAttribtsDal = new ProductAttributeDal();
var manufacturerDal = new ManufacturerDal();
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
		return productAttribtsDal.getAttributControlTypeIds();
	};
	/**
	 * 获取所有的产品Manufacturer列表
	 */
	this.getAllManufacturers = function() {
		return manufacturerDal.getAllManufacturers();
	};
};
module.exports = function() {
	return new UtilityDataProvider();
};