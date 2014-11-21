var logger = require('../../helpers/log'); 
var dataProvider = require("../../dataProvider");

var ManufacturerModel = dataProvider.getModel("Manufacturer");

var baseDal = require("../baseDal");

function ManufacturerDal() {

	this.getAllManufacturers = function() {
		var sql = "SELECT * FROM  dbo.Manufacturer";
		return baseDal.executeList(ManufacturerModel, [sql]);
	};
};

module.exports = ManufacturerDal;