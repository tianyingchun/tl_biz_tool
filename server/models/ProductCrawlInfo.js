var util = require('util');
var BaseModel = require("./BaseModel");

/**
 * Define crawl prduct info entity model.
 */
function ProductCrawlInfo(url) {
	BaseModel.call(this, "ProductCrawlInfo");
	// page title
	this.title = "";
	// used to store origin title fetched from aliexpress.
	this.originTitle = "";

	this.url = url;

	this.sku = "";

	this.productId = "";
	// categories ---women>>dresses ==>[dresses, women]
	this.categories = [];
	// old price list the higher the before [10,9,8,5.5]
	this.oldPrice = [];
	// now sale price.
	this.nowPrice = [];

	// all product specs attributes eg. color, size, etc.
	this.productAttribts = {};

	// all key value canbe used to category filtered. e.g. {gender:male, style:american}
	this.specAttribts = {};

	// the html code for description. need to remove all specical characters.
	this.description = "";

	// used to store error messages.
	this.errors = [];

	this.getResult = function() {
		var result = {
			sku: this.sku,
			providerUrl: this.url,
			title: this.title,
			originTitle: this.originTitle,
			productId: this.productId,
			categories: this.categories,
			oldPrice: this.oldPrice,
			nowPrice: this.nowPrice,
			productAttribts: this.productAttribts,
			specAttribts: this.specAttribts,
			description: this.description,
			hasErrors: false
		};
		// if some important crawl is unexpected, throw error message.
		if (this.errors.length) {
			var _finallyErrorMsg = [];
			_finallyErrorMsg.push("provider: aliexpress\n");
			_finallyErrorMsg.push("service name: ProductSpiderService()\n");
			// error detail message.

			_finallyErrorMsg.push("details:" + this.errors.map(function(item) {
				return JSON.stringify(item)
			}).join("\n"));

			result = {
				hasErrors: true,
				errors: new Error(_finallyErrorMsg.join(""))
			};
		}
		return result;
	};
};
util.inherits(ProductCrawlInfo, BaseModel);

module.exports = ProductCrawlInfo;