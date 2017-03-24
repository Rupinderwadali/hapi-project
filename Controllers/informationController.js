'use strict';

var Service = require('../Services');
var UniversalFunctions = require('../Utils/UniversalFunctions');
var async = require('async');
var emailPass=require('../emailPass');
var twilio = require('twilio');
var UploadManager = require('../Lib/UploadManager');
var TokenManager = require('../Lib/TokenManager');
var Path = require('path');
var im = require('imagemagick');
var NotificationManager = require('../Lib/NotificationManager');
var CodeGenerator = require('../Lib/CodeGenerator');
var Config=require('../Config');
var moment=require('moment');
var Models = require('../Models');
var fsExtra = require('fs-extra');
var geolib = require('geolib');
var ng = require('node-geocoder');
var apn = require('apn');

var calculateDistance=function (payloadData,callback) {
  console.log("...........in controller");
    var distance;
    var distanceCalculated={};
    async.waterfall([
        function(callback){
         distance =geolib.getDistance({latitude:parseFloat(payloadData.startLatitude),longitude:parseFloat(payloadData.startLongitude)},{latitude:parseFloat(payloadData.stopLatitude),longitude:parseFloat(payloadData.stopLongitude)},1);
             console.log("........inside function........",distance);

                distanceCalculated.distance=distance;
                callback(null);

        }

    ],function (err,result) {
        if(err)
            callback(err);
        else
        {
            callback(null,distanceCalculated);
        }

        }
    )

};

var fetchLatLong=function (payloadData,callback) {
    console.log("...........in controller");

    var fetchedLatLong={};
    async.waterfall([
            function(callback){
                var options = {
                    provider: 'google',
                };
                var geocoder = ng(options);

                geocoder.geocode(payloadData.Address, function(err, res) {
                    if(err)
                        callback(err);
                    fetchedLatLong=res;
                    console.log(res);
                    callback(null);
                });
           }

        ],function (err,result) {
            if(err)
                callback(err);
            else
            {
                callback(null,fetchedLatLong);
            }

        }
    )

};

var fetchAddress=function (payloadData,callback) {
    console.log("...........in controller");

    var fetchedAddress={};
    async.waterfall([
            function(callback){
                var options = {
                    provider: 'google',
                };
                var geocoder = ng(options);
                console.log("...........here    ");
                geocoder.reverse({lat:parseFloat(payloadData.Latitude), lon:parseFloat(payloadData.Longitude)}, function(err, res) {

                    if(err)
                        callback(err);
                    fetchedAddress=res;
                    console.log(res);
                    callback(null);
                });
            }

        ],function (err,result) {
            if(err)
                callback(err);
            else
            {
                callback(null,fetchedAddress);
            }

        }
    )

};


var sendSms=function (payloadData,callback) {

    var client = new twilio.RestClient('AC1a9fb3057ed9a32b583e7d98aceb3784', 'fbf8dca86f4ad92d3aa2f0ebf9d51d07');


    client.sms.messages.create({
        to:'+919458113640',
        from:'+13312156267',
        body:payloadData.message
    }, function(error, message) {
        if (!error) {
            console.log('Success! The SID for this SMS message is:');
            console.log(message.sid);
            console.log('Message sent on:');
            console.log(message.dateCreated);
        } else {
            console.log('Oops! There was an error.');
        }
    })

};

var pushNote=function(callback){
    var provider = new apn.Provider({
  token: {
    key: "path/to/key.pem",
    keyId: "key-id",
    teamId: "developer-team-id"
  },
  production: false
    });

var deviceTokens = ["42db94bfb4f74b2105f91b3efb6e66a0e72796a58cb7a7eaa8de753dec0c7e1f"];

var notification = new apn.Notification();
notification.alert = "Hello, world!";
notification.badge = 1;
notification.topic = "io.github.node-apn.test-app";

provider.send(notification, deviceTokens).then( (response) => {
        // response.sent: Array of device tokens to which the notification was sent succesfully
        // response.failed: Array of objects containing the device token (`device`) and either an `error`, or a `status` and `response` from the API
});

}

module.exports = {
    calculateDistance : calculateDistance,
    fetchLatLong:fetchLatLong,
    fetchAddress:fetchAddress,
    sendSms:sendSms,
    pushNote:pushNote
}