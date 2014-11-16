var sql = require('mssql');
var config = require('../config')();
var logger = require('../helpers/log');
var utility = require('../helpers/utility');
var ProductAttributeModel = require("../models/ProductAttribute");
var baseDal = require("./baseDal");

function ProductAttributeDal() {
	/**
	 * 添加新的ProductAttribute 项目
	 * @param {object} productAttribute
	 */
	this.addNewProductAttribute = function(productAttribute) {
		var sql = " INSERT INTO [dbo].[ProductAttribute] (Name, Description) VALUES({0},{1});SELECT SCOPE_IDENTITY() AS Id;";
		return baseDal.executeEntity(ProductAttributeModel, [sql, productAttribute.Name, productAttribute.Description])
			.then(function success(newEntity) {
				if (newEntity.Id) {
					productAttribute.Id = newEntity.Id;
				}
				return productAttribute;
			});
	};
	/**
	 * 查找默认的是否存在,如果不存则自动创建
	 * @param  {object} productAttribute ProductAttribute Model
	 */
	this.autoCreatedIfNotExist = function(productAttribute) {
		// find all product attributes.
		var _this = this;
		this.getAllProductAttributes().then(function(all) {
			var find = null;
			for (var i = 0; i < all.length; i++) {
				var item = all[i];
				if (item.Name == productAttribute.Name) {
					find = item;
					break;
				}
			};
			return find || _this.addNewProductAttribute(productAttribute);
		});
	};
	/**
	 * 返回所有的ProductAttributes.
	 */
	this.getAllProductAttributes = function() {
		var sql = "SELECT Id, Name, Description FROM ProductAttribute;";
		return baseDal.executeList(ProductAttributeModel, [sql]);
	};
};
module.exports = ProductAttributeDal;