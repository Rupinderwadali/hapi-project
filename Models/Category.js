var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Config = require('../Config');


var Category=new Schema({
    createrID:{type:Schema.ObjectId,ref:"Admin"},
    name:{type:String,trim:true,unique:true,required:true},
    description:{type:String,trim:true,required:true},
    active:{type:Boolean,default:true},
    categoryPicURL: {
        original: {type: String, default: null},
        thumbnail: {type: String, default: null}
    }
});

module.exports = mongoose.model('Category',Category);