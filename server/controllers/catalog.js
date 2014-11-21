var express = require('express');
var router = express.Router();
var base = require("./base");
var logger = require("../helpers/log");
// data provider singleton.
var dataProvider = require("../dataProvider");

// catalog service
var catalogService = new dataProvider.getService("Catalog")();

// send customized message to user.


module.exports = router;
