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
var sizeOf = require('image-size');
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
/**
 * interator sql parameters.
 * @param  {function} iteratorFn each sql parameter
 * @param  {object} scope    scope of iterfator fn
 * @param  {array}  sqlAndParameters [sqlstring,parameters]
 * @return {string}            prepared command sql string.
 */
function stringFormatSql(iteratorFn, scope, sqlAndParameters) {
    // use this string as the format,Note {x},x start from 0,1,2,3
    // walk through each argument passed in
    for (var fmt = sqlAndParameters[0], ndx = 1; ndx < sqlAndParameters.length; ++ndx) {
        var param = iteratorFn.call(scope || this, ndx, sqlAndParameters[ndx]);
        // replace {1} with argument[1], {2} with argument[2], etc.
        fmt = fmt.replace(new RegExp('\\{' + (ndx - 1) + '\\}', "g"), param);
    }
    // return the formatted string
    return fmt;
};

function isUrl(url) {
    var regexp = /(ftp|http|https):\/\/[A-Za-z0-9\.-]{3,}\.[A-Za-z]{3}/;
    return regexp.test(url);
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
function downloadPicture(productId, url, destDir) {
    var deferred = Q.defer();
    loadHtmlDocument(url).then(function(body) {
        if (body) {
            // find all picture urls saved to temporay array.
            // now we have the whole body, parse it and select the nodes we want...
            var $ = cheerio.load(body, {
                normalizeWhitespace: true,
                xmlMode: true
            });
            destDir = destDir || path.join(pictureCrawlCfg.saveto_dir.value, dateFormat(new Date(), "YYYY-MM-DD"));
            // make sure has distination directory.
            fs.ensureDirSync(destDir);

            var tasks = [];
            $("img").each(function(i, item) {
                var src = $(item).attr("src");
                var filePath = path.join(destDir, productId + "_{0}.jpg".replace("{0}", i));
                if (src && isUrl(src)) {
                    tasks.push(function(callback) {
                        // do download picture file.
                        downloadFile(src, filePath).then(function(result) {
                            logger.debug("filePath: ", filePath);
                            var dimensions = sizeOf(filePath);
                            if (dimensions.width < 300 || dimensions.height < 300) {
                                try {
                                    //TODO..delete it.
                                    fs.removeSync(filePath);
                                    logger.warn("delete picture `" + filePath + "` cause of the size is small!");
                                } catch (e) {
                                    logger.error("remove file exception! filePath:", filePath);
                                }
                                callback(null, {
                                    status: "failed",
                                    path: src
                                });
                            } else {
                                callback(null, {
                                    status: "success",
                                    path: src
                                });
                            }
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
    var productSku = "";
    if (url) {
        //  productSku = url.match(/[^_/]*$/)[0].replace(/.html.*$/, "");
        //  -Oversized-Sweater/405992_2023050161.html -->405992_2023050161 it is error id. we need to filter 405992
        productSku = url.match(/[^_/]*$/)[0].replace(/.html.*$/, "");
    }
    logger.debug("extractProduct sku: ", productSku);
    return productSku;
};
/**
 * Automatically Capitalize the first letter of each word in one sentence.
 */
function capitalize(s) {
    var result = s ? s.replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }) : "";
    return result;
};

/**
 * Trim string empty character
 * @param  {string} s " my name is " --> "my name is"
 */
function trim(s) {
    return s ? s.replace(/^\s+|\s+$/g, "") : "";
};

/**
 * Get formatted dal access result messages.
 * @param  {string} methodKey method name
 * @param  {string} status    success, failed.
 * @param  {anything} results  the content that described dal operate result.
 * @return {object} formatted result message.
 */
function buildResultMessages(methodKey, results) {
    var _initial = {};

    function getObject(methodKey, results) {
        var obj = {};

        obj[methodKey] = results;

        return obj;
    }

    // initialize result message 
    _initial[methodKey] = results;

    function autoAttachedVal2Path(path, val) {

        var container = _initial;
        // Break the name at periods and create the object hierarchy we need   
        var parts = path.split('.');
        for (var i = 0; i < parts.length; i++) {
            var part = parts[i];
            // If there is no property of container with this name, create   
            // an empty object.   
            if (!container[part]) {
                container[part] = (i == parts.length - 1) ? val : {};
            } else if (!_.isObject(container[part])) {
                if (i == parts.length - 1) {
                    container[part] = val;
                }
                // If there is already a property, make sure it is an object   
                logger.warn(part + " already exists and is not an object");
            }
            container = container[part];
        }
        return container;
    };

    return {
        /**
         * pushNewMessage to existed message queue
         * @param  {string} methodKey method name
         * @param  {object} results   the results
         * @param  {string} path optional  node path
         */
        pushNewMessage: function(methodKey, results, path) {
            if (path) {
                path = path + "." + methodKey;
                var node = autoAttachedVal2Path(path, results);
            } else {
                _initial[methodKey] = results;
            }
        },
        getResult: function() {
            return _initial;
        }
    };
};



module.exports = {
    trim: trim,
    stringFormat: stringFormat,
    stringFormatSql: stringFormatSql,
    extractProductId: extractProductId,
    loadHtmlDocument: loadHtmlDocument,
    downloadPicture: downloadPicture,
    downloadFile: downloadFile,
    capitalize: capitalize,
    buildResultMessages: buildResultMessages
};