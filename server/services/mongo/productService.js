var util = require('util');
var mongoose = require('mongoose');
var _ = require('underscore');
var config = require("../../config")();
var exception = require('../../helpers/exception');
var areaDataSchema = require("../../models/Area");
var debug = require('debug')(config.appName);


// area data model.
var AreaDataModel = mongoose.model('Area', areaDataSchema);

function AreaDataProvider() {
    // model converter.
    var modelConverter = function(model) {
        var _model = {
            areaId: model.areaId,
            areaName: model.areaName,
            layerId: model.layerId,
            border: model.border, // object: {layerId,x,y,z}.
            lat: model.lat, // object:{areaId,areaName}
            lng: model.lng //date
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

    // create new area data 
    this.create = function(areaData, callback) {
        var area = new AreaDataModel(areaData);
        area.save(function(err, model) {
            if (err) {
                callback(exception.getErrorModel(err));
            } else {
                callback(modelConverter(model));
            }
        });
    };
    this.update = function(areaData, callback) {
        debug("update param data: ", areaData);
        var _self = this;
        AreaDataModel.findOneAndUpdate({
            areaId: areaData.areaId
        }, areaData, function(err, areaData) {
            if (err) {
                callback(exception.getErrorModel(err));
            } else {
                callback(modelConverter(areaData));
            }
        });
    };
    this.remove = function(areaId, callback) {
        AreaDataModel.remove({
            areaId: areaId
        }, function(err) {
            if (err) {
                callback(exception.getErrorModel(err));
            } else {
                callback(true);
            }
        });
    };
    // find area information
    this.findDataById = function(areaId, callback) {
        AreaDataModel.findOne({
            areaId: areaId
        }, function(err, detail) {
            if (err) {
                callback(exception.getErrorModel(err));
            } else {
                var areaData = modelConverter(detail);
                callback(modelConverter(areaData));
            }
        });
    };
    this.findAll = function(callback) {
        AreaDataModel.find(function(err, areaListData) {
            if (err) {
                callback(exception.getErrorModel(err));
            } else {
                callback(listConverter(areaListData));
            }
        });
    };

}
module.exports = function() {
    return new AreaDataProvider();
};
