var http = require('http');
var fs = require("fs-extra");
var path = require("path");
var cheerio = require('cheerio');
var logger = require('./log');
var exception = require("./exception");
var dateFormat = require("./dateformat");

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

function downloadFile(url, dest, callback) {
	var file = fs.createWriteStream(dest);
	var request = http.get(url, function(response) {
		response.pipe(file);
		file.on('finish', function() {
			file.end();
			file.close(callback); // close() is async, call cb after close completes.
		});
	}).on('error', function(err) { // Handle errors
		file.end();
		fs.unlink(dest); // Delete the file async. (But we don't check the result)
		if (callback) callback(exception.getErrorModel(err));
	});
};
/**
 * download picture utility, used to download all specificed product pictures within a webpage comes from given http page/desc url
 *
 * @param  {string}   productId productId of detail page.
 * @param  {string}   url product detail page url.
 * @param  {string}   saveto    the destination directory path
 * @param  {Function} callback  [description]
 */
function downloadPicture(productId, url, callback) {
	loadHtmlDocument(url, function(body) {
		if (body) {
			// find all picture urls saved to temporay array.
			// now we have the whole body, parse it and select the nodes we want...
			var $ = cheerio.load(body, {
				normalizeWhitespace: true,
				xmlMode: true
			});
			// make sure has distination directory.
			var destDir = path.join(module_picture_extract.saveto_dir, dateFormat(new Date(), "YYYY-MM-DD"));
			fs.ensureDirSync(destDir);

			var $imgs = $("img");
			var saved_count = 0;
			var total_picture_count = $imgs.length;
			$imgs.each(function(i, item) {
				var src = $(item).attr("src");
				var filePath = path.join(destDir, productId + "_{0}.jpg".replace("{0}", i));
				logger.debug("picture file path: ", filePath);
				var file = fs.createWriteStream(filePath);
				downloadFile(src, filePath, function(result) {
					// download failed. total picture count -1
					if (result && result.failed === true) {
						total_picture_count--;
					} else {
						// saved_count +1;
						saved_count++;
					}
					if (saved_count >= total_picture_count) {
						callback({
							total_count: saved_count
						});
					}
				});
			});
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
	loadHtmlDocument: loadHtmlDocument,
	downloadPicture: downloadPicture,
	downloadFile: downloadFile
};