var util = require('util');
var _ = require('underscore');
var config = require("../../config")();
var exception = require('../../helpers/exception');
var productDataSchema = require("../../models/Product");
var debug = require('debug')(config.appName);


// product data model.

function ProductDataProvider() {
     

}
module.exports = function() {
    return new ProductDataProvider();
};
