// var select = require('soupselect').select,
// htmlparser = require("htmlparser"),
// https://github.com/cheeriojs/cheerio
var cheerio = require('cheerio'),
    _ = require('underscore'),
    http = require('http'),
    fs = require("fs-extra");
var logger = require('../../helpers/log');
// getting parser module
var cssparser = require("cssparser");
var utility = require("../../helpers/utility");
var Q = require("q");

var skuStyleContent = "";
// module product extract config.
var module_product_extract_cfg = fs.readJsonSync("../module_config.json").module_product_extract.configs;

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
// @return promise
function fetchSkuColorStyleContent() {
    var deferred = Q.defer();
    if (!skuStyleContent) {
        var sku_color_url = module_product_extract_cfg.sku_color_css_url.value;
        utility.loadHtmlDocument(sku_color_url).then(function(body) {
            skuStyleContent = body;
            deferred.resolve({
                body: skuStyleContent,
                url: sku_color_url
            });
        }, function(err) {
            deferred.reject(err);
        });
    } else {
        // do some fetch operations.
        deferred.resolve({
            body: skuStyleContent,
            url: sku_color_url
        });
    }
    return deferred.promise;
};

function queryBackgroundProperty(selector) {
    try {
        // logger.debug("styles: ", skuStyleContent);
        // create new instance of Parser
        var parser = new cssparser.Parser();
        // parse & getting json
        var json = parser.parse(skuStyleContent);
        // logger.debug("styles: ", json);
        var styleJson = json["rulelist"];
        var hexColor = "";
        for (var i = styleJson.length - 1; i >= 0; i--) {
            var style = styleJson[i];
            if (style.selector == selector) {
                hexColor = style.declarations["background"].replace(/#|\s*!important/ig, "");
                break;
            }
        };

        // convert rgb 2 hex.
        // var color = rgbConvert2Hex($colorSpan.css("backgroundColor"));
        return hexColor;
    } catch (e) {
        return "";
    }
};

// color spec dom converter.
function fetchProductSpecColor($, $lis) {
    var result = [];
    if ($lis && $lis.length) {
        $lis.each(function(i, liItem) {
            var $liItem = $(liItem);
            var $colorSpan = $liItem.find(".color");
            if ($colorSpan && $colorSpan.length) {
                var colorTitle = $colorSpan.attr("title");
                if ($colorSpan[0].name == "span") {
                    try {
                        var selector = "." + $colorSpan.attr("class").replace(/color\s*/, "");
                        result.push({
                            title: colorTitle,
                            value: queryBackgroundProperty(selector)
                        });
                    } catch (e) {
                        logger.error("get color span sku-color selector exception: ", e);
                    }
                } else if ($colorSpan[0].name == "img") {
                    logger.debug("fetchProductSpecColor failed-->> color option is not span maybe is image");
                    result.push({
                        title: colorTitle,
                        value: "" // if color is "" we don't set product variant color value.
                    });
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

/**
 * Fetch product description without html tag, remved http link.
 * @param  {string}   productId productid
 * @return promise.
 */
function fetchProductDescriptions(productId) {
    var product_description_url = module_product_extract_cfg.product_description_url.value.replace("{pid}", productId);
    var deferred = Q.defer();

    utility.loadHtmlDocument(product_description_url).then(function(desc) {
        desc = desc && desc.replace(/\s+\S*productDescription=\s*['"]/, "");
        desc = desc && desc.replace(/['"];$"/, "");
        deferred.resolve({
            body: desc,
            url: product_description_url
        });
    }, function(err) {
        deferred.reject(err);
    });
    return deferred.promise;
};

function ProductSpiderService() {
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

    this.getResult = function() {
        var result = {
            title: this.title,
            productId this.productId,
            categories: this.categories,
            oldPrice: this.oldPrice,
            nowPrice: this.nowPrice,
            productAttribts: this.productAttribts,
            specAttribts: this.specAttribts,
            description: this.description
        };
        return result;
    };
    /**
     * Crawl product basic information from specificed http url.
     * @param  {string} httpUrl httpUrl http absolute url
     * @return {promise}
     */
    this.start = function(httpUrl) {
        this.url = httpUrl;
        // current product id.
        this.productId = utility.extractProductId(this.url);

        var _this = this;

        var deferred = Q.defer();

        // first download color style content and cached to memory.
        fetchSkuColorStyleContent().then(function(result) {
            if (!result.body) {
                logger.error("pre load sku color style failed!", result.url);
                deferred.reject("pre load sku color style failed: " + result.url);
            } else {
                utility.loadHtmlDocument(_this.url).then(function(htmlBody) {
                    // now we have the whole body, parse it and select the nodes we want...
                    var $ = cheerio.load(htmlBody, {
                        normalizeWhitespace: true,
                        xmlMode: true
                    });
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

                    // fetch product description. Note: because we will aysnc send an new request to get product description html code here
                    // and we will waiting for all description has been downloaded, then flush success event to consumer.
                    _this.fetchDescription().then(function(desc) {
                        _this.description = desc;
                        // return result to client.
                        deferred.resolve(_this.getResult());

                    }, function(descErr) {
                        logger.debug("fetch description error: ", descErr);
                        _this.description = "fetch description error";
                        deferred.resolve(_this.getResult());
                    });

                }, function(htmlBodyError) {
                    // throw error.
                    deferred.reject(htmlBodyError);
                });
            }

        }, function error(err) {
            deferred.reject(err);
        });
        // return promise.
        return deferred.promise;
    }
};

_.extend(ProductSpiderService.prototype, {

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
            var _nowprice = this.$dom("#sku-discount-price").text();
            if (_nowprice) {
                prices.push(_nowprice);
            }
        }
        this.nowPrice = prices.reverse();
        // if no now price, then use old price.
        if (!this.nowPrice.length) {
            this.nowPrice = this.oldPrice;
        }
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
        var _this = this;
        return fetchProductDescriptions(this.productId).then(function(result) {
            var desc = result.body || "";
            var $desc = _this.$dom(desc);
            // remove a link.
            $desc.find("a").remove();
            // remove img link.
            $desc.find("img").remove();
            // extract all text content.
            desc = $desc.text();
            return desc;
        });
    }
});

module.exports = function() {
    return new ProductSpiderService();
};