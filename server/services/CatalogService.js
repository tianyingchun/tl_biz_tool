var util = require('util');
var logger = require('../helpers/log');
var dataProvider = require("../dataProvider");
var exception = require('../helpers/exception');
var CatalogModel = dataProvider.getModel("Catalog");

// catalog data model.

function CatalogDataProvider() {
	
}

module.exports = CatalogDataProvider;
