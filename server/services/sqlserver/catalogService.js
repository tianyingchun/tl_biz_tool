var util = require('util');
var mongoose = require('mongoose');
var _ = require('underscore');
var config = require("../../config")();
var exception = require('../../helpers/exception');
var dateFormat = require('../../helpers/dateformat');
var catalogDataSchema = require("../../models/Catalog");
var debug = require('debug')(config.appName);

// catalog data model.

function CatalogDataProvider() {
     
}

module.exports = function() {
    return new CatalogDataProvider();
};
