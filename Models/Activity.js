
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Config = require('../Config');

var Activity = new Schema({
    userId:{type:Schema.ObjectId,ref:"Users",trim:true,required:true},
    time:{type: Date, default: Date.now, required: true},
    text:{type:String,required:true,trim:true},
    idType:{
        type: String, enum: [
            Config.APP_CONSTANTS.DATABASE.USER_ROLES.SELLER,
            Config.APP_CONSTANTS.DATABASE.USER_ROLES.CUSTOMER,
            Config.APP_CONSTANTS.DATABASE.USER_ROLES.PRODUCT
        ]
    },

    secondId:{type:String,required:true,trim:true},
  /*  secondId:{
        enum: [
            {type:Schema.ObjectId,ref:"Users",trim:true,required:true},
            {type:Schema.ObjectId,ref:"Products",trim:true,required:true},
            {type:Schema.ObjectId,ref:"Seller",trim:true,required:true},
            ]
},*/


});



module.exports = mongoose.model('Activity', Activity);
