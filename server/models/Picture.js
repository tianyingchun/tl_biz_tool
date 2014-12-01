var util = require('util');
var BaseModel = require("./BaseModel");

function Picture(mimeType, seoFileName, isNew, displayOrder) {
	BaseModel.call(this, "Picture");
	this.PictureBinary = [];
	this.MimeType = mimeType;
	this.SeoFilename = seoFileName;
	this.IsNew = isNew;
	this.DisplayOrder = displayOrder;
};
util.inherits(Picture, BaseModel);

module.exports = Picture;