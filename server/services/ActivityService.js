var util = require('util');
var logger = require('../helpers/log');
var dataProvider = require("../dataProvider");
var exception = require('../helpers/exception');

/**
 * Design to expose some helper method to maintain some activity
 * e.g. home page supper deals.
 */
function ActivityDataProvider() {

	/**
	 * List products summary information by given product id
	 * @param  {array} productIds [1,2,3,4]
	 */
	this.getSupperDealsProducts= function(productIds) {

	};
	/**
	 * Update give product
	 * @param {number} productId product id
	 * @param {date} startTime start time
	 * @param {date} endTime   end time.
	 */
	this.setSupperDealsAvailableDate = function(productId, startTime, endTime) {

	};
}

module.exports = ActivityDataProvider;
