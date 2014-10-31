var select = require('soupselect').select,
	htmlparser = require("htmlparser"),
	_ = require('underscore'),
	http = require('http');

var config = require("../config")();
var debug = require('debug')(config.appName);
var exception = require("./exception");
var EventTarget = require("./EventTarget");
//download html document via providerd html url.
function loadHtmlDocument(host, callback) {
	// fetch some HTML...
	// var host = 'www.reddit.com';
	var client = http.createClient(80, host);
	var request = client.request('GET', '/', {
		'host': host
	});
	request.on('response', function(response) {
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
	});
	request.end();
};

var SpiderService = function(httpUrl) {
	EventTarget.call(this);
	// the value indicates current html loading status, false: fetching, true: done
	this.__hasFetchDone = false;
	this.url = httpUrl;
	this.dom = "";


	var _this = this;
	loadHtmlDocument(this.url, function(result) {
		_this.__hasFetchDone = true;
		if (result.failed === true) {
			debug("loadHtmlDocument failed!");
			_this.fire({
				"status": "finished",
				failed: true
			});
		} else {
			// save current all dom html codes.
			this.dom = dom;
			// fetch all sorted categories.
			_this.fetchCategories();
			// fetch page title.
			_this.fetchTitle();
			// fetch price list from highest price 2 lowest price. [18.00,17.00,15.00] --USD
			_this.fetchPriceList();
			// fetch all supported color list.
			_this.fetchColorList();
			// fetch all size list
			_this.fetchSizeList();

			//fetch product item specifications.
			_this.fetchItemSpecs();

			// fetch product description.
			_this.fetchDescription();
		}
	});
};

SpiderService.prototype = new EventTarget();
SpiderService.prototype.constructor = SpiderService;

// expose usefull interface
_.extend(SpiderService.prototype, {
	fetchCategories: function() {
		
	},
	fetchTitle: function() {

	},
	fetchPriceList: function() {

	},
	fetchColorList: function() {

	},
	fetchSizeList: function() {

	},
	fetchItemSpecs: function() {

	},
	fetchDescription: function() {

	}
});


module.exports = SpiderService;