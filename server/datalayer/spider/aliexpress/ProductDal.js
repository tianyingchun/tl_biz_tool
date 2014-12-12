// var select = require('soupselect').select,
// htmlparser = require("htmlparser"),
// https://github.com/cheeriojs/cheerio
var cheerio = require('cheerio');
var _ = require('underscore');
var cssparser = require("cssparser");
var fse = require("fs-extra");
var logger = require('../../../helpers/log');
// getting parser module
var utility = require("../../../helpers/utility");

var dataProvider = require("../../../dataProvider");
var ProductCrawlInfoModel = dataProvider.getModel("ProductCrawlInfo");
var Q = require("q");

var skuStyleContent = "";

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
        // re-fetch configuration.
        var productCfg = dataProvider.getConfigNode("product", "crawl_config");
        var sku_color_url = productCfg.sku_color_css_url.value;
        utility.loadHtmlDocument(sku_color_url).then(function(body) {
            skuStyleContent = body;
            logger.debug("download color style content completed!");
            deferred.resolve({
                body: skuStyleContent,
                url: sku_color_url
            });
        }, function(err) {
            deferred.reject(err);
        });
    } else {
        logger.debug("use cached color style content!");
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
                colorTitle = colorTitle ? colorTitle.toLowerCase() : "";
                colorTitle = utility.capitalize(utility.trim(colorTitle));

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
            value = value ? value.toLowerCase() : "";
            value = utility.capitalize(utility.trim(value));
            // for value, we always use uppercase.
            result.push({
                title: value,
                value: value.toUpperCase()
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
            value = value ? value.toLowerCase() : "";
            value = utility.capitalize(utility.trim(value));
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
    var productCfg = dataProvider.getConfigNode("product", "crawl_config");
    var product_description_url = productCfg.product_description_url.value.replace("{pid}", productId);
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

/**
 * Read html product size template content from local file,
 * @param  {string} tempatePath template file path
 * @return {promise} html content
 */
function fetchProductSizeTableTemplate(tempatePath) {
    var templateFile = "../statics/" + tempatePath;
    var deferred = Q.defer();
    logger.debug("fetchProductSizeTableTemplate:", templateFile);
    if (fse.existsSync(templateFile)) {
        fse.readFile(templateFile, 'utf8', function(err, data) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(data);
            }
        });
    } else {
        deferred.resolve("nothing here, please write it by yourself!");
    }
    return deferred.promise;
};

function ProductSpiderService() {
    // defaut instance.
    this.productCrawlInfo = new ProductCrawlInfoModel();

    this.$dom = null;
    /**
     * Crawl product basic information from specificed http url.
     * @param  {string} httpUrl httpUrl http absolute url
     * @return {promise}
     */
    this.start = function(httpUrl) {
        //  define product crawn info, each crawl re-instance productCrawlInfo, make sure confuse instance distraction
        this.productCrawlInfo = new ProductCrawlInfoModel(httpUrl);

        this.url = httpUrl;

        var productId = utility.extractProductId(this.url);
        // current product id.
        this.productCrawlInfo.productId = productId;
        this.productCrawlInfo.sku = productId;

        var _this = this;

        var deferred = Q.defer();
        // check if we get product id from this url.
        // 
        if (productId) {
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
                            // keep description value if have another information.
                            _this.productCrawlInfo.description += desc;
                            // return result to client.
                            deferred.resolve(_this.productCrawlInfo.getResult());

                        }, function(descErr) {
                            logger.debug("fetch description error: ", descErr);
                            _this.description = "fetch description error";
                            deferred.resolve(_this.productCrawlInfo.getResult());
                        });

                    }, function(htmlBodyError) {
                        // throw error.
                        deferred.reject(htmlBodyError);
                    });
                }

            }, function error(err) {
                deferred.reject(err);
            });
        } else {
            var _errorMsg = utility.stringFormat("make sure you have chosen an correct product url `{0}`", this.url);
            logger.error(_errorMsg);
            deferred.reject(new Error(_errorMsg));
        }
        // return promise.
        return deferred.promise;
    }
};

/**
 * Note. we must make sure that  this.$dom has been loaded product documents.
 */
