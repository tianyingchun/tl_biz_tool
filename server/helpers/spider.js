var select = require('soupselect').select,
	htmlparser = require("htmlparser"),
	http = require('http');

var config = require("../config")();
var debug = require('debug')(config.appName);
var exception = require("./exception");

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

var SpiderService = function(httpUrl, callback) {
	this.url = httpUrl;
	this.callback = callback;

	var _this = this;
	loadHtmlDocument(this.url, function(result) {
		
	});
};

SpiderService.prototype = {
	fetchTitle: function() {

	}
};

module.exports = SpiderService;