// https://github.com/kriskowal/q
var Q = require("q");
var async = require("async");
var logger = require('../../helpers/log');
var utility = require('../../helpers/utility');
var dataProvider = require("../../dataProvider");
var ProductAttributeModel = dataProvider.getModel("ProductAttribute");
var ProductAttributeValueModel = dataProvider.getModel("ProductAttributeValue");
var PVAMappingModel = dataProvider.getModel("PVAMapping");
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
	 * Add product attribute values
	 * @param {id} productAttributeMappingId product AttributeMappingId.[[dbo].[ProductVariant_ProductAttribute_Mapping]]
	 * @param {string}  productAttributeKey  product attribute key .e.g  color:
	 * @param {array} productAttributeValues
	 *         color:->[{  
                    "title": "Camel",
                    "value": ""
                },
                {
                    "title": "Dark gray",
                    "value": ""
                }]
	 */
    this.addProductAttributeValues = function(productAttributeMappingId, productAttributeKey, productAttributeValues) {
        var deferred = Q.defer();
        var productAttribute_values_sql = "INSERT INTO dbo.ProductAttributeValue( ProductAttributeMappingId ,AttributeValueTypeId,AssociatedProductId, Name , ColorSquaresRgb ,  PriceAdjustment , WeightAdjustment ,Cost, Quantity, IsPreSelected , DisplayOrder, PictureId) VALUES  ({0},{1},{2},{3},{4},{5},{6},{7},{8},{9},{10},{11})";
        // product attributes.
        var sql = [];
        var params = [];
        var seed = 12;

        var len = productAttributeValues.length;

        for (var i = 0; i < len; i++) {
            // color|size...
            var _productVariantOption = productAttributeValues[i];
            // speical deal with color option.
            var colorSqureRgb = "";
            // get variant option name.
            var productVariantOptionName = _productVariantOption.value;

            // if it is color, we need to user title as the option name.
            if (productAttributeKey.toLowerCase() == "color") {
                productVariantOptionName = _productVariantOption.title;
                colorSqureRgb = "#" + _productVariantOption.value;
            }


            if (i == 0) {
                sql.push(productAttribute_values_sql);
            } else {
                var _tmp = productAttribute_values_sql;
                for (var j = 0; j < seed; j++) {
                    var replaceRegex = new RegExp('\\{' + j + '\\}', "g");
                    _tmp = _tmp.replace(replaceRegex, "{" + (i * seed + j) + "}");
                };
                sql.push(_tmp);
            }
            params.push(productAttributeMappingId, 0, 0, productVariantOptionName, colorSqureRgb, 0, 0, 0, 1, false, 0, 0);
        };
        params.unshift(sql.join(";"));

        baseDal.executeNoneQuery(params).then(function() {

            var resultMsgObj = baseDal.buildResultMessages("addProductAttributeValues", {
                productAttributeKey: productAttributeKey,
                VariantAttributeMappingId: productAttributeMappingId,
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
     * 返回指定产品SKU 的所有的Product Variant attribute list
     */
    this.getProductAttributesBySku = function(sku) {

        var deferred = Q.defer();

        var pvaMappingSql = "SELECT " +
            " ppvm.Id,ppvm.ProductAttributeId,pa.Name AS ProductAttributeName,ppvm.TextPrompt,ppvm.IsRequired,ppvm.AttributeControlTypeId,ppvm.DisplayOrder " +
            " FROM dbo.Product_ProductAttribute_Mapping ppvm INNER JOIN dbo.ProductAttribute pa ON ppvm.ProductAttributeId = pa.Id" +
            " WHERE ProductId IN (SELECT Id FROM dbo.Product WHERE Sku={0});";

        baseDal.executeList(PVAMappingModel, [pvaMappingSql, sku]).then(function(listPVAMapping) {

            var tasks = [];
            if (listPVAMapping && listPVAMapping.length) {
                for (var i = 0; i < listPVAMapping.length; i++) {
                    var pvaMapping = listPVAMapping[i];
                    var pvaMappingId = pvaMapping.Id;
                    var productAttributeName = pvaMapping.ProductAttributeName;
                    var currFn = (function(id, productAttributeName) {
                        return function(callback) {
                            getProductAttributeValue(id, productAttributeName).then(function(result) {
                                callback(null, result);
                            }, function(err) {
                                callback(err);
                            });
                        };
                    })(pvaMappingId, productAttributeName);

                    tasks.push(currFn);
                };
            }

            async.parallel(tasks, function(err, results) {
                if (err) {
                    deferred.reject(err);
                } else {
                    var _result = [];
                    if (results.length) {
                        results.forEach(function(item) {
                            _result = _result.concat(item);
                        });
                    }
                    deferred.resolve(_result);
                }
            });
        }, function(err) {
            deferred.reject(err);
        });
        return deferred.promise;
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


    //
    // helper methods
    // ------------------------------------------------------------
    // 
    function getProductAttributeValue(productAttributeMappingId, productAttributeName) {
        var sql = "SELECT * FROM dbo.ProductAttributeValue WHERE ProductAttributeMappingId ={0}";
        return baseDal.executeList(ProductAttributeValueModel, [sql, productAttributeMappingId]).then(function(results) {
            var _results = [];
            if (results && results.length) {
                results.forEach(function(item) {
                    item.ProductAttributeName = productAttributeName;
                    _results.push(item);
                });
            }
            return _results;
        });
    };
};
module.exports = ProductAttributeDal;