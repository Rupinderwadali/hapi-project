var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Config = require('../Config');

var information = new Schema({
    latitude:{type: String, default: ''},
    longitude: {type: String, default: ''},
    country: {type: String, default: ''},
    countryCode:{type: String, default: ''},
    city :{type: String, default: ''},
    zipcode:{type: String, default: ''},
    streetName: {type: String,default:'' },
    streetNumber:{type: String, default: ''},
    provider:{type: String, default: ''}

});

module.exports = mongoose.model('information', information);
