var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Config = require('../Config');


var address = new Schema({
    addressLine: {type: String, default: null},
    countryName:{type: String, default: null},
    city :{type: String, default: null},
    state:{type: String, default: null},
    zipcode:{type: String, default: null},
});


var taskUsers = new Schema({
    name: {type: String, trim: true, index: true, default: null},
    email: {type: String, trim: true, unique: true, index: true,sparse: true},
    password: {type: String,default:null},
    gender:{type:String,default:null},
    hobbies: [{type: String, trim: true, default: null}],
    phoneNo: {type: String,default:'' },
    registrationDate: {type: Date, default: Date.now, required: true},
    address:[address],
    dob:{
        date:{type:Number,default:1},
        month:{type:Number,default:1},
        year:{type:Number,default:1990}    
        },
    accessToken: {type: String, trim: true, index: true},

});

module.exports = mongoose.model('taskUsers', taskUsers);
