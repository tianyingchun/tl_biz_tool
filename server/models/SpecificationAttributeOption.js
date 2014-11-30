var util = require('util');
var BaseModel = require("./BaseModel");

function SpecificationAttributeOption(specificationAttributeId, name) {

	BaseModel.call(this, "SpecificationAttributeOption");

	this.SpecificationAttributeId = specificationAttributeId || 0;

	this.Name = name || "";

	this.Remarks = "工具自动创建";

	this.DisplayOrder = 0;
};

util.inherits(SpecificationAttributeOption, BaseModel);

module.exports = SpecificationAttributeOption;