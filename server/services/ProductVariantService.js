var util = require('util');
var Q = require("q");
var _ = require("underscore");

var async = require("async");

var utility = require("../helpers/utility");

var logger = require('../helpers/log');
// data provider singleton.
var dataProvider = require("../dataProvider");


function ProductVariantDataProvider() {
	var productAttributeDal = dataProvider.getDataAccess("ProductAttribute");

	/**
	 * 返回当前SKU下的所有的ProductVariantAttribtues列表
	 * @param  {string} sku product variant sku
	 * @return {promise}
	 */
	this.getProductVariantAttributesBySku = function(sku) {
		return productAttributeDal.getProductVariantAttributesBySku(sku).then(function(results) {
			// 重新组织产品详情的ProductVariantAttribtue列表

			var _newResult = {};

			if (results && results.length) {
				results.forEach(function(item) {
					if (!_newResult[item.ProductAttributeName]) {
						_newResult[item.ProductAttributeName] = [];
					}
					_newResult[item.ProductAttributeName].push({
						"title": item.Name,
						"value": item.ProductAttributeName.toLowerCase() == "color" ? item.ColorSquaresRgb : item.Name
					});
				});
			}
			return _newResult;
		});
	};
};

module.exports = ProductVariantDataProvider;