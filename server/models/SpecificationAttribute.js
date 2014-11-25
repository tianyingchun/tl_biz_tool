var util = require('util');
var BaseModel = require("./BaseModel");

function SpecificationAttribute() {
	
	BaseModel.call(this, "SpecificationAttribute");

	this.Name = "";

	this.ParticalViewName = "_FilterSpecItemCheckbox";

	this.Remarks = "工具自动创建";

	this.DisplayOrder = 0;
};

util.inherits(SpecificationAttribute, BaseModel);

module.exports = SpecificationAttribute;