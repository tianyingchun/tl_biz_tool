var util = require('util');

var config = require("../../config")();
var exception = require('../../helpers/exception');
var catalogDataSchema = require("../../models/Catalog");
var debug = require('debug')(config.appName);

// catalog data model.

function CatalogDataProvider() {
	
}

module.exports = function() {
    return new CatalogDataProvider();
};