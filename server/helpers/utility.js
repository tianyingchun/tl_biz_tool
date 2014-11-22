var http = require('http');
var fs = require("fs-extra");
var path = require("path");
var _ = require("underscore");
var cheerio = require('cheerio');
var logger = require('./log');
var exception = require("./exception");
var dateFormat = require("./dateformat");
var Q = require("q");
var async = require("async");
// data provider singleton.
var dataProvider = require("../dataProvider");

var pictureCfg = dataProvider.getConfig("picture");
var pictureCrawlCfg = dataProvider.getConfigNode(pictureCfg, "crawl_config");

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
 * @param  {string} url webiste product detail page absolute url
 * @param  {promise}
 */
function loadHtmlDocument(url) {
    var deferred = Q.defer();
    // fetch some HTML...
    http.get(url, function(response) {
        response.setEncoding('utf8');
        var body = "";
        response.on('data', function(chunk) {
            body = body + chunk;
        });
        response.on('end', function() {
            deferred.resolve(body);
        });
        response.on("error", function(err) {
            deferred.reject(err);
        });
    }).on('error', function(err) {
        deferred.reject(err);
    });
    return deferred.promise;
};

/**
 * Download file to specifict dest filename.
 * @param  {string} url  the http file path
 * @param  {string} dest destination filepath
 * @return {promise}
 */
function downloadFile(url, dest) {
    var deferred = Q.defer();
    var file = fs.createWriteStream(dest);
    var request = http.get(url, function(response) {
        response.pipe(file);
        file.on('finish', function() {
            file.end();
            file.close(function() {
                // close() is async, call cb after close completes.
                deferred.resolve("success");
            });
        });
    }).on('error', function(err) {
        // Handle errors
        file.end();
        fs.unlink(dest);
        // Delete the file async. (But we don't check the result)
        deferred.reject(err);
    });
    return deferred.promise;
};
/**
 * download picture utility, used to download all specificed product pictures within a webpage comes from given http page/desc url
 *
 * @param  {string}   productId productId of detail page.
 * @param  {string}   url product detail page url.
 * @param  {string}   saveto    the destination directory path
 * @param  {promise}
 */
function downloadPicture(productId, url) {
    var deferred = Q.defer();
    loadHtmlDocument(url).then(function(body) {
        if (body) {
            // find all picture urls saved to temporay array.
            // now we have the whole body, parse it and select the nodes we want...
            var $ = cheerio.load(body, {
                normalizeWhitespace: true,
                xmlMode: true
            });
            var destDir = path.join(pictureCrawlCfg.saveto_dir.value, dateFormat(new Date(), "YYYY-MM-DD"));
            // make sure has distination directory.
            fs.ensureDirSync(destDir);

            var tasks = [];
            $("img").each(function(i, item) {
                var src = $(item).attr("src");
                var filePath = path.join(destDir, productId + "_{0}.jpg".replace("{0}", i));
                if (src) {
                    tasks.push(function(callback) {
                        // do download picture file.
                        downloadFile(src, filePath).then(function(result) {
                            logger.debug("filePath: ", filePath);
                            callback(null, {
                                status: "success",
                                path: src
                            });
                        }, function(err) {
                            callback(null, {
                                status: "failed",
                                path: src
                            });
                        });
                    });
                }
            });
            logger.debug("downloading picture total tasks: ", tasks.length);
            // async exec all tasks to download all pictures.
            async.parallel(tasks, function(err, results) {
                deferred.resolve({
                    total: results.length,
                    failed: results.filter(function(item) {
                        return item.status != "success";
                    })
                });
            });
        } else {
            deferred.reject("can't find any <img /> tag within providered product detail page!");
        }
    });
    return deferred.promise;
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