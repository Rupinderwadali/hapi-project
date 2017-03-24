var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Config = require('../Config');

var eveTaskUser=new Schema({
    name: {type: String, trim: true, index: true, default: null},
    email: {type: String, trim: true, unique: true, index: true,sparse: true},
    password: {type: String,default:null},
    city: {type: String, trim: true, index: true},
    accessToken:{type: String, trim: true, index: true},
});

module.exports =mongoose.model('eveTaskUser',eveTaskUser);
