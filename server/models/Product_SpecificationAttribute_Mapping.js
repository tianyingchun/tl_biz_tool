var util = require('util');
var BaseModel = require("./BaseModel");

function Product_SpecificationAttribute_Mapping(productId, specificationAttributeOptionId, allowFiltering) {

	BaseModel.call(this, "Product_SpecificationAttribute_Mapping");

	this.ProductId = productId || 0;

	this.SpecificationAttributeOptionId = specificationAttributeOptionId || 0;

	this.CustomValue = null;
	// default is false, true only current specification attribute name is contained in specification_attribute_white_list.
	this.AllowFiltering = allowFiltering || false;

	this.ShowOnProductPage = true;

	this.DisplayOrder = 0;

};

util.inherits(Product_SpecificationAttribute_Mapping, BaseModel);

module.exports = Product_SpecificationAttribute_Mapping;