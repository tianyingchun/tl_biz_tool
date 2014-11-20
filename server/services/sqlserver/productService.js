var util = require('util');
var _ = require('underscore');
var exception = require('../../helpers/exception');
var productDataSchema = require("../../models/Product");
var logger = require('../../helpers/log');

var ProductModel = require('../../models/Product');
var ProductVariantModel = require('../../models/ProductVariant');


// data provider singleton.
var dataProvider = require("../dataProvider");

var productSqlDal= require（"../../datalayer/productDal");
// product data model.

function ProductDataProvider() {
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

        return productSqlDalService.addNewProduct(productModel, productVariant);
    };
};

module.exports = function() {
    return new ProductDataProvider();
};
