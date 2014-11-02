var logger = require('./log');
http = require('http');

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

function downloadPicture(url, callback) {
	
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