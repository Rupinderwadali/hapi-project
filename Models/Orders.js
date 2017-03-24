
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Config = require('../Config');

var address = new Schema({
    fullName:{type: String, default: null},
    addressLine1: {type: String, default: null},
    addressLine2: {type: String, default: null},
    countryName:{type: String, default: null},
    city :{type: String, default: null},
    state:{type: String, default: null},
    zipcode:{type: String, default: null},
    phoneNo: {type: String,default:'' },

});

var Orders = new Schema({
    userID:{type:Schema.ObjectId,ref:'Users',required:true,index:true},
    products:[{
        productId:{type: Schema.ObjectId, ref:'product',required: true},
        quantity:{type:Number,trim:true,default:1},
        unitPrice:{type:Number,trim:true}
    }],
    netAmount:{type:Number,trim:true},
    shippedStatus:{type:String,default:false,},
    shipDetails:{address},
    date:{type: Date, default: Date.now, required: true}
});

module.exports = mongoose.model('Orders', Orders);