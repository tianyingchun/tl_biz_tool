var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var moveStoreLineSchema = new Schema({
    userId: String,
    recordTime: String,
    createTime: String,
    roadValue: String
}, {
    collection: 'Road'
});
module.exports = moveStoreLineSchema;
