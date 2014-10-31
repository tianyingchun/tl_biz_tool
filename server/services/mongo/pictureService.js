var util = require('util');
var mongoose = require('mongoose');
var _ = require('underscore');
var config = require("../../config")();
var exception = require('../../helpers/exception');
var beaconDataSchema = require("../../models/BeaconData");
var debug = require('debug')(config.appName);

// beacon data model.
var BeaconDataModel = mongoose.model('BeaconData', beaconDataSchema);

function BeaconDataProvider() {
    // all available devices.
    var availableDevices = [{
        key: 'ble',
        name: "蓝牙"
    }, {
        key: 'wifi',
        name: "WIFI"
    }];
    // model converter.
    var modelConverter = function(model) {
        var _model = {
            id: model.id,
            uuid: model.uuid,
            major: model.major,
            minor: model.minor,
            txPower: model.txPower,
            powerA: model.powerA,
            envN: model.envN,
            type: model.type,
            // now we supported devices list.
            devices: availableDevices,
            location: model.location, // object: {layerId,x,y,z}.
            area: model.area, // object:{areaId,areaName}
            createAt: model.createAt //date
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
     * place an order
     * @param  {array} orderData [{pId:"", qty:''}]
     */
    this.create = function(beaconData, callback) {
        var beacon = new BeaconDataModel(beaconData);
        beacon.save(function(err, model) {
            if (err) {
                callback(exception.getErrorModel(err));
            } else {
                callback(modelConverter(model));
            }
        });
    };
    // note: order.orderId is required.
    this.update = function(beaconDataModel, callback) {
        debug("update param data: ", beaconDataModel);
        var _self = this;
        BeaconDataModel.findOneAndUpdate({
            id: beaconDataModel.id
        }, beaconDataModel, function(err, beaconData) {
            if (err) {
                callback(exception.getErrorModel(err));
            } else {
                callback(modelConverter(beaconData));
            }
        });
    };
    /**
     * List all available devices list for now.]
     */
    this.findAllAvailableDevices = function() {
        return availableDevices;
    };
    // remove beacon data.
    this.remove = function(id, callback) {
        BeaconDataModel.remove({
            id: id
        }, function(err) {
            if (err) {
                callback(exception.getErrorModel(err));
            } else {
                callback(true);
            }
        });
    };
    this.findDataById = function(id, callback) {
        BeaconDataModel.findOne({
            id: id
        }, function(err, detail) {
            if (err) {
                callback(exception.getErrorModel(err));
            } else {
                var beaconData = modelConverter(detail);
                callback(modelConverter(beaconData));
            }
        });
    };
    this.findAll = function(callback) {
        BeaconDataModel.find(function(err, beaconListData) {
            if (err) {
                callback(exception.getErrorModel(err));
            } else {
                callback(listConverter(beaconListData));
            }
        });
    };
};
module.exports = function() {
    return new BeaconDataProvider();
};
