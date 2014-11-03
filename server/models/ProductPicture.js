function ProductPicture(productId, pictureId, displayOrder) {
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
}
module.exports = ProductPicture;