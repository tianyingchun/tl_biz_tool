var util = require('util');
var Q = require("q");
var _ = require("underscore");

var async = require("async");

var utility = require("../helpers/utility");

var logger = require('../helpers/log');
// data provider singleton.
var dataProvider = require("../dataProvider");
// product model.
var ProductModel = dataProvider.getModel('Product');
// tier price model.
var TierPriceModel = dataProvider.getModel("TierPrice");

function ProductDataProvider() {
    // crawl configuration.
    var productCrawlCfg = dataProvider.getConfigNode("product", "crawl_config");
    // auto uplopad configuration.
    var productAutoUploadCfg = dataProvider.getConfigNode("product", "autoupload_config");

    var productDal = dataProvider.getDataAccess("Product");

    var productSpiderDal = dataProvider.getDataAccess("spider", "Product");

    /**
     * Crawl product basic information from specificed spider repository
     * @param  {string} httpUrl product url.
     * @return {promise}
     */
    this.crawlProductInfo = function(httpUrl) {
        return productSpiderDal.start(httpUrl);
    };
    /**
     * Get all pictures from given productid.
     * @param  {number} productId product id
     * @return {promise}
     */
    this.getPicturesByProductId = function(productId) {
        return productDal.getPicturesByProductId(productId);
    };
    /**
     * Get product Id by product variant sku
     * @param  {string} sku product variant sku.
     * @return {promise}
     */
    this.getProductIdBySku = function(sku) {

        return productDal.getProductBySku(sku).then(function(product) {
            if (product) {
                return product.ProductId;
            } else {
                logger.debug("Can't find product by sku:" + sku);
                throw new Error("Can't find product by sku:" + sku);
            }
        });
    };
    /**
     * Get product detail info by product id.
     * @param  {number} productId product identifier.
     * @return {promise}
     */
    this.getProduct = function(productId) {
        return productDal.getProduct(productId);
    };

    /**
     * Get product detail by sku.
     * @param  {string} sku product variant sku.
     * @return {promise}
     */
    this.getProductInfoBySku = function(sku) {
        var _this = this;
        return this.getProductIdBySku(sku)
            .then(function(productId) {
                return _this.getProduct(productId);
            });
    };
    /**
     * Check if we can now upload new pictures for current product
     * @param  {string} sku product variant sku.
     * @return {promise}  return new product basic information.
     */
    this.ifAllowUsUploadNewPictures = function(sku) {
        var _this = this;
        return this.getProductInfoBySku(sku).then(function(product) {
            logger.debug("current product:", product);
            return product;
        }).then(function(product) {
            var productId = product.Id;
            if (product && productId != 0) {
                return _this.getPicturesByProductId(productId).then(function(productPictureList) {
                    // status is ok, can upload new pictures.
                    if (!productPictureList || productPictureList.length == 0) {
                        return product;
                    } else {
                        // check if existed picture mappings for current productId, if have throw error,
                        // we can't allow upload picture if this product has picture mapping.
                        var _message = utility.stringFormat("The sku:`{0}`, product id:`{1}` has existed pictures, can't add repeated picture now!", sku, productId);
                        logger.warn(_message);
                        throw new Error(_message);
                    }
                });
            } else {
                var _errorMsg = utility.stringFormat("can't find product basic detail by sku `{0}`, please upload product first!", sku);
                logger.debug(_errorMsg);
                throw new Error(_errorMsg);
            }
        });
    };
    /**
     * Add new product information to database. we provider this public api to do below tasks:
     *
     *  1. upload product basicinfo to db
     *  2. upload product variant info to db
     *  3. upload product variant tier price to db
     *  4. upload product variant attribute list <color, size,..> to customer.
     *  5. upload product related tabs information
     *      5.1 upload product category mappings to db
     *      5.2 upload product manufactuer mappings to db
     *      5.3 upload product specification attributes to db.
     * Note: for our tool, we also provider some single function module upload apis.
     * this api is short cut for tool automation
     * @param product the ProductModel.
     * @param categoryIds the category ids.
     * @param manufacturerIds the manufacturer ids.
     * @return promise.
     */
    this.addNewProduct = function(crawlProduct, categoryIds, manufacturerIds) {

        // manufacturerIds = (manufacturerIds && manufacturerIds.length) ? manufacturerIds : [productAutoUploadCfg.defaultManufacturerId.value];
        // now we don't need manufacturerids.
        manufacturerIds = [];

        // first we need to check if existed the same product with provider sku(productId).
        var sku = crawlProduct.sku;
        var deferred = Q.defer();
        productDal.getProductBySku(sku).then(function(testProduct) {
            // logger.debug("getProductBySku: ", testProduct);
            if (!testProduct || !testProduct.Id) {
                // product name.
                var name = crawlProduct.title;

                //Product(productId, name, sku, description,....)
                var productModel = new ProductModel(0, name, sku);

                productModel.Name = name;

                productModel.ShortDescription = name;

                productModel.FullDescription = crawlProduct.description;
                // asign product spec attributes
                productModel.SpecAttribts = crawlProduct.specAttribts || [];

                productModel.MetaTitle = name;
                productModel.MetaKeywords = name;
                productModel.MetaDescription = name;
                productModel.Sku = sku;

                // make sure that if now price eqauls 0 we need to throw error.
                var _price = crawlProduct.nowPrice.length ? crawlProduct.nowPrice[0] : 0;

                // calculate now sale price by price  rate...
                _price = prepareProductSalePriceFromRateTier(sku, _price);

                // if current price less than 10USD, alway use 9.9$ we can make some activity for this.
                if (_price < 10) {
                    // set specical price for this.
                    logger.warn("set specical price as 9.9$, origin price is: " + _price + " sku: " + sku);

                    _price = 9.9;

                    // use random rate for old price if sale price equals 9.9
                    productModel.OldPrice = _price * parseFloat(productCrawlCfg.old_price_rate.value) * (Math.random() / 2 + 1);

                } else {
                    // show the old price to customer.
                    productModel.OldPrice = _price * parseFloat(productCrawlCfg.old_price_rate.value);
                }

                productModel.Price = _price;

                // the price we need paid!
                productModel.SourcePrice = crawlProduct.nowPrice[0];
                productModel.ProductCost = productModel.SourcePrice;
                productModel.SourceUrl = crawlProduct.providerUrl;
                productModel.SourceInfoComment = "[不要修改此选项]" + crawlProduct.originTitle;

                productModel.ProductAttribts = crawlProduct.productAttribts || {};
                // prepare tier price.
                productModel.TierPrices = prepareProductTierPrice(productModel.Price);

                logger.debug("Product Vairant Info: priceRate: `%s`, nowPrice: `%s`, oldPrice:`%s`, producCost:`%s` ", productCrawlCfg.price_rate.value, _price, productModel.OldPrice, productModel.ProductCost);

                var finnalResultMessage;

                // Add product basic information and product variant information.
                productDal.addNewProduct(productModel).then(function(result) {

                    // temporary save add new product completed result messages.
                    finnalResultMessage = result;
                    // get product id.
                    var productId = result.addNewProduct.productId;

                    var tasks = [];

                    // add product category mappings.
                    tasks.push(function(callback) {
                        productDal.addProductManufacturerMappings(productId, manufacturerIds).then(function(result) {
                            logger.debug("AddProductManufacturerMappings finished!");
                            callback(null, result);
                        }, function(err) {
                            callback(err);
                        });
                    });

                    // add product manufactuer mappings.
                    tasks.push(function(callback) {
                        productDal.addProductCategoryMappings(productId, categoryIds).then(function(result) {

                            logger.debug("AddProductCategoryMappings finished!");

                            callback(null, result);

                        }, function(err) {
                            callback(err);
                        });
                    });

                    // AddProductSpecificationAttributes
                    tasks.push(function(callback) {
                        productDal.addProductSpecificationAttributes(productId, crawlProduct.specAttribts)
                            .then(function(result) {
                                logger.debug("AddProductSpecificationAttributes finished!");
                                callback(null, result);
                            }, function(err) {
                                callback(err);
                            });
                    });

                    async.parallel(tasks, function(err, results) {
                        if (err) {
                            deferred.reject(err);
                        } else {
                            var productTabsInfoMsg = utility.buildResultMessages("productTabsInfo", results).getResult();

                            // merge results message from add new product completed result messages.
                            var resultMessage = _.extend(finnalResultMessage, productTabsInfoMsg);

                            deferred.resolve(resultMessage);
                        }
                    });

                }, function(err) {
                    deferred.reject(err);
                });
            } else {
                deferred.reject(new Error("不能添加重复的产品SKU: " + sku + ", url:" + crawlProduct.providerUrl));
            }

        }, function(err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };
    /**
     * add product picture mappings.
     * @param {array} pictures [{pictureId:1111, displayOrder:0}] required, passed target picture id, auto add all pictures mapping for this product
     */
    this.addProductPictureMappings = function(productId, pictures) {
        return productDal.addProductPictureMappings(productId, pictures);
    };
    /**
     * add product category mappings
     * @param {number} productId     productId.
     * @param {array} manufacturerIds  all brand manufacturer ids.
     */
    this.addProductManufacturerMappings = function(productId, manufacturerIds) {

        var deferred = Q.defer();

        var default_manufacturerids = manufacturerIds || [productAutoUploadCfg.defaultManufacturerId.value];

        logger.debug("default_manufacturerids: ", default_manufacturerids);

        productDal.addProductManufacturerMappings(productId, default_manufacturerids).then(function() {
            deferred.resolve("addProductManufacturerMappings->success");
        }, function(err) {
            logger.error("addProductManufacturerMappings Error:", err);
            deferred.reject(err);
        });

        return deferred.promise;
    };

    /**
     * add product category mappings
     * @param {number} productId     productId
     * @param {array} categoryIds category ids.
     */
    this.addProductCategoryMappings = function(productId, categoryIds) {
        var deferred = Q.defer();

        logger.debug("insert categoryids: ", categoryIds);

        productDal.addProductCategoryMappings(productId, categoryIds).then(function(affectedRows) {
            deferred.resolve("addProductCategoryMappings success (" + affectedRows + ")");
        }, function(err) {
            logger.error("addProductCategoryMappings Error:", err);
            deferred.reject(err);
        });

        return deferred.promise;
    };
    /**
     * provider single api to batch update product specification attributes for existed products.
     * @param {string} productId     product variant sku.
     */
    this.updateProductSpecificationAttributes = function(sku, specAttribts) {
        // find existed product info.
        return this.getProductIdBySku(sku).then(function(productId) {

            return productDal.addProductSpecificationAttributes(productId, specAttribts)
                .then(function(result) {
                    logger.debug("updateProductSpecificationAttributes finished!");
                    return result;
                });
        });
    };
    /**
     * 返回当前SKU下的所有的ProductAttribtues列表
     * @param  {string} sku product variant sku
     * @return {promise}
     */
    this.getProductAttributesBySku = function(sku) {
        return productAttributeDal.getProductAttributesBySku(sku).then(function(results) {
            // 重新组织产品详情的ProductAttribtue列表

            var _newResult = {};

            if (results && results.length) {
                results.forEach(function(item) {
                    if (!_newResult[item.ProductAttributeName]) {
                        _newResult[item.ProductAttributeName] = [];
                    }
                    _newResult[item.ProductAttributeName].push({
                        "title": item.Name,
                        "value": item.ProductAttributeName.toLowerCase() == "color" ? item.ColorSquaresRgb : item.Name
                    });
                });
            }
            return _newResult;
        });
    };
    //
    // helper methods: prepareProductTierPrice
    // ------------------------------------------------------------------------
    function prepareProductSalePriceFromRateTier(sku, originalPrice) {
        var values = productCrawlCfg.price_rate.value;
        //  {"down_10": 2.65,"down_20": 2.4,"down_30": 2.1,"down_40": 2}
        var newPrice = originalPrice * 2;
        if (!originalPrice) {
            logger.error("sku:" + sku + "originalPrice is not specificted!");
        }

        if (originalPrice < 10) {
            newPrice = originalPrice * parseFloat(values["down_10"]);
        } else if (originalPrice < 20) {
            newPrice = originalPrice * parseFloat(values["down_20"]);
        } else if (originalPrice < 30) {
            newPrice = originalPrice * parseFloat(values["down_30"]);
        } else if (originalPrice < 40) {
            newPrice = originalPrice * parseFloat(values["down_40"]);
        } else {
            newPrice = originalPrice * 1.8;
        }
        return newPrice;
    };

    function prepareProductTierPrice(nowPrice) {
        // tier price list.
        var values = productCrawlCfg.tier_price_rate.value;
        var result = [];
        for (var tier in values) {
            var tierPriceModel = new TierPriceModel();
            tierPriceModel.Quantity = parseInt(tier.split("_")[1]);
            tierPriceModel.Price = parseFloat(values[tier]) * parseFloat(nowPrice);
            result.push(tierPriceModel);
        }
        return result;
    };

};

module.exports = ProductDataProvider;