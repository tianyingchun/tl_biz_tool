var util = require('util');
var logger = require('../helpers/log');
// data provider singleton.
var dataProvider = require("../dataProvider");

// product model.
var ProductModel = dataProvider.getModel('Product');
// product variant model.
var ProductVariantModel = dataProvider.getModel('ProductVariant');

var productSpiderDal = dataProvider.getDataAccess("spider", "product");

var ProductDal = dataProvider.getDataAccess("product");
// product data model.

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
     * @return promise.
     */
    this.addNewProduct = function(crawlProduct) {

        var productModel = new ProductModel();

        productModel.Name = crawlProduct.Name;

        productModel.ShortDescription = crawlProduct.Name;

        productModel.FullDescription = crawlProduct.description;

        //productId, name, sku, description
        var productVariant = new ProductVariantModel(0, crawlProduct.Name, crawlProduct.productId, crawlProduct.Name);

        productVariant.ProductAttribts = crawlProduct.productAttribts || {};
        productVariant.SpecAttribts = crawlProduct.specAttribts || [];
 
        return new ProductDal().addNewProduct(productModel, productVariant);
    };
};

module.exports = ProductDataProvider;