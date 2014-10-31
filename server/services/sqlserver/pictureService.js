var util = require('util');
var mongoose = require('mongoose');
var _ = require('underscore');
var config = require("../../config")();
var exception = require('../../helpers/exception');
var pictureDataSchema = require("../../models/Picture");
var debug = require('debug')(config.appName);

// picture data model.

function PictureDataProvider() {
    
};
module.exports = function() {
    return new PictureDataProvider();
};
