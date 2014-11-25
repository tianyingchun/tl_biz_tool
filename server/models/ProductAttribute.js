var util = require('util');
var BaseModel = require("./BaseModel");

function ProductAttribute(name, description) {
	BaseModel.call(this, "ProductAttribute");
	
	/// <summary>
	/// Gets or sets the picture identifier
	/// </summary>
	this.Name = name;

	/// <summary>
	/// Gets or sets the description
	/// </summary>
	this.Description = description;
};
util.inherits(ProductAttribute, BaseModel);

module.exports = ProductAttribute;