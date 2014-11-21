var sql = require('mssql');
var config = require('../config')();
var logger = require('../helpers/log');
var utility = require('../helpers/utility');
var ManufacturerModel = require("../models/Manufacturer");
var baseDal = require("./baseDal");

function ManufacturerDal() {

	this.getAllManufacturers = function() {
		var sql = "SELECT * FROM  dbo.Manufacturer";
		return baseDal.executeList(ManufacturerModel, [sql]);
	};
};

module.exports = ManufacturerDal;