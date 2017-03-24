var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Config = require('../Config');


var address = new Schema({
    addressLine1: {type: String, default: null},
    countryName:{type: String, default: null},
    city :{type: String, default: null},
    state:{type: String, default: null},
    zipcode:{type: String, default: null},
    phoneNo: {type: String,default:'' },
    isDeleted:{type: Boolean, default: false, required: true},
    isDefault:{type: Boolean, default: false, required: true},
    date: {type: Date, default: Date.now, required: true},

});


var Users = new Schema({
    name: {type: String, trim: true, index: true, default: null},
    email: {type: String, trim: true, unique: true, index: true,sparse: true},
    password: {type: String,default:null},
    phoneNo: {type: String, trim: true, index: true, min: 5, max: 15},
    registrationDate: {type: Date, default: Date.now, required: true},
    address:[address],
    accessToken: {type: String, trim: true, index: true},
    profilePicURL: {
        original: {type: String, default: null},
        thumbnail: {type: String, default: null}
    }
});

//Users.index({'currentLocation': "2d"});

module.exports = mongoose.model('Users', Users);
