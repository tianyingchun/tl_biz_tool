var logger = require('../helpers/log');
var dataProvider = require("../dataProvider");
var Q = require("q");
var productAttribtsDal = dataProvider.getDataAccess("ProductAttribute");
var manufacturerDal = dataProvider.getDataAccess("Manufacturer");
var catalogDal = dataProvider.getDataAccess("Catalog");

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

    this.getProductSizeTemplates = function() {
        var deferred = Q.defer();
        var templates = [];
        //  now add product size table template 'clothes'
        templates.push({
            Name: "Women Clothing",
            TemplateFileName: "women_clothing.html"
        });
        deferred.resolve(templates);
        return deferred.promise;
    };
    /**
     * 返回所有的产品分类列表
     */
    this.getAllCatagory = function() {
        return catalogDal.getAllCatagory();
    };
};
module.exports = UtilityDataProvider;