var util = require('util');
var BaseModel = require("./BaseModel");

function SpecificationAttribute(name) {

	BaseModel.call(this, "SpecificationAttribute");

	this.Name = name || ""; 
	
	this.DisplayOrder = 20;
};

util.inherits(SpecificationAttribute, BaseModel);

module.exports = SpecificationAttribute;