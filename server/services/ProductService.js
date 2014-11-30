var util = require('util');
var Q = require("q");
var logger = require('../helpers/log');
// data provider singleton.
var dataProvider = require("../dataProvider");
// product model.
var ProductModel = dataProvider.getModel('Product');
// tier price model.
var TierPriceModel = dataProvider.getModel("TierPrice");
// product variant model.
var ProductVariantModel = dataProvider.getModel('ProductVariant');

var productSpiderDal = dataProvider.getDataAccess("spider", "Product");

var productDal = dataProvider.getDataAccess("Product");
// product data model.

var productCfg = dataProvider.getConfig("product");
// crawl configuration.
var productCrawlCfg = dataProvider.getConfigNode(productCfg, "crawl_config");
// auto uplopad configuration.
var productAutoUploadCfg = dataProvider.getConfigNode(productCfg, "autoupload_config");

function ProductDataProvider() {
    /**
     * Crawl product basic information from specificed spider repository
     * @param  {string} httpUrl product url.
     * @return {promise}
     */
    this.crawlProductInfo = function(httpUrl) {
        return productSpiderDal.start(httpUrl);
    };
    /**
     * Add new product information to database.
     * @param product the ProductModel.
     * @param categoryIds the category ids.
     * @param manufacturerIds the manufacturer ids.
     * @return promise.
     */
    this.addNewProduct = function(crawlProduct, categoryIds, manufacturerIds) {

        // first we need to check if existed the same product with provider sku(productId).
        var sku = crawlProduct.sku;
        var deferred = Q.defer();
        productDal.getProductVariantBySku(sku).then(function(testProductVariant) {
            // logger.debug("getProductVariantBySku: ", testProductVariant);
            if (!testProductVariant.Id) {
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
                _price = _price * productCrawlCfg.price_rate.value;

                productVariant.Price = _price;
                // the price we need paid!
                productVariant.SourcePrice = crawlProduct.nowPrice[0];
                // show the old price to customer.
                productVariant.OldPrice = _price * productCrawlCfg.old_price_rate.value;
                productVariant.ProductCost = productVariant.SourcePrice;
                productVariant.SourceUrl = crawlProduct.providerUrl;
                productVariant.SourceInfoComment = crawlProduct.title;

                productVariant.ProductAttribts = crawlProduct.productAttribts || {};
                // prepare tier price.
                productVariant.TierPrices = prepareProductTierPrice(productVariant.Price);

                logger.debug("Product Vairant Info: priceRate: `%s`, nowPrice: `%s`, oldPrice:`%s`, producCost:`%s` ", productCrawlCfg.price_rate.value, _price, productVariant.OldPrice, productVariant.ProductCost);

                // Add product basic information and product variant information.
                productDal.addNewProduct(productModel, productVariant).then(function(result) {
                    deferred.resolve(result);
                }, function(err) {
                    deferred.reject(err);
                });

                // productDal.addProductCategoryMappings(productId, categoryIds);

                // productDal.addProductManufacturerMappings(productId, manufacturerIds);


            } else {
                deferred.reject(new Error("不能添加重复的产品SKU: " + sku + ", url:" + crawlProduct.providerUrl));
            }

        }, function(err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };
    /**
     * add product category mappings
     * @param {object} product     ProductModel.
     * @param {array} manufacturerIds  all brand manufacturer ids.
     */
    this.addProductManufacturerMappings = function(product, manufacturerIds) {

        var deferred = Q.defer();

        var default_manufacturerids = manufacturerIds || [productAutoUploadCfg.defaultManufacturerId.value];

        logger.debug("default_manufacturerids: ", default_manufacturerids);

        productDal.addProductManufacturerMappings(product.Id, default_manufacturerids).then(function() {
            deferred.resolve("addProductManufacturerMappings->success");
        }, function(err) {
            logger.error("addProductManufacturerMappings Error:", err);
            deferred.reject(err);
        });

        return deferred.promise;
    };

    /**
     * add product category mappings
     * @param {object} product     product instance.
     * @param {array} categoryIds category ids.
     */
    this.addProductCategoryMappings = function(product, categoryIds) {
        var deferred = Q.defer();

        logger.debug("insert categoryids: ", categoryIds);

        productDal.addProductCategoryMappings(product.Id, categoryIds).then(function(affectedRows) {
            deferred.resolve("addProductCategoryMappings success (" + affectedRows + ")");
        }, function(err) {
            logger.error("addProductCategoryMappings Error:", err);
            deferred.reject(err);
        });

        return deferred.promise;
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
            tierPriceModel.Price = values[tier] * nowPrice;
            result.push(tierPriceModel);
        }
        return result;
    };

};

module.exports = ProductDataProvider;