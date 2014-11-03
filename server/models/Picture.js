function Picture(id, pictureBinary, mimeType, seoFileName, isNew, displayOrder, fullPath) {
	this.Id = id;
	this.PictureBinary = pictureBinary;
	this.MimeType = mimeType;
	this.SeoFilename = seoFileName;
	this.IsNew = isNew;
	this.DisplayOrder = displayOrder;
	this.FullPath = fullPath;
};
module.exports = Picture;