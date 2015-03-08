// https://github.com/kriskowal/q
var Q = require("q");
var logger = require('../../helpers/log');
var dataProvider = require("../../dataProvider");
var utility = require("../../helpers/utility");
// related models.
var SpecificationAttributeModel = dataProvider.getModel("SpecificationAttribute");
var SpecificationAttributeOptionModel = dataProvider.getModel("SpecificationAttributeOption");
var Product_SpecificationAttribute_MappingModel = dataProvider.getModel("Product_SpecificationAttribute_Mapping");

var baseDal = require("../baseDal");

function SpecificationAttributeDal() {
    /**
     * Get specification attributes by name using similarity
     * @param  {string}  name specification attribute name
     * @return {promise}
     */
    this.getSpecificationAttributesByName = function(name) {
        // make color, colors as the same attribute. similarity <2  
        var sql = "SELECT* FROM SpecificationAttribute WHERE dbo.edit_distance(Name, {0})<2";
        return baseDal.executeList(SpecificationAttributeModel, [sql, name]);
    };

    /**
     * Add new specification attribute item
     * @param {object} SpecificationAttribute instance of SpecificationAttributeModel.
     * @return {promise}
     */
    this.addNewSpecificationAttribute = function(specificationAttribute) {
        var sql = "INSERT INTO SpecificationAttribute( Name ,DisplayOrder) VALUES ({0},{1});SELECT SCOPE_IDENTITY() AS Id;";
        return baseDal.executeEntity(SpecificationAttributeModel, [
            sql,
            specificationAttribute.Name,
            specificationAttribute.DisplayOrder
        ]).then(function(newSpecificationAttribute) {
            specificationAttribute.Id = newSpecificationAttribute.Id || 0;
            return specificationAttribute;
        });
    };

    /**
     * Create short cut to avoid create repeated specification attribute
     * @param  {object} specificationAttribute SpecificationAttributeModel
     * @return {promise}
     */
    this.autoCreatedSpecificationAttributeIfNotExist = function(specificationAttribute) {
        var deferred = Q.defer();
        // find all product attributes.
        var _this = this;
        var name = specificationAttribute.Name.toLowerCase();

        this.getSpecificationAttributesByName(name).then(function(find) {
            if (find && find.length) {
                logger.debug("found exist product specification attribute..", name);
                deferred.resolve(find[0]);
            } else {
                _this.addNewSpecificationAttribute(specificationAttribute).then(function(newSpecificationAttribute) {
                    logger.debug("add new product specification attribute..", name);
                    deferred.resolve(newSpecificationAttribute);
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
     * Add Or Update SpecificationAttributeOption
     * @param {object} SpecificationAttributeOptionModel instance.
     * @return {promise}
     */
    this.addOrUpdateSpecificationAttributeOption = function(specificationAttributeOption) {
        var checkExistRecordSql = "SELECT  * FROM  SpecificationAttributeOption WHERE SpecificationAttributeId={0} AND dbo.edit_distance(Name, {1})<2 ";
        var insertRecordSql = "INSERT INTO SpecificationAttributeOption( SpecificationAttributeId , Name , DisplayOrder ) VALUES ({0},{1},{2})";
        // finnaly sql command string.
        var sql = "IF NOT EXISTS (" + checkExistRecordSql + ") BEGIN " + insertRecordSql + " " + checkExistRecordSql + " END ELSE BEGIN " + checkExistRecordSql + " END;";

        return baseDal.executeEntity(SpecificationAttributeOptionModel, [
            sql,
            specificationAttributeOption.SpecificationAttributeId,
            specificationAttributeOption.Name,
            specificationAttributeOption.DisplayOrder
        ]);
    };

    /**
     * update all specification attribtues AllowFiltering=Flase for specific product.
     * @return {promise}
     */
    this.updateProductSpecificatinAttributeAllowFiltering2False = function(productId) {
        // first we need to update all product AllowFiltering = False. Except 'color'||'size'
        // we need to keep color, size as AllowFiltering = True. because color size is manully added.
        // the specification attribute 'color','size' has been added in blacklist in <crawl_config.product_spec_attributes_name_blacklist>
        var updateAllAllowFiltering2False = "UPDATE Product_SpecificationAttribute_Mapping SET AllowFiltering=0 WHERE SpecificationAttributeOptionId NOT IN (SELECT Id FROM dbo.SpecificationAttributeOption WHERE SpecificationAttributeId IN (SELECT Id FROM dbo.SpecificationAttribute WHERE  dbo.edit_distance(Name, 'size')<2 OR dbo.edit_distance(Name, 'color')<2 )) AND ProductId={0}";

        return baseDal.executeNoneQuery([updateAllAllowFiltering2False, productId]);

    };
    /**
     * Add Or Update Product Specification Attributes Mapping items
     * @param {object} ProductSpecificationAttributeMapping instance.
     * @return {promise}
     */
    this.addOrUpdateProductSpecificationAttributesMapping = function(productSpecificationAttributeMapping) {

        var checkExistRecordSql = "SELECT  * FROM  Product_SpecificationAttribute_Mapping WHERE ProductId={0} AND SpecificationAttributeOptionId = {1} ";
        // while for existed logics we need to re set AllowFiltering according by current specAttributeWhiteList config in  autoupload_config.specification_attribute_white_list
        var updateAllowFilteringSql = "UPDATE Product_SpecificationAttribute_Mapping SET AllowFiltering={3} WHERE ProductId={0} AND SpecificationAttributeOptionId = {1} ";
        var insertRecordSql = "INSERT INTO Product_SpecificationAttribute_Mapping (ProductId,  SpecificationAttributeOptionId, CustomValue, AllowFiltering, ShowOnProductPage, DisplayOrder ) VALUES  ({0},{1},{2},{3},{4},{5})";

        // finnaly sql command string.
        var sql = "IF NOT EXISTS (" + checkExistRecordSql + ") BEGIN " + insertRecordSql + " " + checkExistRecordSql + " END ELSE BEGIN " + updateAllowFilteringSql + " " + checkExistRecordSql + " END;";

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