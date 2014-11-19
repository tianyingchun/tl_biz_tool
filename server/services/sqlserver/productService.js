var util = require('util');
var _ = require('underscore');
var exception = require('../../helpers/exception');
var productDataSchema = require("../../models/Product");
var logger = require('../../helpers/log');

// data provider singleton.
var dataProvider = require("../dataProvider");


var productSpiderService = dataProvider.get("spider", "product");
// product data model.

function ProductDataProvider() {
    /**
     * Crawl product basic information from specificed http url.
     * @param  {string} httpUrl http absolute url
     * @return {promise}
     */
    this.extractOnlineProductDetail = function(httpUrl) {
        return productSpiderService.start(httpUrl);
    };
};

module.exports = function() {
    return new ProductDataProvider();
};
