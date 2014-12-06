var util = require('util');
var BaseModel = require("./BaseModel");

function Picture(mimeType, seoFileName, isNew) {
	BaseModel.call(this, "Picture");
	this.PictureBinary = [];
	this.MimeType = mimeType;
	this.SeoFilename = seoFileName;
	this.IsNew = isNew;
};
util.inherits(Picture, BaseModel);

module.exports = Picture;