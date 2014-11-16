var util = require('util');
var BaseModel = require("./BaseModel");
/**
 * Category entity model
 * @param {number} id               id.
 * @param {string} name             category name.
 * @param {number} parentCategoryId parent category id.
 * @param {number} displayOrder     display order.
 */
function Catalog(id, name, parentCategoryId, displayOrder) {
	BaseModel.call(this, "Catalog");
	this.Id = id;
	this.Name = name;
	this.ParentCategoryId = parentCategoryId;
	this.DisplayOrder = displayOrder;
};
// inherits base model
util.inherits(Catalog, BaseModel);

// can extends functionality methods in prototype.

// Catalog.prototype.someMethod = function(argument) {
// 	// body...
// };

module.exports = Catalog;