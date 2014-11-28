// https://github.com/kriskowal/q
var Q = require("q");
var logger = require('../../helpers/log');
var dataProvider = require("../../dataProvider");

// related models.
var SpecificationAttributeModel = dataProvider.getModel("SpecificationAttribute");
var SpecificationAttributeOptionModel = dataProvider.getModel("SpecificationAttributeOption");
var Product_SpecificationAttribute_MappingModel = dataProvider.getModel("Product_SpecificationAttribute_Mapping");

var baseDal = require("../baseDal");

function SpecificationAttributeDal() {
    /**
     * Get specification attribute by name
     * @param  {string}  name specification attribute name
     * @return {promise}
     */
    this.getSpecificationAttributeByName = function(name) {
        var sql = "SELECT* FROM SpecificationAttribute WHERE Name = {0}";
        return baseDal.executeEntity(SpecificationAttributeModel, [sql, name]);
    };

    /**
     * Add new specification attribute item
     * @param {object} SpecificationAttribute instance of SpecificationAttributeModel.
     * @return {promise}
     */
    this.addNewSpecificationAttribute = function(specificationAttribute) {
        var sql = "INSERT INTO SpecificationAttribute( Name ,ParticalViewName ,Remarks ,DisplayOrder) VALUES ({0},{1},{2},{3});SELECT SCOPE_IDENTITY() AS Id;";
        return baseDal.executeEntity(SpecificationAttributeModel, [
            sql,
            specificationAttribute.Name,
            specificationAttribute.ParticalViewName,
            specificationAttribute.Remarks,
            specificationAttribute.DisplayOrder
        ]).then(function(newSpecificationAttribute) {
            specificationAttribute.Id = newSpecificationAttribute.Id || 0;
            return specificationAttribute;
        });
    };

    /**
     * Add Or Update SpecificationAttributeOption
     * @param {object} SpecificationAttributeOptionModel instance.
     * @return {promise}
     */
    this.addOrUpdateSpecificationAttributeOption = function(specificationAttributeOption) {
        var checkExistRecordSql = "SELECT  * FROM  SpecificationAttributeOption WHERE SpecificationAttributeId={0} AND Name = {1}";
        var insertRecordSql = "INSERT INTO SpecificationAttributeOption( SpecificationAttributeId , Name , Remarks , DisplayOrder ) VALUES ({0},{1},{2},{3})";
        // finnaly sql command string.
        var sql = "IF NOT EXISTS (" + checkExistRecordSql + ") BEGIN " + insertRecordSql + checkExistRecordSql + "END ELSE BEGIN" + checkExistRecordSql + "END;";

        return baseDal.executeEntity(SpecificationAttributeOptionModel, [
            sql,
            specificationAttributeOption.SpecificationAttributeId,
            specificationAttributeOption.Name,
            specificationAttributeOption.Remarks,
            specificationAttributeOption.DisplayOrder
        ]);
    };

    /**
     * Add Or Update Product Specification Attributes Mapping items
     * @param {object} ProductSpecificationAttributeMapping instance.
     * @return {promise}
     */
    this.addOrUpdateProductSpecificationAttributesMapping = function(productSpecificationAttributeMapping) {
        
        var sql = "INSERT INTO Product_SpecificationAttribute_Mapping (ProductId,  SpecificationAttributeOptionId, CustomValue, AllowFiltering, ShowOnProductPage, DisplayOrder ) VALUES  ({0},{1},{2},{3},{4},{5})";
        
        // short cut of passed parameter.
        var productSAP = productSpecificationAttributeMapping;

        if (!productSAP.ProductId ||
            !productSAP.SpecificationAttributeOptionId) {
            logger.warn("We must provider `ProductId`,`SpecificationAttributeOptionId` within `addOrUpdateProductSpecificationAttributesMapping()`");
            return baseDal.promise("We must provider `ProductId`,`SpecificationAttributeOptionId` within `addOrUpdateProductSpecificationAttributesMapping()`");
        } else {
            return baseDal.executeEntity(Product_SpecificationAttribute_MappingModel, [
                sql,
                productSAP.ProductId,
                productSAP.SpecificationAttributeOptionId,
                productSAP.CustomValue,
                productSAP.AllowFiltering,
                productSAP.ShowOnProductPage,
                productSAP.DisplayOrder
            ]);
        }
    };


};
module.exports = SpecificationAttributeDal;
