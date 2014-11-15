var utility = require("../../helpers/utility");
var exception = require("../../helpers/exception");
var EventTarget = require("../../helpers/EventTarget");
var _ = require('underscore'),
	http = require('http'),
	fs = require("fs-extra");

// product module config.
var module_product_extract_cfg = fs.readJsonSync("../module_config.json").module_product_extract.configs;

function PictureSpiderService(httpUrl) {
	EventTarget.call(this);

	// public properties.
	this.url = httpUrl;

	// current product id.
	this.productId = utility.extractProductId(this.url);

	// the value indicate loading html status.
	this.__status = "starting";

	// the value indicates current html loading type, false: fetching, true: done
	this.__hasFetchDone = false;
	// event data.
	var eventData = {
		"type": "finished"
	};

	this.__starting = function() {
		this.__hasFetchDone = false;
		this.__status = "starting";
		// fire starting loading page document contents event.
		this.fire(_.extend(eventData, {
			"type": "starting"
		}));

		// download product pictures
		var product_description_url = module_product_extract_cfg.product_description_url.value.replace("{pid}", this.productId);
		// run picture spider.
		var _this = this;
		utility.downloadPicture(this.productId, product_description_url, function(result) {
			if (result.failed === true) {
				logger.error("extract product picture failed!", result.error);
				_this.__error({
					message: "extract product picture failed!"
				});
			} else {
				// flush cached result to client.
				_this.__success(result);
			}
		});
	};
	// @private
	this.__finished = function() {
		this.__hasFetchDone = true;
		this.__status = "finished";

		// fire finish loading page document contents event.
		this.fire(_.extend(eventData, {
			"type": "finished"
		}));
	};

	//@private
	this.__error = function(result) {
		this.__hasFetchDone = true;
		this.__status = "failed";
		// fire finish loading page document contents event.
		this.fire(_.extend({
			type: "error"
		}, result));
	};

	// @private
	this.__success = function(result) {
		this.__status = "success";
		// fire finish loading page document contents event.
		this.fire(_.extend({
			type: "success"
		}, result || this.getResult()));
	};

	this.getResult = function() {
		var result = {};
		return result;
	};
};

PictureSpiderService.prototype = new EventTarget();
PictureSpiderService.prototype.constructor = PictureSpiderService;

// expose usefull interface
_.extend(PictureSpiderService.prototype, {
	/**
	 * product spider service entry, we can simple start the whole fetch data operations from here.
	 */
	start: function() {
		this.reLoad();
	},
	reLoad: function() {
		this.__starting();
	}
});
module.exports = PictureSpiderService;