var util = require('util');
var BaseModel = require("./BaseModel");

function ProductVariantAttributeValue(name, description) {
	BaseModel.call(this, "ProductVariantAttributeValue");

	this.ProductVariantAttributeId = 0;
	
	this.ProductAttributeName = "";
	this.Name = "";
	this.ColorSquaresRgb = "";
	this.PriceAdjustment = 0;
	this.WeightAdjustment = 0;
	this.IsPreSelected = false;
	this.DisplayOrder = 0;
};
util.inherits(ProductVariantAttributeValue, BaseModel);

module.exports = ProductVariantAttributeValue;