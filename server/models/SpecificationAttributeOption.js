var util = require('util');
var BaseModel = require("./BaseModel");

function SpecificationAttributeOption() {

	BaseModel.call(this, "SpecificationAttributeOption");

	this.SpecificationAttributeId = 0;

	this.Name = "";

	this.Remarks = "工具自动创建";

	this.DisplayOrder = 0;
};

util.inherits(SpecificationAttributeOption, BaseModel);

module.exports = SpecificationAttributeOption;