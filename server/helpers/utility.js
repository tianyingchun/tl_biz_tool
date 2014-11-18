var http = require('http');
var fs = require("fs-extra");
var path = require("path");
var _ = require("underscore");
var cheerio = require('cheerio');
var logger = require('./log');
var exception = require("./exception");
var dateFormat = require("./dateformat");

// module product extract config.
var module_picture_extract_cfg = fs.readJsonSync("../module_config.json").module_picture_extract.configs;

/**
 * Escape sql query string
 * @param  {any} fieldValue sql parameter
 */
function escapeSqlField(fieldValue) {
	if (_.isString(fieldValue)) {
		fieldValue = stringFormat("'{0}'", fieldValue);
	} else if (_.isDate(fieldValue)) {
		fieldValue = stringFormat("'{0}'", fieldValue);
	} else if (_.isNumber(fieldValue)) {
		fieldValue = stringFormat("{0}", fieldValue);
	} else if (_.isBoolean(fieldValue)) {
		fieldValue = stringFormat("{0}", true ? 1 : 0);
	}
	return fieldValue;
};
/**
 *  format string e.g  stringFormat("my name is {0}, sex is: {1}","tian","male")
 * @param  {array like} str the source string that will be replace by regex .
 */
function stringFormat() {
	// use this string as the format,Note {x},x start from 0,1,2,3
	// walk through each argument passed in
	for (var fmt = arguments[0], ndx = 1; ndx < arguments.length; ++ndx) {
		// replace {1} with argument[1], {2} with argument[2], etc.
		fmt = fmt.replace(new RegExp('\\{' + (ndx - 1) + '\\}', "g"), arguments[ndx]);
	}
	// return the formatted string
	return fmt;
};

function stringFormatSql() {
	// use this string as the format,Note {x},x start from 0,1,2,3
	// walk through each argument passed in
	for (var fmt = arguments[0], ndx = 1; ndx < arguments.length; ++ndx) {
		// replace {1} with argument[1], {2} with argument[2], etc.
		fmt = fmt.replace(new RegExp('\\{' + (ndx - 1) + '\\}', "g"), escapeSqlField(arguments[ndx]));
	}
	// return the formatted string
	return fmt;
};
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
			var destDir = path.join(module_picture_extract_cfg.saveto_dir.value, dateFormat(new Date(), "YYYY-MM-DD"));
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
 * http://www.aliexpress.com/item/Wholesale-2014-New-Fashion-Jewelry-Exquisite-925-Silver-Ring-Inlay-Pink-Topaz-Gift-For-Women-Size/2047185104.html
 * http://www.aliexpress.com/store/product/Man-spring-2014-long-sleeve-slim-fit-casual-shirt-desigual-men-long-sleeve-peaked-collar-dudalina/342250_1827547993.html?spm=5261.1471527.1998272370.7&promotionId=256239020

 */
function extractProductId(url) {
	if (url) {
		return url.match(/[^_/]*$/)[0].replace(/.html.*$/, "");
	}
	return "";
};
/**
 * Capitalize the first letter of string 
 */
function capitalize(s) {
	return s && s[0].toUpperCase() + s.slice(1);
}
module.exports = {
	stringFormat: stringFormat,
	stringFormatSql: stringFormatSql,
	extractProductId: extractProductId,
	loadHtmlDocument: loadHtmlDocument,
	downloadPicture: downloadPicture,
	downloadFile: downloadFile,
	capitalize: capitalize
};