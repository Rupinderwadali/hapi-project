
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Config = require('../Config');

var AppVersions = new Schema({
    latestIOSVersion : {type: String, required:true},
    latestAndroidVersion : {type: String, required:true},
    criticalAndroidVersion : {type: String, required:true},
    criticalIOSVersion : {type: String, required:true},
    appType : {
        type : String, index:true, unique:true, enum : [
            Config.APP_CONSTANTS.DATABASE.USER_ROLES.FSO_MANAGER,
            Config.APP_CONSTANTS.DATABASE.USER_ROLES.ADMIN,
            Config.APP_CONSTANTS.DATABASE.USER_ROLES.CUSTOMER,
            Config.APP_CONSTANTS.DATABASE.USER_ROLES.FSO_EMPLOYEE
        ]
    },
    timeStamp: {type: Date, default: Date.now}
});


module.exports = mongoose.model('AppVersions', AppVersions);