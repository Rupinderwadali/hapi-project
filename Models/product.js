var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Config = require('../Config');



var Products=new Schema({
    name:{type:String,trim:true,required:true},
    description:{type:String,trim:true,required:true},
    size:{type: String,trim:true},
    color:{type:String,trim:true},
    categoryId:{type:Schema.ObjectId,ref:"Category"},
    supplierID:[{type:Schema.ObjectId,ref:"Supplier"}],
    price:{type:Number,trim:true,required:true}
});




module.exports = mongoose.model('Products', Products);