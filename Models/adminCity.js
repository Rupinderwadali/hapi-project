var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Config = require('../Config');


var adminCity = new Schema({

    CreatorID:{type: Schema.ObjectId, ref: "Admins"},
    cityName: {type: String, trim: true, index: true, default: null, sparse: true},
    cityImageURL: {type: String, trim: true, index: true},
    isDefault: {type:Boolean, default:false,}

});



module.exports =mongoose.model('adminCity', adminCity);
