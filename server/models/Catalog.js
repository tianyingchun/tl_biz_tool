var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    accessToken: String,
    tokenType: String,
    deviceId: String,
    name: String, //中文名1qianbao 实名认证
    username: String, // 13764826689未来可能叫做邮箱1qianbao目前只有手机
    userId: String, // 1qianbao的用户ID
    mobile: String, // 手机 13764826689 1qianbao的手机号
    createTime: {
        type: Date,
        default: Date.now
    },
    updateTime: {
        type: Date,
        default: Date.now
    },
    expiredTime: Date,
    expiredDuration: Date
}, {
    collection: 'Customer'
});
module.exports = userSchema;
