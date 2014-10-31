var util = require('util');
var mongoose = require('mongoose');
var _ = require('underscore');
var config = require("../../config")();
var exception = require('../../helpers/exception');
var dateFormat = require('../../helpers/dateformat');
var moveStoreLineDataSchema = require("../../models/MoveStoreLine");
var debug = require('debug')(config.appName);

// moves store line data model.
var MoveStoreLineDataModel = mongoose.model('Road', moveStoreLineDataSchema);

function MoveStoreLineDataProvider() {
    // model converter.
    var modelConverter = function(model) {
        if (!model) return null;
        var _model = {
            // _id: model._id.toString(),
            userId: model.userId,
            recordTime: model.recordTime,
            createTime: model.createTime,
            roadValue: model.roadValue
        };
        return _model;
    };
    // list converter.
    var listConverter = function(list) {
        var result = [];
        for (var i = 0; i < list.length; i++) {
            var item = list[i];
            result.push(modelConverter(item));
        };
        return result;
    };
    /**
     * Find user history records in outdoor.
     * @param  {object}   query    the query conditions.
     * @param  {Function} callback the callback
     */
    this.findMoveStoreLine = function(query, callback) {
        var userId = query.userId;
        var day = getDay(query.date);
        // assign value to inputdate.
        query.inputdate=dateFormat(day,"MM/DD/YYYY");
        var queryDay = dateFormat(day, "YYYYMMDD");
        debug("query:-> userId:", userId, "query day:", queryDay);
        MoveStoreLineDataModel.findOne({
            "userId": userId,
            "recordTime": queryDay
        }, function(err, userMoveStoreLine) {
            if (err) {
                callback(exception.getErrorModel(err));
            } else {
                var geoJSON = modelConverter(userMoveStoreLine);
                debug("geoJSON: ", geoJSON);
                callback(geoJSON);
            }
        });
    };
    var addDays = function(dateObj, days) {
        var adjustDate = new Date(dateObj.getTime() + (24 * 60 * 60 * 1000 * days));
        return adjustDate;
    };
    var getDay = function(date) {
        var currentDay = new Date().setHours(0, 0, 0);
        var result = "";
        switch (date) {
            case "today":
                result = new Date(currentDay);
                break;
            case "yesterday":
                result = addDays(new Date(currentDay), -1);
                break;
            case "beforeyesterday":
                result = addDays(new Date(currentDay), -2);
                break;
            default:
                result = new Date(date);
        }
        return result;
    };
}

module.exports = function() {
    return new MoveStoreLineDataProvider();
};
