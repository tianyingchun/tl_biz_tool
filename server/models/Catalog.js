/**
 * Category entity model
 * @param {number} id               id.
 * @param {string} name             category name.
 * @param {number} parentCategoryId parent category id.
 * @param {number} displayOrder     display order.
 */
function Catalog(id, name, parentCategoryId, displayOrder) {
	this.Id = id;
	this.Name = name;
	this.ParentCategoryId = parentCategoryId;
	this.DisplayOrder = displayOrder;
}

module.exports = Catalog;