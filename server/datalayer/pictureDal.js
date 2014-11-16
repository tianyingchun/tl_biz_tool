var sql = require('mssql');
var config = require('../config')();
var logger = require('../helpers/log');
var utility = require('../helpers/utility');
var PictureModel = require("../models/Picture");
var baseDal = require("./baseDal");

function pictureDal() {
	/**
	 * Update picture to databse.
	 * @param  {object} picture picture entity instance.
	 * @return  promise object.
	 */
	this.updatePicture = function(picture) {
		var sql = "select * from picture where id= {0}";
		return baseDal.executeList(PictureModel, [sql, picture.id]);
	};
	this.insertPicture = function(picture) {

	};
};


module.exports = pictureDal;