var util = require('util');
var BaseModel = require("./BaseModel");

function Product_SpecificationAttribute_Mapping() {

	BaseModel.call(this, "Product_SpecificationAttribute_Mapping");

	this.ProductId = 0;

	this.SpecificationAttributeOptionId = 0;

	this.CustomValue = null;

	this.AllowFiltering = true;

	this.ShowOnProductPage = true;

	this.DisplayOrder = 0;

};

util.inherits(Product_SpecificationAttribute_Mapping, BaseModel);

module.exports = Product_SpecificationAttribute_Mapping;