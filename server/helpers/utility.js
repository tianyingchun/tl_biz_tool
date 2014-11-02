var http = require('http');
var fs = require("fs-extra");
var cheerio = require('cheerio');
var logger = require('./log');
var exception = require("./exception");

// module product extract config.
var module_picture_extract = fs.readJsonSync("../module_config.json").module_picture_extract;

/**
 * download html source code helper function.
 * @param  {string}   url      webiste product detail page absolute url
 * @param  {Function} callback [description]
 */
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

/**
 * download picture utility, used to download all specificed product pictures within a webpage comes from given http page/desc url
 *
 * @param  {string}   url product detail page url.
 * @param  {string}   saveto    the destination directory path
 * @param  {Function} callback  [description]
 */
function downloadPicture(url, saveto, callback) {
	loadHtmlDocument(url, function(result) {
		if (result) {
			// find all picture urls saved to temporay array.
			// now we have the whole body, parse it and select the nodes we want...
			var $ = cheerio.load(body, {
				normalizeWhitespace: true,
				xmlMode: true
			});
			// make sure has distination directory.
			fs.ensureDirSync(module_picture_extract.saveto_dir);

			var $imgs = $("img");
			$imgs.each(function(i, item) {
				var src = $(item).attr("src");

			});

			callback();
		} else {
			callback(exception.getErrorModel({
				message: "can't find any <img /> tag within providered product detail page."
			}));
		}
	});
};

/**
 * extractProductId description
 * @param  {string} url product http absolute url.
 */
function extractProductId(url) {
	if (url) {
		return url.match(/[^/]*$/)[0].replace(/.html.*$/, "");
	}
	return "";
};

module.exports = {
	extractProductId: extractProductId,
	loadHtmlDocument: loadHtmlDocument
};