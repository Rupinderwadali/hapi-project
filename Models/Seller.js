

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Config = require('../Config');

var address = new Schema({
    fullName:{type: String, default: null},
    addressLine1: {type: String, default: null},
    addressLine2: {type: String, default: null},
    city :{type: String, default: null},
    state:{type: String, default: null},
    countryName:{type: String, default: null},
    zipCode:{type: String, default: null},
    phoneNo: {type: String,default:'' },
    isDeleted:{type: Boolean, default: false, required: true},
    isDefault:{type: Boolean, default: false, required: true},
    date: {type: Date, default: Date.now, required: true},

});

var Seller=new Schema({

    name:{type:String,trim:true,required:true},
    email: {type: String, trim: true, unique: true, index: true,sparse: true},
    password: {type: String,default:null,required:true},
    address:[address],
    accessToken: {type: String, trim: true, index: true},
    verified:{type:Boolean,default:false}

});

module.exports = mongoose.model('Seller',Seller);