_.extend(ProductSpiderService.prototype, {

    fetchCategories: function() {
        logger.debug("filter to get categories...");
        var $breadcrumb = this.$dom("div.ui-breadcrumb >a");
        var crumb = [];
        var $ = this.$dom;
        $breadcrumb.each(function(i, item) {
            crumb.push($(item).text());
        });
        this.productCrawlInfo.categories = crumb.reverse();
    },
    fetchTitle: function() {
        logger.debug("filter to get title content...");
        this.productCrawlInfo.title = this.$dom("h1.product-name").text();
        if (!this.productCrawlInfo.title) {
            logger.error("fetchTitle", "can't find correct title for this product!");
            this.productCrawlInfo.errors.push({
                "fetchTitle": "can't find correct title for this product," + this.url
            });
        }
    },
    fetchOldPriceList: function() {
        logger.debug("filter to get old price list...");
        var prices = this.$dom("#sku-price").text().split(/\s*-\s*/);
        this.productCrawlInfo.oldPrice = prices.reverse();
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
        this.productCrawlInfo.nowPrice = prices.reverse();
        // if no now price, then use old price.
        if (!this.productCrawlInfo.nowPrice.length) {
            this.productCrawlInfo.nowPrice = this.productCrawlInfo.oldPrice;
        }
        if (!(this.productCrawlInfo.nowPrice.length && this.productCrawlInfo.nowPrice[0])) {
            logger.error("fetchNowPriceList", "can't find now sell price for this product!");
            this.productCrawlInfo.errors.push({
                "fetchNowPriceList": "can't find now sell price for this product, url:" + this.url
            });
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

            title = title ? title.replace(/[^a-z\sA-Z0-9]/g, '').toLowerCase() : "";
            // trim empty.
            title = utility.capitalize(utility.trim(title));

            if (title == "Color") {
                productAttribtsList[title] = fetchProductSpecColor($, $lis);
            } else if (title == "Size") {
                productAttribtsList[title] = fetchProductSpecSize($, $lis);
            } else {
                productAttribtsList[title] = fetchProductSpecOther($, $lis);
            }

        });
        this.productCrawlInfo.productAttribts = productAttribtsList;
    },
    fetchspecAttribts: function() {
        logger.debug("filter to get specifications attributes...");
        var $ = this.$dom;
        var $specItemContainer = $("#product-desc .ui-box-body");
        var _this = this;
        // var $specItems = $("#product-desc dl.ui-attr-list");
        var $specItems = [];
        if ($specItemContainer && $specItemContainer.length) {
            $specItemContainer.each(function(idx, item) {
                var $childItems = $(item).find("dl.ui-attr-list");
                if ($childItems && $childItems.length) {
                    if (idx == 0) {
                        $specItems = $specItems.concat($childItems.toArray());
                    } else {
                        // now we need to move `Packaging Details` into product full description.
                        // cut it from specification attribute.
                        var _packagingDetail = $childItems.parent().html();
                        if (_packagingDetail) {
                            _this.productCrawlInfo.description += "<div class=\"title\">Packaging Details</div><div class=\"package-detail\">" + _packagingDetail + "</div>";
                        }
                    }
                }
            });
        }
        // 
        var result = [];
        if ($specItems.length) {
            $specItems.forEach(function(item, idx) {
                var title = $(item).find("dt").text();
                title = title ? title.replace(/[^a-z\sA-Z0-9]/g, '').toLowerCase() : "";
                // trim empty.
                title = utility.capitalize(utility.trim(title));
                // TODO. BUG< Material:Cashmere,Wool,Polyester,Lycra,Nylon>
                // WE need to manaully use ',' to split `Material` into multiple spec attribute options.
                // 
                var value = $(item).find("dd").text();
                if (value) {
                    var allChildSpecOptions = value.split(",");
                    for (var i = 0; i < allChildSpecOptions.length; i++) {
                        var option = allChildSpecOptions[i];
                        option = option ? option.toLowerCase() : "";
                        result.push({
                            title: title,
                            value: utility.capitalize(utility.trim(option))
                        });
                    };
                }
            });
        }
        _this.productCrawlInfo.specAttribts = result;
    },
    fetchDescription: function() {
        logger.debug("filter to get product description...");
        var _this = this;
        // now we can't need to crawl product description.
        // return fetchProductDescriptions(this.productId).then(function(result) {
        //     var desc = result.body || "";
        //     var $desc = "";
        //     try {
        //         $desc = _this.$dom(desc);
        //     } catch (e) {
        //         $desc = _this.$dom("");
        //         logger.error("fetchDescription", e.message);
        //         _this.errors.push({
        //             "fetchDescription": e.message
        //         });
        //     }
        //     // remove a link.
        //     $desc.find("a").remove();
        //     // remove img link.
        //     $desc.find("img").remove();
        //     // extract all text content.
        //     desc = $desc.text();
        //     return desc;
        // });

        // each time, we need to refetch this configurations. 
        var productAutoUploadCfg = dataProvider.getConfigNode("product", "autoupload_config");
        var defaultTemplateFile = productAutoUploadCfg.defaultProductSizeTableTemplate.value || "";

        return fetchProductSizeTableTemplate(defaultTemplateFile);
    }
});

module.exports = ProductSpiderService;