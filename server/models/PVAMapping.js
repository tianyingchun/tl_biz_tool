var util = require('util');
var BaseModel = require("./BaseModel");

function PVAMapping() {
	BaseModel.call(this, "PVAMapping");

	this.Id = 0;

	this.ProductVariantId = 0;

	this.ProductAttributeId = 0;

	this.TextPrompt = "Nothing";

	this.IsRequired = true;

	this.AttributeControlTypeId = 0;

	this.DisplayOrder = 0;
	
};

util.inherits(PVAMapping, BaseModel);

module.exports = PVAMapping;