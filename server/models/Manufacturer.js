var util = require('util');
var BaseModel = require("./BaseModel");
/**
 * Manufacturer entity model
 */
function Manufacturer(i) {
	BaseModel.call(this, "Manufacturer");
	this.Name = "";
	this.Description = "";
	this.ManufacturerTemplateId = 1;
	this.MetaKeywords = "";
	this.MetaDescription = "";
	this.MetaTitle = "";
	this.PictureId = 0;
	this.PageSize = 12;
	this.AllowCustomersToSelectPageSize = 1;
	this.PageSizeOptions = "24,18,30,60,90";
	this.PriceRanges = "0-15;16-30;31-50;51-70;71-90;91-";
	this.SubjectToAcl = false;
	this.Published = false;
	this.Deleted = false;
	this.DisplayOrder = 0;
	this.CreatedOnUtc = new Date();
	this.UpdatedOnUtc = new Date();
};
// inherits base model
util.inherits(Manufacturer, BaseModel);

module.exports = Manufacturer;