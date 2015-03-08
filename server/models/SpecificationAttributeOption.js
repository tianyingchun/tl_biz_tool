var util = require('util');
var BaseModel = require("./BaseModel");

function SpecificationAttributeOption(specificationAttributeId, name) {

	BaseModel.call(this, "SpecificationAttributeOption");

	this.SpecificationAttributeId = specificationAttributeId || 0;

	this.Name = name || "";

	this.DisplayOrder = 0;
};

util.inherits(SpecificationAttributeOption, BaseModel);

module.exports = SpecificationAttributeOption;