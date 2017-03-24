'use strict';
var Service = require('../Services');
var UniversalFunctions = require('../Utils/UniversalFunctions');
var async = require('async');
var emailPass=require('../emailPass')
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


var createUser=function (payloadData, callback) {

    var accessToken = null;
    console.log("......",payloadData);
    var dataToSave = payloadData;

    dataToSave.address={};
    dataToSave.address.countryName=payloadData.countryName;
    dataToSave.profilePicURL={};

    if (dataToSave.password)
        dataToSave.password = UniversalFunctions.CryptData(dataToSave.password);
    var userData = null;

    async.waterfall([
        function (callback) {
            //verify email address
            if (!UniversalFunctions.verifyEmailFormat(dataToSave.email)) {
                callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_EMAIL);
            } else {
                callback(null);
            }
        },
            function (callback) {

               console.log("...................",payloadData.profilePic.filename,payloadData.profilePic);
                console.log("...............here.......");
                var finalpath = Path.resolve('./uploads/' + payloadData.name +payloadData.profilePic.filename);
                console.log("finalpath...........",finalpath),
                    dataToSave.profilePicURL.original=finalpath;
                fsExtra.copy(payloadData.profilePic.path, finalpath, function (err, data) {
                    console.log("................done");
                    if(err)
                        callback(err);
                    else
                        callback(null);
                });
            },


        function (callback) {
            var finalpath = Path.resolve('./uploads/user/' +'_thumbnail_'+ payloadData.name +payloadData.profilePic.filename);
            dataToSave.profilePicURL.thumbnail=finalpath;
            im.resize({
                srcPath: payloadData.profilePic.path,
                dstPath: finalpath,
                width: 300,
                height: 300
            }, function(err){
                if (err) callback(err);
                console.log('resized image');
            });
            callback(null);
        },

            function (callback) {
            console.log(".............................dcsicbwuiecbnalincqioacnqpmjc");
            dataToSave.registrationDate = new Date().toISOString();
            Service.UserServices.createUser(dataToSave, function (err, userDataFromDB) {
                if (err) {

                    if (err.code == 11000 && err.message.indexOf('customers.$phoneNo_1') > -1){
                        cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.PHONE_NO_EXIST);

                    } else if (err.code == 11000 ){
                        cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.EMAIL_ALREADY_EXIST);

                    }else {
                        cb(err)
                    }
                } else {
                    console.log(userDataFromDB);
                    userData = userDataFromDB;
                    callback(null);
                }
            })
        },

      /* function (cb) {
            if (userData && dataToUpdate && dataToUpdate.profilePicURL && dataToUpdate.profilePicURL.original) {
                //Update User
                var criteria = {
                    _id: userData._id
                };
                var setQuery = {
                    $set: dataToUpdate
                };
                console.log("..............updating pic");
                Service.UserServices.updateUser(criteria, setQuery, {new: true}, function (err, updatedData) {
                    userData = updatedData;
                    cb(err, updatedData)
                })
            }
        },

     /*   function (cb) {
            //Set Access Token
            if (userData) {
                var tokenData = {
                    id: userData._id,
                    type: UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.USER_ROLES.CUSTOMER
                };
                TokenManager.setToken(tokenData, function (err, output) {
                    if (err) {
                        cb(err);
                    } else {
                        accessToken = output && output.accessToken || null;
                        userData.accessToken=accessToken;
                        cb();
                    }
                })
            } else {
                cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR)
            }
        },*/
    ],
    function (err, data) {
        if (err) {
            callback(err);
        } else {
            callback(null, userData);
        }
    });
};


var loginUsers = function (payloadData, callback) {
    var userFound = false;
    var accessToken = null;
    var successLogin = false;
   // var flushPreviousSessions = payloadData.flushPreviousSessions || false;
    var updatedUserDetails = {};
    async.series([

        function (cb) {
            var criteria = {
                email: payloadData.email
            };
            var projection = {};
            var option = {
                lean: true
            };
            Service.UserServices.getUsers(criteria, projection, option, function (err, result) {
                if (err) {
                    cb(err)
                } else {
                    userFound = result && result[0] || null;
                    cb();
                }
            });
        },
        function (cb) {
            //validations
            if (!userFound) {
                cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.EMAIL_NOT_FOUND);
            }
            else {
                if (userFound && userFound.password != UniversalFunctions.CryptData(payloadData.password)) {
                    cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INCORRECT_PASSWORD);
                } else {
                    successLogin = true;
                    cb();
                }
            }
        },
        function (cb) {
            if (successLogin) {
                var tokenData = {
                    id: userFound._id,
                    type: UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.USER_ROLES.CUSTOMER
                };
                TokenManager.setToken(tokenData, function (err, output) {
                    if (err) {
                        cb(err);
                    } else {
                        if (output && output.accessToken) {
                            accessToken = output && output.accessToken;
                            // updatedUserDetails.accessToken=accessToken;
                            cb();
                        } else {
                            cb(UniversalFunctions.CONFIG.APP_CONSTANTS.ERROR.IMP_ERROR)
                        }
                    }
                })
            } else {
                cb(UniversalFunctions.CONFIG.APP_CONSTANTS.ERROR.IMP_ERROR)
            }

        },
        function (cb) {
            var criteria = {
                _id: userFound._id
            };
            var projection={};
            var options={};
            Service.UserServices.getUsers(criteria,projection,options , function (err, data) {

                updatedUserDetails = data;


                cb(err, updatedUserDetails);
            });

        },

    ], function (err, data) {
        if (err) {
            callback(err);
        } else {
            callback(null,updatedUserDetails
                //accessToken: accessToken,
                //  UniversalFunctions.deleteUnnecessaryUserData(updatedUserDetails.toObject())
            );
        }
    });
};


module.exports = {
    createUser: createUser,
    loginUsers: loginUsers
}