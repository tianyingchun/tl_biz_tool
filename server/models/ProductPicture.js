var util = require('util');
var BaseModel = require("./BaseModel");

function ProductPicture(productId, pictureId, displayOrder) {
	BaseModel.call(this, "ProductPicture");
	/// <summary>
	/// Gets or sets the product identifier
	/// </summary>
	this.ProductId = productId;

	/// <summary>
	/// Gets or sets the picture identifier
	/// </summary>
	this.PictureId = pictureId;

	/// <summary>
	/// Gets or sets the display order
	/// </summary>
	this.DisplayOrder = displayOrder;
};
util.inherits(ProductPicture, BaseModel);

module.exports = ProductPicture;