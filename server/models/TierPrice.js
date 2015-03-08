var util = require('util');
var BaseModel = require("./BaseModel");
/**
 * Category entity model
 * @param {number} id               id.
 * @param {string} name             category name.
 * @param {number} parentCategoryId parent category id.
 * @param {number} displayOrder     display order.
 */
function TierPrice(productId, quantity, price) {
	BaseModel.call(this, "TierPrice");
	/// <summary>
	/// Gets or sets the product variant identifier
	/// </summary>
	this.ProductId = productId;

	/// <summary>
	/// Gets or sets default store id.
	/// </summary>
	this.StoreId = 0;

	/// <summary>
	/// Gets or sets the customer role identifier  default is NULL for all customer roles.
	/// </summary>
	this.CustomerRoleId = null;

	/// <summary>
	/// Gets or sets the quantity
	/// </summary>
	this.Quantity = quantity;

	/// <summary>
	/// Gets or sets the price
	/// </summary>
	this.Price = price;
};

util.inherits(TierPrice, BaseModel);

module.exports = TierPrice;