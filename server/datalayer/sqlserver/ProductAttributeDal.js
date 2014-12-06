// https://github.com/kriskowal/q
var Q = require("q");
var logger = require('../../helpers/log');
var utility = require('../../helpers/utility');
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
		return baseDal.executeEntity(ProductAttributeModel, [sql, utility.capitalize(productAttribute.Name), productAttribute.Description])
			.then(function success(newEntity) {
				if (newEntity && newEntity.Id) {
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
			if (find && find.Id) {
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
	 * Add productVariant attribute values
	 * @param {id} productVariantAttributeMappingId productVariant AttributeMappingId.[[dbo].[ProductVariant_ProductAttribute_Mapping]]
	 * @param {string}  productVariantAttributeKey  productvariant attribute key .e.g  color:
	 * @param {array} productVariantAttributeValues
	 *         color:->[{  
                    "title": "Camel",
                    "value": ""
                },
                {
                    "title": "Dark gray",
                    "value": ""
                }]
	 */
	this.addProductVariantAttributeValues = function(productVariantAttributeMappingId, productVariantAttributeKey, productVariantAttributeValues) {
		var deferred = Q.defer();
		var productVariantAttribute_values_sql = "INSERT INTO dbo.ProductVariantAttributeValue( ProductVariantAttributeId , Name , ColorSquaresRgb ,  PriceAdjustment , WeightAdjustment , IsPreSelected , DisplayOrder)VALUES  ({0},{1},{2},{3},{4},{5},{6})";
		// product attributes.
		var sql = [];
		var params = [];
		var seed = 7;

		var len = productVariantAttributeValues.length;

		for (var i = 0; i < len; i++) {
			// color|size...
			var _productVariantOption = productVariantAttributeValues[i];
			// speical deal with color option.
			var colorSqureRgb = productVariantAttributeKey.toLowerCase() == "color" ? "#" + _productVariantOption.value : "";

			if (i == 0) {
				sql.push(productVariantAttribute_values_sql);
			} else {
				var _tmp = productVariantAttribute_values_sql;
				for (var j = 0; j < seed; j++) {
					var replaceRegex = new RegExp('\\{' + j + '\\}', "g");
					_tmp = _tmp.replace(replaceRegex, "{" + (i * seed + j) + "}");
				};
				sql.push(_tmp);
			}
			params.push(productVariantAttributeMappingId, _productVariantOption.title, colorSqureRgb, 0, 0, false, 0);
		};
		params.unshift(sql.join(";"));

		baseDal.executeNoneQuery(params).then(function() {

			var resultMsgObj = baseDal.buildResultMessages("addProductVariantAttributeValues", {
				productVariantAttributeKey: productVariantAttributeKey,
				VariantAttributeMappingId: productVariantAttributeMappingId,
				VariantAttributeValuesCounts: len
			});

			deferred.resolve(resultMsgObj.getResult());

		}, function(err) {
			logger.error("Invoke Insert ProductVariantAttributeValue table Error: ", err);
			deferred.reject("Add Product VariantAttribute Values failed!");
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