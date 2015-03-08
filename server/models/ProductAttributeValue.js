var util = require('util');
var BaseModel = require("./BaseModel");

function ProductAttributeValue(name, description) {
	BaseModel.call(this, "ProductAttributeValue");

	this.ProductAttributeMappingId = 0;
	this.AttributeValueTypeId = 0;
	this.AssociatedProductId = 0;
	this.ProductAttributeName = "";
	this.Name = "";
	this.ColorSquaresRgb = "";
	this.PriceAdjustment = 0;
	this.WeightAdjustment = 0;
	this.Cost = 0;
	this.Quantity = 1;
	this.IsPreSelected = false;
	this.DisplayOrder = 0;
	this.PictureId = 0;
};
util.inherits(ProductAttributeValue, BaseModel);

module.exports = ProductAttributeValue;