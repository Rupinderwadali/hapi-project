var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Config = require('../Config');

var users=new Schema({
    uid: {type: Schema.ObjectId, ref: "taskUsers"},
    checkIN: {type: String, trim: true, default: null},
    checkOUT: {type: String, trim: true, default: null}
});
var places=new Schema({
    bid:{type: String,trim:true,default:null},
    name:{type: String,trim:true,default:null},
    latitude:{type: String,trim:true,default:null},
    longitude:{type: String,trim:true,default:null},
    vicinity:{type: String,trim:true,default:null},
    count:{type: Number,default:0},
    countMale:{type: Number,default:0},
    countFemale:{type: Number,default:0},
    users:[users]
});

module.exports = mongoose.model('places', places);