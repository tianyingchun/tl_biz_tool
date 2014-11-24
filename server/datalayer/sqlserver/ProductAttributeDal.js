// https://github.com/kriskowal/q
var Q = require("q");
var logger = require('../../helpers/log');
var dataProvider = require("../../dataProvider");
var ProductAttributeModel = dataProvider.getModel("ProductAttribute");
var baseDal = require("../baseDal");

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
		var deferred = Q.defer();
		// find all product attributes.
		var _this = this;
		var name = productAttribute.Name.toLowerCase();
		this.getProductAttributeByName(name).then(function(find) {
			if (find.Id) {
				logger.debug("found exist product attribute..", name);
				deferred.resolve(find);
			} else {
				_this.addNewProductAttribute(productAttribute).then(function(newAttribute) {
					logger.debug("add new product attribute..", name);
					deferred.resolve(newAttribute);
				}, function(err) {
					deferred.reject(err);
				});
			}
		}, function(err) {
			deferred.reject(err);
		});
		return deferred.promise;
	};
	/**
	 * 返回所有的ProductAttributes.
	 */
	this.getAllProductAttributes = function() {
		var sql = "SELECT Id, Name, Description FROM ProductAttribute;";
		return baseDal.executeList(ProductAttributeModel, [sql]);
	};
	/**
	 * Get product attribute by product attribute name.
	 * @param  {string} name product attribute name
	 */
	this.getProductAttributeByName = function(name) {
		var sql = "SELECT Id, Name, Description FROM ProductAttribute WHERE Name={0};";
		return baseDal.executeEntity(ProductAttributeModel, [sql, name]);
	};

	/**
	 * 返回系统支持的所有的产品Attribute 规格ControlType
	 */
	this.getAttributControlTypeIds = function() {
		var deferred = Q.defer();
		// now no need to use below definitions.
		var system_define = {
			"DropdownList": 1,
			"RadioList": 2,
			"Checkboxes": 3,
			"TextBox": 4,
			"MultilineTextbox": 10,
			"Datepicker": 20,
			"FileUpload": 30,
			"ColorSquares": 40
		};

		// system defiend product attribute control type
		deferred.resolve({
			"color": 40,
			"size": 1,
			"other": 1
		});
		return deferred.promise;
	};
};
module.exports = ProductAttributeDal;