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
		return baseDal.executeEntity(ProductAttributeModel, [sql, productAttribute.Name, productAttribute.Description]).then(function success(newEntity) {
			if (newEntity.Id) {
				productAttribute.Id = newEntity.Id;
			}
			return productAttribute;
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