var logger = require('../helpers/log');
var dataProvider = require("../dataProvider");

var ProductAttributeDal = dataProvider.getDataAccess("ProductAttribute");
var ManufacturerDal = dataProvider.getDataAccess("Manufacturer");
var CatalogDal = dataProvider.getDataAccess("Catalog");

// product attributes data access instance.
var productAttribtsDal = new ProductAttributeDal();
var manufacturerDal = new ManufacturerDal();
var categoryDal = new CatalogDal();

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

    /**
     * 返回所有的产品分类列表
     */
    this.getAllCatagory = function() {
        return categoryDal.getAllCatagory();
    };
};
module.exports = UtilityDataProvider;
