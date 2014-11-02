var utility = require("../../helpers/utility");
var exception = require("../../helpers/exception");
var EventTarget = require("../../helpers/EventTarget");
_ = require('underscore'),
http = require('http'),
fs = require("fs-extra");

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
		// 

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
	this.__success = function() {
		this.__status = "success";
		// fire finish loading page document contents event.
		this.fire(_.extend({
			type: "success"
		}, this.getResult()));
	};

	this.getResult = function() {
		var result = {};
		return result;
	};
};

PictureSpiderService.prototype = new EventTarget();
PictureSpiderService.prototype.constructor = PictureSpiderService;

// expose usefull interface
_.extend(PictureSpiderService.prototype, {\
	/**
	 * product spider service entry, we can simple start the whole fetch data operations from here.
	 */
	start: function() {
		this.reLoad();
	},
	reLoad: function() {
		this.__starting();
	},
});
module.exports = PictureSpiderService;