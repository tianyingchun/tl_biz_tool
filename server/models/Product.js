var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var areaSchema = new Schema({
    areaId: {
        type: String,
        default: '',
        trim: true
    },
    areaName: String,
    layerId: String,
    border: [], // top, right,bottom,left
    lat: Number, //gps
    lng: Number //gps
}, {
    collection: 'Area'
});
module.exports = areaSchema;
