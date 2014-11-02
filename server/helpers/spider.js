// var select = require('soupselect').select,
// htmlparser = require("htmlparser"),
// https://github.com/cheeriojs/cheerio
var cheerio = require('cheerio'),
	_ = require('underscore'),
	http = require('http'),
	fs = require("fs-extra");
var config = require("../config")();
var logger = require('./log');

var exception = require("./exception");
var EventTarget = require("./EventTarget");
var skuStyleContent = "";
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
			callback(body);
			// var parser = new htmlparser.Parser(handler);
			// parser.parseComplete(body);
		});
		response.on("error", function(err) {
			callback(exception.getErrorModel(err));
		});
	}).on('error', function(err) {
		callback(exception.getErrorModel(err));
	});
};


function rgbConvert2Hex(rgb) {
	if (!rgb) return "";
	var regexp = /^rgb\(([0-9]{0,3})\,\s([0-9]{0,3})\,\s([0-9]{0,3})\)/g;
	var re = rgb.replace(regexp, "$1 $2 $3").split(" "); //利用正则表达式去掉多余的部分
	var hexColor = "#";
	var hex = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];
	for (var i = 0; i < 3; i++) {
		var r = null;
		var c = re[i];
		var hexAr = [];
		while (c > 16) {
			r = c % 16;
			c = (c / 16) >> 0;
			hexAr.push(hex[r]);
		}
		hexAr.push(hex[c]);
		hexColor += hexAr.reverse().join('');
	}
	return hexColor;
};

// download fetch sku color style cotent
function fetchSkuColorStyleContent(callback) {
	if (!skuStyleContent) {
		var module_product_extract = fs.readJsonSync("../module_config.json").module_product_extract;
		var sku_color_url = module_product_extract.sku_color_css_url;
		loadHtmlDocument(sku_color_url, function(body) {
			skuStyleContent = body;
			callback({
				body: "",
				url: sku_color_url
			});
		});
	} else {
		// do some fetch operations.
		callback({
			body: skuStyleContent,
			url: sku_color_url
		});
	}
};

// color spec dom converter.
function fetchProductSpecColor($, $lis) {
	var result = [];
	logger.debug("styles: ", skuStyleContent);
	if ($lis && $lis.length) {
		$lis.each(function(i, liItem) {
			var $liItem = $(liItem);
			var $colorSpan = $liItem.find("span.color");
			if ($colorSpan && $colorSpan.length) {
				if ($colorSpan[0].name == "span") {
					// convert rgb 2 hex.
					var colorTitle = $colorSpan.attr("title");
					var color = rgbConvert2Hex($colorSpan.css("backgroundColor"));
					result.push({
						title: colorTitle,
						value: color
					});
				} else {
					logger.debug("fetchProductSpecColor failed-->> color option is not span maybe is image");
				}
			}

		});
	}
	return result;
};

// size list dom converter.
function fetchProductSpecSize($, $lis) {
	var result = [];
	if ($lis && $lis.length) {
		$lis.each(function(i, liItem) {
			var $liItem = $(liItem);
			var $sizeSpan = $liItem.find("a>span");
			// convert rgb 2 hex.
			var value = $sizeSpan.text();
			result.push({
				title: value,
				value: value
			});
		});
	}
	return result;
};

function fetchProductSpecOther($, $lis) {
	var result = [];
	if ($lis && $lis.length) {
		$lis.each(function(i, liItem) {
			var $liItem = $(liItem);
			var $otherSpan = $liItem.find("a>span");
			// convert rgb 2 hex.
			var value = $otherSpan.text();
			result.push({
				title: value,
				value: value
			});
		});
	}
	return result;
};

function fetchProductDescriptions($) {
	var $description = $("#custom-description").find(".ui-box-body");
	if ($description && $description.length) {
		$description.find("a").remove();
	}
	return $description.html();
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
	this.$dom = "";

	// page title
	this.title = "";
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
			oldPrice: this.oldPrice,
			nowPrice: this.nowPrice,
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
		fetchSkuColorStyleContent(function(result) {
			if (!result.body) {
				logger.error("pre load sku color style failed!", result.url);
				_this.__error({
					message: "preload sku color style failed! url: " + result.url
				});
			} else {
				loadHtmlDocument(_this.url, function(body) {
					// now we have the whole body, parse it and select the nodes we want...
					var $ = cheerio.load(body, {
						normalizeWhitespace: true,
						xmlMode: true
					});

					_this.__finished();

					if ($.failed === true) {
						debug("loadHtmlDocument failed!");
						_this.__error($);
					} else {
						// save current all dom html codes.
						_this.$dom = $;
						// fetch all sorted categories.
						_this.fetchCategories();
						// fetch page title.
						_this.fetchTitle();
						// fetch price list from highest price 2 lowest price. [18.00,17.00,15.00] --USD
						_this.fetchOldPriceList();

						_this.fetchNowPriceList();
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
		logger.debug("filter to get categories...");
		var $breadcrumb = this.$dom("div.ui-breadcrumb >a");
		var crumb = [];
		var $ = this.$dom;
		$breadcrumb.each(function(i, item) {
			crumb.push($(item).text());
		});
		this.categories = crumb.reverse();
	},
	fetchTitle: function() {
		logger.debug("filter to get title content...");
		this.title = this.$dom("h1.product-name").text();
	},
	fetchOldPriceList: function() {
		logger.debug("filter to get old price list...");
		var prices = this.$dom("#sku-price").text().split(/\s*-\s*/);
		this.oldPrice = prices.reverse();
	},
	fetchNowPriceList: function() {
		logger.debug("filter to get now sale price list...");
		var prices = [];
		var $discount_price = this.$dom("#sku-discount-price").find('span');
		var $ = this.$dom;
		// check if we have multi prices.
		if ($discount_price && $discount_price.length) {
			$discount_price.each(function(i, item) {
				prices.push($(item).text());
			});
		} else {
			prices.push(this.$dom("#sku-discount-price").text());
		}
		this.nowPrice = prices.reverse();
	},
	fetchProductAttribtsList: function() {
		logger.debug("filter to get product variant specifications list...");
		var $ = this.$dom;
		var $dl = $("#product-info-sku").find("dl");
		var productAttribtsList = {};
		$dl.each(function(i, dlItem) {
			var $dlItem = $(dlItem);
			var $lis = $dlItem.find("ul li");
			var title = $dlItem.find(".pp-dt-ln").text();

			title = title && title.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

			if (title == "color") {
				productAttribtsList[title] = fetchProductSpecColor($, $lis);
			} else if (title == "size") {
				productAttribtsList[title] = fetchProductSpecSize($, $lis);
			} else {
				productAttribtsList[title] = fetchProductSpecOther($, $lis);
			}

		});
		this.productAttribts = productAttribtsList;
	},
	fetchspecAttribts: function() {
		logger.debug("filter to get specifications attributes...");
		var $ = this.$dom;
		var $specItems = $("#product-desc dl.ui-attr-list");
		var result = [];
		if ($specItems && $specItems.length) {
			$specItems.each(function(i, item) {
				var title = $(item).find("dt").text();
				title = title && title.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
				var value = $(item).find("dd").text();
				result.push({
					title: title,
					value: value
				});
			});
		}
		this.specAttribts = result;
	},
	fetchDescription: function() {
		logger.debug("filter to get product description...");
		this.description = fetchProductDescriptions(this.$dom);
	}
});


module.exports = SpiderService;