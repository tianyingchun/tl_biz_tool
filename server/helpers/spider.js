var select = require('soupselect').select,
	htmlparser = require("htmlparser"),
	_ = require('underscore'),
	http = require('http');

var config = require("../config")();
var debug = require('debug')(config.appName);
var exception = require("./exception");
var EventTarget = require("./EventTarget");
//download html document via providerd html url.
function loadHtmlDocument(url, callback) {
	// fetch some HTML...
	http.get(url, function(response) {
		response.setEncoding('utf8');
		var body = "";
		response.on('data', function(chunk) {
			body = body + chunk;
		});
		response.on('end', function() {
			// now we have the whole body, parse it and select the nodes we want...
			var handler = new htmlparser.DefaultHandler(function(err, dom) {
				if (err) {
					debug("loadHtmlDocument error---->", err);
					callback(exception.getErrorModel(err));
				} else {
					callback && callback(dom);
				}
			});

			var parser = new htmlparser.Parser(handler);
			parser.parseComplete(body);
		});
		response.on("error", function(err) {
			callback(exception.getErrorModel(err));
		});
	});
};

/**
 * event type: starting, finished, error, success
 * @param {string} httpUrl
 */
function SpiderService(httpUrl) {
	EventTarget.call(this);

	// public properties.
	this.url = httpUrl;
	// store all document code fetched from providered http url.
	this.dom = "";

	// page title
	this.title = "";
	// categories ---women>>dresses ==>[dresses, women]
	this.categories = [];
	// price list the higher the before[10,9,8,5.5]
	this.priceList = [];

	// all product specs attributes eg. color, size, etc.
	this.productAttribts = {
		size: [],
		color: []
	};

	// all key value canbe used to category filtered. e.g. {gender:male, style:american}
	this.specAttribts = {};

	// the html code for description. need to remove all specical characters.
	this.description = "";

	// the value indicate loading html status.
	this.__status = "starting";

	// the value indicates current html loading type, false: fetching, true: done
	this.__hasFetchDone = false;
	// event data.
	var eventData = {
		"type": "finished"
	};
	// @private
	this.__starting = function() {
		this.__hasFetchDone = false;
		this.__status = "starting";
		// fire starting loading page document contents event.
		this.fire(_.extend(eventData, {
			"type": "starting"
		}));

		// loading..
		this._loadPageHtml();
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
		var result = {
			title: this.title,
			categories: this.categories,
			priceList: this.priceList,
			productAttribts: this.productAttribts,
			specAttribts: this.specAttribts,
			description: this.description
		};
		return result;
	};
	this.hasSuccessFetched = function() {
		return this.__status && this.__status == "success";
	};
	// protected method
	this._loadPageHtml = function() {
		var _this = this;
		loadHtmlDocument(this.url, function(result) {
			_this.__finished();

			if (result.failed === true) {
				debug("loadHtmlDocument failed!");
				_this.__error(result);
			} else {
				// save current all dom html codes.
				this.dom = result;
				// fetch all sorted categories.
				_this.fetchCategories();
				// fetch page title.
				_this.fetchTitle();
				// fetch price list from highest price 2 lowest price. [18.00,17.00,15.00] --USD
				_this.fetchPriceList();
				// fetch all supported color list.
				_this.fetchProductAttribtsList();

				//fetch product item specifications.
				_this.fetchspecAttribts();

				// fetch product description.
				_this.fetchDescription();

				_this.__success();
			}
		});
	}
};

SpiderService.prototype = new EventTarget();
SpiderService.prototype.constructor = SpiderService;

// expose usefull interface
_.extend(SpiderService.prototype, {
	start: function() {
		this.reLoad();
	},
	reLoad: function() {
		this.__starting();
	},
	fetchCategories: function() {
		debug("filter to get categories...");
	},
	fetchTitle: function() {
		debug("filter to get title content...");
	},
	fetchPriceList: function() {
		debug("filter to get price list...");
	},
	fetchProductAttribtsList: function() {
		debug("filter to get product variant specifications list...");

	},
	fetchspecAttribts: function() {
		debug("filter to get specifications attributes...");
	},
	fetchDescription: function() {
		debug("filter to get product description...");
	}
});


module.exports = SpiderService;