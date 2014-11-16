var util = require('util');
var BaseModel = require("./BaseModel");

function Picture(id, pictureBinary, mimeType, seoFileName, isNew, displayOrder, fullPath) {
	BaseModel.call(this, "Picture");
	this.Id = id;
	this.PictureBinary = pictureBinary;
	this.MimeType = mimeType;
	this.SeoFilename = seoFileName;
	this.IsNew = isNew;
	this.DisplayOrder = displayOrder;
	this.FullPath = fullPath;
};
util.inherits(Picture, BaseModel);

module.exports = Picture;