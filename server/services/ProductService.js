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
// product variant model.
var ProductVariantModel = dataProvider.getModel('ProductVariant');

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

        return productDal.getProductVariantBySku(sku).then(function(productVariant) {
            if (productVariant) {
                return productVariant.ProductId;
            } else {
                logger.debug("Can't find product varant by sku:" + sku);
                throw new Error("Can't find product varant by sku:" + sku);
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

        manufacturerIds = (manufacturerIds && manufacturerIds.length) ? manufacturerIds : [productAutoUploadCfg.defaultManufacturerId.value];
        // first we need to check if existed the same product with provider sku(productId).
        var sku = crawlProduct.sku;
        var deferred = Q.defer();
        productDal.getProductVariantBySku(sku).then(function(testProductVariant) {
            // logger.debug("getProductVariantBySku: ", testProductVariant);
            if (!testProductVariant || !testProductVariant.Id) {
                // product name.
                var name = crawlProduct.title;

                var productModel = new ProductModel();

                productModel.Name = name;

                productModel.ShortDescription = name;

                productModel.FullDescription = crawlProduct.description;
                // asign product spec attributes
                productModel.SpecAttribts = crawlProduct.specAttribts || [];

                //productId, name, sku, description
                var productVariant = new ProductVariantModel(0, name, sku, name);
                // make sure that if now price eqauls 0 we need to throw error.
                var _price = crawlProduct.nowPrice.length ? crawlProduct.nowPrice[0] : 0;
                _price = _price * parseFloat(productCrawlCfg.price_rate.value);

                // if current price less than 10USD, alway use 9.9$ we can make some activity for this.
                if (_price < 10) {
                    // set specical price for this.
                    logger.warn("set specical price as 9.9$, origin price is: " + _price + " sku: " + sku);

                    _price = 9.9;

                    // use random rate for old price if sale price equals 9.9
                    productVariant.OldPrice = _price * parseFloat(productCrawlCfg.old_price_rate.value) * (Math.random() / 2 + 1);

                } else {
                    // show the old price to customer.
                    productVariant.OldPrice = _price * parseFloat(productCrawlCfg.old_price_rate.value);
                }

                productVariant.Price = _price;

                // the price we need paid!
                productVariant.SourcePrice = crawlProduct.nowPrice[0];
                productVariant.ProductCost = productVariant.SourcePrice;
                productVariant.SourceUrl = crawlProduct.providerUrl;
                productVariant.SourceInfoComment = crawlProduct.title;

                productVariant.ProductAttribts = crawlProduct.productAttribts || {};
                // prepare tier price.
                productVariant.TierPrices = prepareProductTierPrice(productVariant.Price);

                logger.debug("Product Vairant Info: priceRate: `%s`, nowPrice: `%s`, oldPrice:`%s`, producCost:`%s` ", productCrawlCfg.price_rate.value, _price, productVariant.OldPrice, productVariant.ProductCost);

                var finnalResultMessage;

                // Add product basic information and product variant information.
                productDal.addNewProduct(productModel, productVariant).then(function(result) {

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
        this.getProductIdBySku(sku).then(function(productId) {

            productDal.addProductSpecificationAttributes(productId, specAttribts)
                .then(function(result) {
                    logger.debug("updateProductSpecificationAttributes finished!");
                    callback(null, result);
                }, function(err) {
                    callback(err);
                });
        });
    };

    //
    // helper methods: prepareProductTierPrice
    // ------------------------------------------------------------------------
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