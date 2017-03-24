/**
 * Created by daya .
 */
'use strict';
var Service = require('../Services');
var UniversalFunctions = require('../Utils/UniversalFunctions');
var async = require('async');
var emailPass=require('../emailPass')
var UploadManager = require('../Lib/UploadManager');
var TokenManager = require('../Lib/TokenManager');
var NotificationManager = require('../Lib/NotificationManager');
var CodeGenerator = require('../Lib/CodeGenerator');
var Config=require('../Config');
var fs=require('fs');
var moment=require('moment');
var Models = require('../Models');

var createUser=function (payloadData, callback) {

    var accessToken = null;
    var uniqueCode = null;
    var dataToSave = payloadData;
    if (dataToSave.password)
        dataToSave.password = UniversalFunctions.CryptData(dataToSave.password);
    dataToSave.firstTimeLogin = false;
    var userData = null;
    var dataToUpdate = {};
    if (payloadData.profilePic && payloadData.profilePic.filename) {
        dataToUpdate.profilePicURL = {
            original: null,
            thumbnail: null
        }
    }
    async.series([
        function (cb) {
            //verify email address
            if (!UniversalFunctions.verifyEmailFormat(dataToSave.email)) {
                cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_EMAIL);
            } else {
                cb();
            }
        },

        function (cb) {
            CodeGenerator.generateUniqueCode(4, UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.USER_ROLES.CUSTOMER, function (err, numberObj) {
                if (err) {
                    cb(err);
                } else {
                    if (!numberObj || numberObj.number == null) {
                        cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.UNIQUE_CODE_LIMIT_REACHED);
                    } else {
                        uniqueCode = numberObj.number;
                        cb();
                    }
                }
            })
        },
       /* function (cb) {
            //Clear Device Tokens if present anywhere else
            var criteria = {
                deviceToken: dataToSave.deviceToken
            };
            var setQuery = {
                $unset: {deviceToken: 1}
            };
            var options = {
                multi: true
            };
            Service.UserServices.updateCustomer(criteria, setQuery, options, cb)
        },*/
        function (cb) {
            //Insert Into DB

            dataToSave.registrationDate = new Date().toISOString();
            dataToSave.emailVerificationToken = UniversalFunctions.CryptData(JSON.stringify(dataToSave));
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
                    userData = userDataFromDB;
                    cb();
                }
            })
        },
      function (cb) {
            //Check if profile pic is being updated
             if (userData && userData._id && payloadData.profilePic && payloadData.profilePic.filename) {
                UploadManager.uploadFileToS3WithThumbnail(payloadData.profilePic, userData._id, function (err, uploadedInfo) {

                    if (err) {
                        cb(err)
                    } else {
                        dataToUpdate.profilePicURL.original = uploadedInfo && uploadedInfo.original && UniversalFunctions.CONFIG.awsS3Config.s3BucketCredentials.s3URL + uploadedInfo.original || null;
                        dataToUpdate.profilePicURL.thumbnail = uploadedInfo && uploadedInfo.thumbnail && UniversalFunctions.CONFIG.awsS3Config.s3BucketCredentials.s3URL + uploadedInfo.thumbnail || null;
                        cb();
                    }
                })
            } else {
                cb();
            }
        },
        function (cb) {
            if (userData && dataToUpdate && dataToUpdate.profilePicURL && dataToUpdate.profilePicURL.original) {
                //Update User
                var criteria = {
                    _id: userData._id
                };
                var setQuery = {
                    $set: dataToUpdate
                };
                Service.UserServices.updateUser(criteria, setQuery, {new: true}, function (err, updatedData) {
                    userData = updatedData;
                    cb(err, updatedData)
                })
            }else {
                if (userData && userData._id && payloadData.profilePic && payloadD-ata.profilePic.filename && !dataToUpdate.profilePicURL.original){
                    var criteria = {
                        _id: userData._id
                    };
                    Service.UserServices.deleteUser(criteria,function (err, updatedData) {
                        cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.ERROR_PROFILE_PIC_UPLOAD);
                    })
                }else {
                    cb();
                }
            }
        },
        /*function (cb) {
            //clearDeviceTokenFromDB
            if (dataToSave.deviceToken && userData) {
                clearDeviceTokenFromDB(dataToSave.deviceToken, cb)
            } else {
                cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR)
            }
        },*/
        /*function (cb) {
            //Send SMS to User
            if (userData) {
                NotificationManager.sendSMSToUser(uniqueCode, dataToSave.countryCode, dataToSave.phoneNo, function (err, data) {
                    cb();
                })
            } else {
                cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR)
            }

        },*/
       /* function (cb) {
            //Send Verification Email
            if (userData) {
                var emailType = 'REGISTRATION_MAIL';
                var variableDetails = {
                    user_name: dataToSave.name,
                    verification_url: UniversalFunctions.CONFIG.APP_CONSTANTS.SERVER.DOMAIN_NAME + '/api/customer/verifyEmail/' + dataToSave.emailVerificationToken
                };
                var emailAddress = dataToSave.email;
                NotificationManager.sendEmailToUser(emailType, variableDetails, emailAddress, cb)
            } else {
                cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR)
            }

        },*/
        function (cb) {
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
        }
    ], function (err, data) {
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
    var flushPreviousSessions = payloadData.flushPreviousSessions || false;
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
            else if (userFound.isBlocked==true)

                cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.BLOCK_USER);
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
            //Clear Device Tokens if present anywhere else

            var criteria = {
                deviceToken: payloadData.deviceToken
            };
            var setQuery = {
                $unset: {deviceToken: 1}
            };
            var options = {
                multi: true
            };
            Service.UserServices.updateUser(criteria, setQuery, options, cb)

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
            var setQuery = {
                //appVersion: payloadData.appVersion,
                deviceToken: payloadData.deviceToken,
                deviceType: payloadData.deviceType,
               // language: payloadData.language
            };
            Service.UserServices.updateUser(criteria, setQuery, {new: true}, function (err, data) {

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

var updateUser = function (userPayload, userData, callback) {
    var dataToUpdate = {};
    var updatedUser = null;
    var samePhoneNo = false;
    var uniqueCode = null;
    var phoneNoUpdateRequest = false;
    var newCountryCode = null;
    if (!userPayload || !userData) {
        callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    } else {

        if (userPayload.name && userPayload.name != '') {
            dataToUpdate.name = UniversalFunctions.sanitizeName(userPayload.name);
        }
        if (userPayload.deviceToken && userPayload.deviceToken != '') {
            dataToUpdate.deviceToken = userPayload.deviceToken;
        }

        if (userPayload.email && userPayload.email != '') {
            dataToUpdate.email = userPayload.email;
        }
        if (userPayload.countryName && userPayload.countryName != '') {
            dataToUpdate.countryName = userPayload.countryName;
        }

        if (userPayload.profilePic && userPayload.profilePic.filename) {
            dataToUpdate.profilePicURL = {
                original: null,
                thumbnail: null
            }
        }
        if (Object.keys(dataToUpdate).length == 0) {
            callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.NOTHING_TO_UPDATE);
        } else {
            async.auto({
               verifyemail: function (cb) {
                    //verify email address
                    if (dataToUpdate.email && !UniversalFunctions.verifyEmailFormat(dataToUpdate.email)) {
                        cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_EMAIL);
                    } else {
                        cb();
                    }
                },


                nameUpdate:function (cb) {
                    //Check all empty values validations
                    if (userPayload.name && !dataToUpdate.name) {
                        cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.EMPTY_VALUE)
                    } else if (dataToUpdate.name) {
                        UniversalFunctions.customQueryDataValidations('NAME', 'name', dataToUpdate.name, cb)
                    } else {
                        cb();
                    }
                },
               updateProfile: function (cb) {
                    //Check if profile pic is being updated
                    if (userPayload.profilePic && userPayload.profilePic.filename) {
                        UploadManager.uploadFileToS3WithThumbnail(userPayload.profilePic, userData.id, function (err, uploadedInfo) {
                            if (err) {
                                cb(err)
                            } else {
                                dataToUpdate.profilePicURL.original = uploadedInfo && uploadedInfo.original && UniversalFunctions.CONFIG.awsS3Config.s3BucketCredentials.s3URL + uploadedInfo.original || null;
                                dataToUpdate.profilePicURL.thumbnail = uploadedInfo && uploadedInfo.thumbnail && UniversalFunctions.CONFIG.awsS3Config.s3BucketCredentials.s3URL + uploadedInfo.thumbnail || null;
                                cb();
                            }
                        })
                    } else {
                        cb();
                    }
                },
                /*function (cb) {
                    if (userPayload.countryCode && userPayload.phoneNo && !samePhoneNo) {
                        var criteria = {
                            countryCode: userPayload.countryCode,
                            phoneNo: userPayload.phoneNo
                        };
                        var projection = {};
                        var option = {
                            lean: true
                        };
                        Service.CustomerService.getCustomer(criteria, projection, option, function (err, result) {
                            if (err) {
                                cb(err)
                            } else {
                                if (result && result.length > 0) {
                                    cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.PHONE_ALREADY_EXIST)
                                } else {
                                    cb();
                                }
                            }
                        });
                    } else {
                        cb();
                    }
                },*/
              /*  function (cb) {
                    if (!samePhoneNo && userPayload.phoneNo) {
                        CodeGenerator.generateUniqueCode(4, UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.USER_ROLES.CUSTOMER, function (err, numberObj) {
                            if (err) {
                                cb(err);
                            } else {
                                if (!numberObj || numberObj.number == null) {
                                    cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.UNIQUE_CODE_LIMIT_REACHED);
                                } else {
                                    uniqueCode = numberObj.number;
                                    cb();
                                }
                            }
                        })
                    } else {
                        cb();
                    }
                },*/
               updateData:['updateProfile','nameUpdate','verifyemail', function (err,cb) {
                    //Update User
                    var criteria = {
                        _id: userData._id
                    };
                    var setQuery = {
                        $set: dataToUpdate
                    };
                    Service.UserServices.updateUser(criteria, setQuery, {new: true}, function (err, updatedData) {
                        updatedUser = updatedData;
                        cb(err, updatedData)
                    })
                }]
        }, function (err, result) {
                if (err) {
                    callback(err)
                } else {
                    callback(null,updatedUser );
                }
            })
        }
    }
};


var loginUserViaFacebook = function (payloadData, callback) {
    var userFound ;
    var datatosend;
    var accessToken;
    var successLogin = false;
    //var flushPreviousSessions = payloadData.flushPreviousSessions || false;
    var updatedUserDetails ={};
    var response=0;
    async.auto({
        checkFbid:function (cb) {
            var criteria = {
                // facebookId: payloadData.facebookId
                $or: [
                    { facebookId: payloadData.facebookId},
                    { email: payloadData.facebookId },
                    { googleId: payloadData.facebookId }
                    ]
            };

            var projection = {};
            var option = {
                lean: true
            };
            Service.UserServices.getUsers(criteria, projection, option, function (err, result) {
                if (err) {
                    cb(err)
                }
                else if (result.length){

                    userFound = result && result[0]||null;
                    response=1;
                    cb(null,result);
                }
                else{
                    response=0;
                    cb()

                }
            });

        },
        createId:['checkFbid',function (err,cb) {
            //validations
            if (response == 0) {


                var criteria = {
                    facebookId: payloadData.facebookId,
                    name:payloadData.name,
                    //appVersion: payloadData.appVersion,
                    deviceToken: payloadData.deviceToken,
                    deviceType: payloadData.deviceType,
                    language: payloadData.language,
                    facebookImageUrl:payloadData.facebookImageUrl,
                    'profilePicURL.original':payloadData.facebookImageUrl

                };

                /*cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.FACEBOOK_ID_NOT_FOUND);*/
                Service.UserServices.createUser(criteria, function (err, result1) {

                    if (err){
                        cb(err);
                    }
                    else {
                        successLogin = true;
                        updatedUserDetails=result1;
                        updatedUserDetails.profilePicURL.original=result1.facebookImageUrl;

                        cb();
                    }
                })

            }
            else {


                var criteria = {
                    _id: userFound._id
                };
                var setQuery = {
                    //appVersion: payloadData.appVersion,
                    deviceToken: payloadData.deviceToken,
                    deviceType: payloadData.deviceType,
                    language: payloadData.language,
                    facebookImageUrl:payloadData.facebookImageUrl
                };
                Service.UserServices.updateUser(criteria, setQuery, {lean: true}, function (err, data) {
                    if (err){
                        callback(err)
                    }else {
                        updatedUserDetails = data;
                        updatedUserDetails.profilePicURL.original=data.facebookImageUrl;

                        cb(null,data);
                    }

                });
            }

        }],
        generateToken:['createId','checkFbid' ,function (err,cb) {
            var id_get=null;
            if(response===0)
                id_get=updatedUserDetails._id;
            else
                id_get = updatedUserDetails._id;

            var tokenData = {
                id:id_get,
                type: UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.USER_ROLES.CUSTOMER
            };
            TokenManager.setToken(tokenData, function (err, output) {
                if (err) {
                    cb(err);
                } else {
                    if (output && output.accessToken) {
                        accessToken = output && output.accessToken;
                        updatedUserDetails.accessToken=accessToken;
                        cb(null);
                    } else {
                        cb(err)
                    }
                }
            })
        } ],

    }, function (err, result3) {
        if(err)
        {
            callback(err)
        }
        else{
            callback(null,
                updatedUserDetails)
        }


    });
};
var loginUserViaGoogle = function (payloadData, callback) {
    var userFound ;
    var datatosend;
    var accessToken;
    var successLogin = false;
    //var flushPreviousSessions = payloadData.flushPreviousSessions || false;
    var updatedUserDetails={} ;
    var response=0;
    async.auto({
        checkFbid:function (cb) {
            var criteria = {
                // facebookId: payloadData.facebookId
                $or: [
                    { facebookId: payloadData.googleId},
                    { email: payloadData.googleId },
                    { googleId: payloadData.googleId }
                ]
            };

            var projection = {};
            var option = {
                lean: true
            };
            Service.UserServices.getUsers(criteria, projection, option, function (err, result) {
                if (err) {
                    cb(err)
                }
                else if (result.length){

                    updatedUserDetails = result && result[0]||null;

                    response=1;
                    cb(null,result);
                }
                else{
                    response=0;
                    cb()

                }
            });
        },
        createId:['checkFbid',function (err,cb) {
            //validations
            if (response == 0) {

                var criteria = {
                    googleId: payloadData.googleId,
                    name:payloadData.name,
                    //appVersion: payloadData.appVersion,
                    deviceToken: payloadData.deviceToken,
                    deviceType: payloadData.deviceType,
                    language: payloadData.language,
                    googleImageUrl:payloadData.googleImageUrl,
                    'profilePicURL.original':payloadData.googleImageUrl
                };

                /*cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.FACEBOOK_ID_NOT_FOUND);*/
                Service.UserServices.createUser(criteria, function (err, result1) {

                    if (err){
                        cb(err);
                    }
                    else {
                        successLogin = true;
                        updatedUserDetails=result1;

                        cb(null,datatosend);
                    }
                })

            }
            else {

                var criteria = {
                    _id: updatedUserDetails._id
                };
                var setQuery = {
                    //appVersion: payloadData.appVersion,
                    deviceToken: payloadData.deviceToken,
                    deviceType: payloadData.deviceType,
                    language: payloadData.language,
                    googleImageUrl:payloadData.googleImageUrl
                };
                Service.UserServices.updateUser(criteria, setQuery, {lean: true}, function (err, data) {
                    if (err){
                        callback(err)
                    }else {
                        updatedUserDetails = data;



                        cb(null,data);
                    }

                });
            }

        }],
        generateToken:['createId','checkFbid' ,function (err,cb) {
            var id_get=null;
            if(response===0)
                id_get=updatedUserDetails._id;
            else
                id_get = updatedUserDetails._id;

            var tokenData = {
                id:id_get,
                type: UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.USER_ROLES.CUSTOMER
            };
            TokenManager.setToken(tokenData, function (err, output) {
                if (err) {
                    cb(err);
                } else {
                    if (output && output.accessToken) {
                        accessToken = output && output.accessToken;

                        updatedUserDetails.accessToken=accessToken;
                        cb(null);
                    } else {
                        cb(err)
                    }
                }
            })
        } ],


    }, function (err, result3) {
        if(err)
        {
            callback(err)
        }
        else{
            callback(null,
                updatedUserDetails)
        }


    });
};

var temp=function (user,data,delete1,cb) {
    var flag=0;
    var _ = require('lodash');
    var a1=user;
    var b1=data;
    if(_.isEqual(a1, b1))
    {
         flag=1;
        cb(null,flag);
    }
else{
    cb(null,flag);
}}

var followSeller=function (payloadData,userData,callback) {
    var flag=0;
    var follow_id;
    var totalFollow;
    async.auto({
                checkUser:function (cb) {
                    flag=0;

                    var criteria={
                        _id: payloadData.sellerId,
                    }
                    var options = {
                        new: true
                    };
                    var projection={
                        totalFollow:1,
                        followedBy:1
                    }
                    Service.SellerServices.getSeller(criteria, projection,options, function (err, data) {
                        if(err)
                            cb(err)
                        else {
                            if (data.length && data[0].followedBy.length) {
                                totalFollow=data[0].totalFollow;

                                var len=data[0].followedBy.length;
                                var j=0
                                for (var i = 0; i < len; i++) {
                                    (function (i){

                                        if ((JSON.stringify(userData._id) == JSON.stringify(data[0].followedBy[i].follower) ) && (JSON.stringify(data[0].followedBy[i].is_delete) == 0))
                                        {
                                            follow_id=data[0].followedBy[i]._id;
                                            flag = 1;
                                        }
                                        else if ((JSON.stringify(userData._id) == JSON.stringify(data[0].followedBy[i].follower) ) && (JSON.stringify(data[0].followedBy[i].is_delete) == 1))
                                        {
                                            follow_id=data[0].followedBy[i]._id;
                                            flag = 2;
                                        }
                                        else{
                                            flag=0;
                                        }

                                        if (i== (len-1)){
                                            cb(null)
                                        }

                                    }  (i))
                                }

                              //  cb(null)
                        }
                        else {
                            cb(null)
                            }
                    }});
                },

            follow:['checkUser',function (err,cb) {


                if(flag==0)
                {
                var criteria = {
                    _id: payloadData.sellerId
                }

                var followedBy = {
                    follower: userData._id,
                }
                var setQuery = {
                    $inc: {
                        totalFollow: 1
                    },
                    $push: {
                        followedBy: followedBy
                    }
                };
                var options = {
                    new: true
                };
                Service.SellerServices.updateSeller(criteria, setQuery, options, function (err, data) {

                    if (err)
                        cb(err);
                    else {
                        totalFollow=data.totalFollow;
                        cb();
                    }
                });
            }
            else if(flag==2)
                {
                    var criteria = {
                        _id: payloadData.sellerId,
                        'followedBy._id':follow_id
                    }
                    var setQuery = {
                        $inc: {
                            totalFollow: 1
                        },
                            "followedBy.$.is_delete":0,

                    };
                    var options = {
                        new: true
                    };

                    Service.SellerServices.updateSeller(criteria, setQuery, options, function (err, data) {
                        if (err)
                            cb(err);
                        else {
                            totalFollow = data.totalFollow;
                            cb();
                        }
                    });

                }
                else{
                    cb()
                }

                }],

            createActivity:['follow',function (err,cb) {
                    if(flag==0 || flag==2)
                    {
                var criteria={
                    userId:userData._id,
                    text:"follow",
                    secondId: payloadData.sellerId,
                    idType:Config.APP_CONSTANTS.DATABASE.USER_ROLES.SELLER
                };
                Service.UserServices.createActivity(criteria,function (err,result) {
                    if(err)
                        cb(err)
                    else
                        cb(null)
                });

                    }
                else{
                    cb(null)
                    }}]

        },
        function (err,result) {
        if(err)
        {
            callback(err)
        }
        else{
            callback(null,{totalFollow:totalFollow})
        }
        })
};
var followUser=function (payloadData,userData,callback) {
    var flag=0;
    var follow_id;
    var totalFollow;
    async.auto({
            checkUser:function (cb) {
                flag=0;
                var criteria={
                    _id: payloadData.userId,
                }
                var options = {
                    new: true
                };
                var projection={
                    followedBy:1,
                    totalFollowedBy:1
                }
                Service.UserServices.getUsers(criteria, projection,options, function (err, data) {


                    if(err)
                        cb(err)

                    else {
                        if (data.length && data[0].followedBy.length) {
                            totalFollow=data.totalFollowedBy;
                            var len=data[0].followedBy.length;
                            var j=0
                            for (var i = 0; i < len; i++) {
                                (function (i){

                                    if ((JSON.stringify(userData._id) == JSON.stringify(data[0].followedBy[i].follower) ) && (JSON.stringify(data[0].followedBy[i].is_delete) == 0))
                                    {
                                        follow_id=data[0].followedBy[i]._id;
                                        flag = 1;
                                    }
                                    else if ((JSON.stringify(userData._id) == JSON.stringify(data[0].followedBy[i].follower) ) && (JSON.stringify(data[0].followedBy[i].is_delete) == 1))
                                    {
                                        follow_id=data[0].followedBy[i]._id;
                                        flag = 2;
                                    }
                                    else{
                                        flag=0;
                                    }

                                    if (i== (len-1)){
                                        cb(null)
                                    }

                                }  (i))
                            }
                            //  cb(null)
                        }
                        else {
                            cb(null)
                        }
                    }});
            },

            followBy:['checkUser',function (err,cb) {
                if(flag==0)
                {
                    var criteria = {
                        _id: payloadData.userId
                    }
                    /* var followedBy = {
                     follower: userData._id
                     }*/
                    var followedBy = {
                        follower: userData._id,
                    }
                    var setQuery = {
                        $inc: {
                            totalFollowedBy: 1
                        },
                        $push: {
                            followedBy: followedBy
                        }
                    };
                    var options = {
                        new: true
                    };
                    Service.UserServices.updateUser(criteria, setQuery, options, function (err, data) {

                        if (err)
                            cb(err);
                        else
                        {
                            totalFollow=data.totalFollowedBy;
                            cb(null);
                        }


                    });

                }
                else if(flag==2)
                {
                    var criteria = {
                        _id: payloadData.userId,
                        'followedBy._id':follow_id
                    }
                    var setQuery = {
                        $inc: {
                            totalFollowedBy: 1
                        },
                        "followedBy.$.is_delete":0,

                    };
                    var options = {
                        new: true
                    };

                    Service.UserServices.updateUser(criteria, setQuery, options, function (err, data) {
                        if (err)
                            cb(err);
                        else
                        {
                            totalFollow=data.totalFollowedBy;
                            cb(null);
                        }


                    });

                }
                else{
                    cb()}

            }],
        followingUpdate:['followBy',function(err,cb)
        {
            if(!flag==1)
            {

                var criteria = {
                    _id:userData._id
                }


                var setQuery = {
                    $inc: {
                        totalFollowing: 1
                    },

                };
                var options = {
                    lean: true
            }
                Service.UserServices.updateUser(criteria, setQuery, options, function (err, data) {
                    if (err)
                        cb(err);
                    else
                        cb(null,data);

                });
                }else
                    {   cb(null)}
        }],

       createActivity:['followingUpdate',function (err,cb) {

           if(flag==0 || flag==2)
           {
           var criteria = {
               userId: userData._id,
               text: "follow",
               secondId: payloadData.userId,
               idType: Config.APP_CONSTANTS.DATABASE.USER_ROLES.CUSTOMER
           };
           Service.UserServices.createActivity(criteria, function (err, result) {
               if (err)
                   cb(err)
               else
                   cb(null)
           });
       }
            else{cb(null)}}]
        },
        function (err,result) {
            if(err)
            {
                callback(err)
            }
            else{
                callback(null,{totalFollow:totalFollow})
            }
        })
};
var likeProduct=function (payloadData,userData,callback) {
    var flag=0;
    var Likes_id;
    var likes;
    async.auto({
            checkUser:function (cb) {
                flag=0;

                var criteria={
                    _id: payloadData.productId,
                }
                var options = {
                    new: true
                };
                var projection={

                }
                Service.ProductService.getProduct(criteria, projection,options, function (err, data) {

                    if(err)
                        cb(err)
                    else {

                        if (data.length && data[0].Likes.length) {
                            likes= data[0].totalLikes;

                            var len=data[0].Likes.length;
                            var j=0
                            for (var i = 0; i < len; i++) {
                                (function (i){

                                    if ((JSON.stringify(userData._id) == JSON.stringify(data[0].Likes[i].likeBy) ) && (JSON.stringify(data[0].Likes[i].is_delete) == 0))
                                    {
                                        Likes_id=data[0].Likes[i]._id;
                                        flag = 1;
                                    }
                                    else if ((JSON.stringify(userData._id) == JSON.stringify(data[0].Likes[i].likeBy) ) && (JSON.stringify(data[0].Likes[i].is_delete) == 1))
                                    {
                                        Likes_id=data[0].Likes[i]._id;
                                        flag = 2;
                                    }
                                    else{
                                        flag=0;
                                    }

                                    if (i== (len-1)){
                                        cb(null)
                                    }

                                }  (i))
                            }

                        }
                        else {
                            cb(null)
                        }
                    }});
            },

            likes:['checkUser',function (err,cb) {
                if(flag==0)
                {
                    var criteria = {
                        _id: payloadData.productId
                    }
                    /* var followedBy = {
                     follower: userData._id
                     }*/
                    var Likes = {
                        likeBy: userData._id,
                    }
                    var setQuery = {
                        $inc: {
                            totalLikes: 1
                        },
                        $push: {
                            Likes: Likes
                        }
                    };
                    var options = {
                        new: true
                    };
                    Service.ProductService.updateProduct(criteria, setQuery, options, function (err, data) {
                        if (err)
                            cb(err);
                        else

                            cb(null,data.totalLikes);

                    });
                }
                else if(flag==2)
                {
                    var criteria = {
                        _id: payloadData.productId,
                        'Likes._id':Likes_id
                    }
                    var setQuery = {
                        $inc: {
                            totalLikes: 1
                        },
                        "Likes.$.is_delete":0,

                    };
                    var options = {
                        new: true
                    };

                    Service.ProductService.updateProduct(criteria, setQuery, options, function (err, data) {
                        if (err)
                            cb(err);
                        else
                            cb(null,data.totalLikes);

                    });

                }
                else{
                    cb(null,likes)
                }

            }],

        createActivity:['likes',function (err,cb) {
            if(flag==0 || flag==2) {
                var criteria = {
                    userId: userData._id,
                    text: "like",
                    secondId: payloadData.productId,
                    idType: Config.APP_CONSTANTS.DATABASE.USER_ROLES.PRODUCT
                };
                Service.UserServices.createActivity(criteria, function (err, result) {
                    if (err)
                        cb(err)
                    else
                        cb(null)
                });

            }
            else {
                cb(null)
            }}]
        },
        function (err,result) {
            if(err)
            {
                callback(err)
            }
            else{
                callback(null,result)
            }
        })
};
var dislikeProduct=function (payloadData,userData,callback) {
        var likes;
    var dislikeStatus;
            async.auto({
                checkDislike:function (cb) {
                var criteria={
                    _id:payloadData.productId,
                    //'Likes.Likes':userData._id,
                }
                var projection = {
                    totalLikes:1,
                    Likes: {
                        $elemMatch: {
                            'likeBy': userData._id,
                            'is_delete':'0'
                        }
                    }
                };
                var option = {
                    lean: true
                };
                Service.ProductService.getProduct(criteria, projection, option,function (err, result) {
                    if (err) {
                        cb(err)
                    } else {
                        likes=result[0].totalLikes;
                        if(result[0].Likes)
                            dislikeStatus='1';
                        else
                            dislikeStatus='0';

                        cb()
                    }
                })
            },
                    disLike: ['checkDislike',function (err,cb) {
                        if(payloadData.productId && (dislikeStatus=='1'))
                        {
                            var criteria = {
                                _id:payloadData.productId,
                                'Likes.likeBy':userData._id,
                                //"followedBy._id":payloadData.followId
                            }
                            var dataToUpdate={
                                $inc: {
                                    totalLikes: -1
                                },
                                'Likes.$.is_delete':1,
                                /*"elemMatch": {
                                 "followedBy.$.is_delete":1,
                                 }*/

                                // 'followedBy.is_delete':1
                            }
                            var options = {
                                new: true
                            };

                            Service.ProductService.updateProduct(criteria, dataToUpdate, options, function (err, data) {

                                if (err)
                                    cb(err);
                                else
                                {
                                    likes=data.totalLikes;
                                    cb();
                                }


                            });
                        }
                        else
                        {

                            cb()
                        }
                    }],

                },
                function (err,result) {
                    if(err)
                    {
                        callback(err)
                    }
                    else{
                        callback(null,{likes:likes})
                    }
                })
        };

var countFollowForUser=function (payloadData,userData,callback) {

    async.auto({

            follow: function (cb) {
                var criteria = {
                    'followedBy.follower':userData._id,
                    'followedBy.is_delete':0
                }
                var options = {
                    new: true
                };
                var projection={
                    _id:1
                }
                Service.UserServices.getUsers(criteria, options, function (err, data) {

                    if (err)
                        cb(err);
                    else
                        cb(null);

                });
            },

        },
        function (err,result) {
            if(err)
            {
                callback(err)
            }
            else{
                callback(null,result)
            }
        })
};

var item_store_activity=function (payloadData,userData,callback) {

var dataToSend=null;
    var pageNo=null;

    async.auto({

        userInfo: function (cb) {
            var criteria = {
                _id: payloadData.userId
            }
            var options = {
                new: true
            };
            var projection = {};
            Service.UserServices.getUsers(criteria,  projection, options,function (err, data) {
                if (err)
                    cb(err);
                else {
                    cb(null);
                }
            });
        },
        //all product which are liked by User

        getItem: function (cb) {

            if (UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.USER_GET_TYPE.ITEMS ==payloadData.Type) {
                var criteria = {
                    'Likes.likeBy': payloadData.userId,
                    'Likes.is_delete': 0
                };

                var options = {
                    lean: true,
                    sort: { 'timestamp': -1 },
                    skip:payloadData.pageNo*3,
                    limit:3
                };

                var projection = {};

                Service.ProductService.getProduct(criteria,  projection, options,function (err, data) {

                    if (err)
                        cb(err);
                    else {

                        if(data.length)
                        {
                            dataToSend = data;
                            cb()
                        }
                        else {

                            callback(null,{data,pageNo:pageNo});
                        }

                    }
                });
            }

        else {
            cb(null)
            }
    },
//all the store which are followed by the user

        getStore: function (cb) {
            if (UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.USER_GET_TYPE.STORES == payloadData.Type) {

                var criteria = {
                    'followedBy.follower':payloadData.userId,
                    'followedBy.is_delete':0
                }
                var options = {
                    lean: true,
                    sort: { 'registrationDate': -1 },
                    skip:payloadData.pageNo*3,
                    limit:3
                };
                var projection = {

                }
                Service.SellerServices.getSeller(criteria, projection,options, function (err, data) {

                    if (err){
                        cb(err);
                    }

                    else {
                        /*dataToSend=data;
                        cb(null);*/
                        if(data.length)
                        {
                            dataToSend = data;
                            cb()
                        }
                        else {

                            callback(null,{data,pageNo:pageNo});
                        }

                    }
                });
            }
            else {
                cb(null)
            }
            /*else
                cb(null)*/
        },



    },function (err,result) {
      if(err)
          callback(err);
        else
      {
          var pageNo=parseInt(payloadData.pageNo)+1;
          callback(null,{data:dataToSend,pageNo:pageNo})
      }


    });
};

    var getForData=function (idType,secondId,cb) {
        var datasend={};
        datasend.pic = {
            original: null,
            thumbnail: null
        };
       // datasend.name="";
        if(idType==Config.APP_CONSTANTS.DATABASE.USER_ROLES.PRODUCT) {
                var criteria = {
                    _id: secondId,
                }
                var projection = {
                   /* _id: 1,
                    defaultImage: 1,
                    productName: 1*/
                }
                var option = {
                    lean: true
                }

                Service.ProductService.getProduct(criteria, projection, option, function (err, data) {

                    if(err)
                        cb(err)
                    else {
                        datasend.name=data[0].productName,
                            datasend._id=data[0]._id,
                            datasend.pic.original=data[0].defaultImage.original,
                                datasend.pic.thumbnail=data[0].defaultImage.thumbnail,


                        cb(null,datasend)
                    }
                });
            }

            else if (idType==Config.APP_CONSTANTS.DATABASE.USER_ROLES.CUSTOMER)
                 {
                 var criteria = {
                         _id:secondId,
                 }
                 var projection = {

                 }
                 var option = {
                         lean: 1
                 }

                 Service.UserServices.getUsers(criteria, projection, options, function (err, data) {

                 if(err)
                     cb(err)
                 else {
                     datasend._id=data[0]._id;
                         datasend.pic.original=data[0].profilePicURL.original;
                         datasend.pic.thumbnail=data[0].profilePicURL.thumbnail;
                    // datasend.pic=data[0].profilePicURL;
                         datasend.name=data[0].name;
                     cb(null,datasend)

                 }
                 });
             }
             else if (idType==Config.APP_CONSTANTS.DATABASE.USER_ROLES.SELLER)
                 {
                 var criteria = {
                            _id:secondId,
                     }
                 var projection = {

                    }
                 var options = {
                    lean : true
                     }

                 Service.SellerServices.getSeller(criteria, projection, options, function (err, data) {
                    if(err)
                    cb(err)
                    else {
                             datasend._id=data[0]._id,
                                 datasend.pic=data[0].profilePicURL,
                                 datasend.name=data[0].storeName,
                                 cb(null,datasend)
                 }
                 });
                 }

              else{
                 cb(null)
                 }
    }
var  getUserActivity=function (payloadData,userData,callback) {
    var dataToSend=[];
    var activityData;
    var pageNo=null;
    async.auto({
        userInfo: function (cb)  {
            var criteria = {
                userId: userData._id,
               // idType:Config.APP_CONSTANTS.DATABASE.USER_ROLES.PRODUCT,
                //utcTime:payloadData.showtime,
            };
            var options = {
                sort: { 'time': -1 },
                skip:payloadData.pageNo*20,
                limit:20
            };
            var projection = {};
            Service.UserServices.getActivity(criteria,  projection, options,function (err, data) {
                if (err)
                    cb(err);
                else {

                    if(data.length)
                    {
                        activityData=data;
                        cb(null);
                    }
                    else {
                        callback(null,{data,pageNo})
                    }
                }
            });
        },
        activityInfo:['userInfo',function (err,cb) {

            var len =activityData.length;
            for(var i=0;i<len;i++) {
                (function (i) {
                    getForData(activityData[i].idType, activityData[i].secondId, function (err, data) {
                        if (err)
                            cb(err)
                        else {
                            var a = moment();
                            var b = moment(activityData[i].time);
                            var timeToShow=a.diff(b);

                            dataToSend[i]=data;
                            dataToSend[i].activeData=activityData[i];
                            dataToSend[i].timeToShow=timeToShow;
                            if (i == len - 1) {
                                cb(null)
                            }
                        }

                    });
                }(i))

            }  } ] },function (err,result) {
        if(err)
            callback(err);
        else
        {
            pageNo=parseInt(payloadData.pageNo)+1;
            callback(null,{dataToSend,pageNo});
        }

    });
};

var  getGlobalActivity=function (payloadData,userData,callback) {

    var dataToSend=[];
    var activityData;
    var pageNo=null;
    async.auto({

        getActivity: function (cb)  {
            var criteria = {

            }
            var options = {
                sort: { 'time': -1 },
                skip:payloadData.pageNo*20,
                limit:20
            };
            var projection = {
               // _id:1
                //userId:1
            };
            var populate=[
                {
                    path:'userId',
                    match:{},
                    select:"name profilePicURL ",
                    options: {}
                },
            ];
            Service.UserServices.getActivityPopulate(criteria,  projection, options,populate,function (err, data) {
                if (err)
                    cb(err);
                else {
                    if(data.length)
                    {
                        activityData=data;
                        cb();
                    }
                    else {
                        callback(null, {data, pageNo})
                    }
                }
            });
        },
     /*   getUser: [function (cb)  {
            var criteria = {

            };
            var projection={

            };
            var options={
                lean:true
            };
            var populate=[
                {
                    path:'Users',
                    match:{},
                    select:"profilePicURL name  ",
                    options: {}
                }];
            Service.UserServices.getRides(criteria,projection,options,populate,function (err,result) {
                if(err){
                    callback(err);
                }
                else {
                    data.rideDetails = result;
                    data.count=result.length;
                    cb(null)
                }
            });


    }],*/

        activityInfo:['getActivity',function (err,cb) {
            var len =activityData.length;
            for(var i=0;i<len;i++) {
                (function (i) {
                    getForData(activityData[i].idType, activityData[i].secondId, function (err, data) {
                        if (err)
                            cb(err)
                        else {
                            var a = moment();
                            var b = moment(activityData[i].time);
                            var timeToShow=a.diff(b);
                            dataToSend[i]=data;
                            dataToSend[i].activeData=activityData[i];
                            dataToSend[i].timeToShow=timeToShow;

                            if (i == len - 1) {
                                cb(null)
                            }
                        }
                    });
                }(i))
            }  } ]
    },function (err,result) {
        if(err)
            callback(err);
        else{
             pageNo=parseInt(payloadData.pageNo)+1;
            callback(null,{dataToSend,pageNo});
        }

    });
};
var  getFriendsActivity=function (payloadData,userData,callback) {

    var dataToSend=[];
    var activityData;
    var friends=[];
    var pageNo=null;
    async.auto({
        getFriendId:function (cb)  {
            var criteria = {
                followedBy: {
                    $elemMatch: {
                        'follower': userData._id,
                        'is_delete':'0'
                    }
                }
            }
            var options = {

            };
            var projection = {
               _id:1
            };

            Service.UserServices.getUsers(criteria,  projection, options,function (err, data) {
                if (err)
                    cb(err);
                else {
                   // friends=data;
                    for(var i =0;i<data.length;i++)
                    {
                        friends.push(data[i]._id)

                    }

                    cb()
                }
            });
        },


        getActivity: ['getFriendId',function (err,cb)  {
            var criteria = {
                userId:{
                    $in:friends
                }
            }
            var options = {
                sort: { 'time': -1 },
                skip:payloadData.pageNo*20,
                limit:20
            };
            var projection = {
                // _id:1
                //userId:1
            };
            var populate=[
                {
                    path:'userId',
                    match:{},
                    select:"name profilePicURL ",
                    options: {}
                },
            ];
            Service.UserServices.getActivityPopulate(criteria,  projection, options,populate,function (err, data) {

                if (err)
                    cb(err);
                else {
                    if(data.length)
                    {
                        activityData=data;
                        cb();
                    }
                    else {
                        callback(null, {data , pageNo})
                    }
                }
            });
        }],


        activityInfo:['getActivity','getFriendId',function (err,cb) {
            var len =activityData.length;
            for(var i=0;i<len;i++) {
                (function (i) {
                    getForData(activityData[i].idType, activityData[i].secondId, function (err, data) {
                        if (err)
                            cb(err)
                        else {
                            var a = moment();
                            var b = moment(activityData[i].time);
                            var timeToShow=a.diff(b);
                            dataToSend[i]=data;
                            dataToSend[i].activeData=activityData[i];
                            dataToSend[i].timeToShow=timeToShow;

                            if (i == len - 1) {
                                cb(null)
                            }
                        }
                    });
                }(i))
            }  } ]
    },function (err,result) {
        if(err)
            callback(err);
        else{
            pageNo=parseInt(payloadData.pageNo)+1;
            callback(null,{dataToSend,pageNo});
        }

    });
};

var shareProduct=function (payloadData,userData,callback) {
    async.auto([
            function (cb) {
                if(payloadData.productId)
                {
                    var criteria = {
                        _id:payloadData.productId,
                    }
                    var dataToUpdate={
                        $inc: {
                            share: 1
                        },
                    }
                    var options = {
                        new: true
                    };

                    Service.ProductService.updateProduct(criteria, dataToUpdate, options, function (err, data) {
                        if (err)
                            cb(err);
                        else
                            cb();
                    });
                }
                else
                {
                    cb()
                }
            },

        ],
        function (err,result) {
            if(err)
            {
                callback(err)
            }
            else{
                callback(null,result)
            }
        })
};
var getUserDetails=function (payloadData,userData,callback) {
    var dataToSend={};
    async.auto({
           userDetail: function (cb) {
                if (payloadData.userId == userData._id) {
                    dataToSend = userData;
                    if(dataToSend.facebookImageUrl != null && dataToSend.profilePicURL.original==null)
                        dataToSend.profilePicURL.original=userData.facebookImageUrl;
                    else if(dataToSend.googleImageUrl != null && dataToSend.profilePicURL.original==null)
                        dataToSend.profilePicURL.original=userData.googleImageUrl;

                    cb();
                }
                else if (payloadData.userId) {
                    var criteria = {
                        _id: payloadData.userId,
                    }
                    var projection = {};
                    var options = {
                        lean: true
                    };
                    Service.UserServices.getUsers(criteria, projection, options, function (err, data) {

                        if (err)
                            cb(err);
                        else {
                            dataToSend = data[0];
                            if(dataToSend.facebookImageUrl != null && dataToSend.profilePicURL.original==null)
                             dataToSend.profilePicURL.original=dataToSend.facebookImageUrl;
                            else if(dataToSend.googleImageUrl != null && dataToSend.profilePicURL.original==null)
                                dataToSend.profilePicURL.original=dataToSend.googleImageUrl;
                            cb();
                        }
                    });
                }
                else {
                    cb()
                }
            },
            followStatus:['userDetail',function (err,cb) {

                var criteria={
                    _id: payloadData.userId,
                }
                var projection = {
                    followedBy: {
                        $elemMatch: {
                            'follower': userData._id,
                            'is_delete':'0'
                        }
                    }
                };
                var option = {
                    new: true
                };
                Service.UserServices.getUsers(criteria, projection, option,function (err, result) {
                    if (err) {
                        cb(err)
                    } else {

                        if((result[0].followedBy).length)
                        {


                            dataToSend.followStatus='1';
                        }

                        else
                        {
                            dataToSend.followStatus='0';
                        }


                        cb()
                    }
                })
            }],

        },
        function (err,result) {
            if(err)
            {
                callback(err)
            }
            else{
                callback(null,dataToSend)
            }
        })
};

var unfollowSeller=function (payloadData,userData,callback) {
    var totalFollow;
    var unfollowStatus;
    async.auto({
            checkunFollow:function (cb) {
                var criteria={
                    _id : payloadData.sellerId,

                    //'Likes.Likes':userData._id,
                }
                var projection = {
                    totalFollow:1,
                    followedBy: {
                        $elemMatch: {
                            'follower': userData._id,
                            'is_delete':'0'
                        }
                    }
                };
                var option = {
                    lean: true
                };
                Service.SellerServices.getSeller(criteria, projection, option,function (err, result) {
                    if (err) {
                        cb(err)
                    } else {
                        totalFollow=result[0].totalFollow;
                        if(result[0].followedBy)
                            unfollowStatus='1';
                        else
                            unfollowStatus='0';

                        cb()
                    }
                })
            },
            unfollow: ['checkunFollow',function (err,cb) {
                if(payloadData.sellerId && (unfollowStatus=='1'))
                {
                    var criteria = {
                        _id:payloadData.sellerId,
                          'followedBy.follower':userData._id,
                        //"followedBy._id":payloadData.followId
                    }
                    var dataToUpdate={
                        $inc: {
                            totalFollow: -1
                        },
                      'followedBy.$.is_delete':1,

                        /*"elemMatch": {
                            "followedBy.$.is_delete":1,
                        }*/

                        // 'followedBy.is_delete':1

                    }
                var options = {
                    new: true
                };

                    Service.SellerServices.updateSeller(criteria, dataToUpdate, options, function (err, data) {

                    if (err)
                        cb(err);
                    else {

                        totalFollow = data.totalFollow;
                        cb(null, totalFollow);
                    }
                });
            }
            else
                {
                cb(null)
                }
            }],
        },
        function (err,result) {
            if(err)
            {
                callback(err)
            }
            else{
                callback(null,{totalFollow:totalFollow})
            }
        })
};


var unfollowUser=function (payloadData,userData,callback) {
    var totalFollow;
    var unfollowStatus;

    async.auto({

            checkunFollow:function (cb) {
                var criteria={
                    _id : payloadData.userId,

                    //'Likes.Likes':userData._id,
                }
                var projection = {
                    totalFollowedBy:1,
                    followedBy: {
                        $elemMatch: {
                            'follower': userData._id,
                            'is_delete':'0'
                        }
                    }
                };
                var option = {
                    lean: true
                };
                Service.UserServices.getUsers(criteria, projection, option,function (err, result) {
                    if (err) {
                        cb(err)
                    } else {
                        totalFollow=result[0].totalFollowedBy;
                        if(result[0].followedBy)
                            unfollowStatus='1';
                        else
                            unfollowStatus='0';
                        cb()
                    }
                })
            },
            unfollow: ['checkunFollow',function (err,cb) {
                if(payloadData.userId && (unfollowStatus=='1'))
                {
                    var criteria = {
                        _id:payloadData.userId,
                        'followedBy.follower':userData._id,
                        //"followedBy._id":payloadData.followId
                    }
                    var dataToUpdate={
                        $inc: {
                            totalFollowedBy: -1
                        },
                        'followedBy.$.is_delete':1,
                    }
                    var options = {
                        new: true
                    };

                    Service.UserServices.updateUser(criteria, dataToUpdate, options, function (err, data) {

                        if (err)
                            cb(err);
                        else{
                            totalFollow=data.totalFollowedBy;
                            cb(null);
                        }


                    });
                }
                else
                {
                    cb(null)
                }
            }],
        upadateFollowing:['unfollow',function (err,cb) {

            var criteria = {
                _id:userData._id,
            }
            var dataToUpdate={
                $inc: {
                    totalFollowing: -1
                },
            }
            var options = {
                new: true
            };

            Service.UserServices.updateUser(criteria, dataToUpdate, options, function (err, data) {

                if (err)
                    cb(err);
                else
                    cb(null);

            });
         }]
        },
        function (err,result) {
            if(err)
            {
                callback(err)
            }
            else{
                callback(null,{totalFollow:totalFollow})
            }
        })
};

var getResetPasswordToken = function (email, callback) {
    var generatedString = UniversalFunctions.generateRandomString();
    var customerObj = null;
    if (!email) {
        callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    } else {
        async.series([
            function (cb) {
                //update user
                var criteria = {
                    email: email
                };
                var setQuery = {
                    password: UniversalFunctions.CryptData(generatedString)
                };
                Service.UserServices.updateUser(criteria, setQuery, {new: true}, function (err, userData) {

                    if (err) {
                        cb(err)
                    } else {

                        if (!userData || userData.length == 0) {

                            cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.NOT_FOUND);
                        } else {
                            customerObj = userData;
                            cb()
                        }
                    }
                })
            },
            function (cb) {

                var subject = "Password Confirmation";
                var content = "Here is your new Password for the Swimpy<br>";
                content += "Email : " + customerObj.email + " \n <br>";
                content += "Password : " +  generatedString  + " \n<br>";
                content += "Thank You <br>\n";
                content += "\n\n<br>";
                content += "Team Swimpy \n";
                UniversalFunctions.sendEmail(customerObj.email,subject,content,cb);

            }

        ], function (err, result) {
            if (err) {
                callback(err)
            } else {
                callback(null, {password:customerObj.password})//TODO Change in production DO NOT Expose the password
            }
        })
    }
};
var logoutUser = function (userData, callback) {
    if (!userData || !userData._id) {
        callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    } else {
        var userId = userData && userData._id || 1;

        async.series([
            function (cb) {
                //TODO Check Active Bookings Of Customer
                cb();
            },
            function (cb) {
                var criteria = {
                    _id: userId
                };
                var setQuery = {
                    $unset: {
                        accessToken: 1
                    }
                };
                var options = {};
                Service.UserServices.updateUser(criteria, setQuery, options, cb);
            }
        ], function (err, result) {
            callback(err, null);
        })
    }
};
var blockUnblockUser=function (payloadData, callback) {
    var data={};
    var setQuery={};
    async.auto([
        function (cb) {
        if(payloadData.blockUnblock=="block")
        {
            setQuery.isBlocked="true"
        }
        else {
            setQuery.isBlocked="false"
        }

            var criteria = {
                _id:payloadData.userId
            };
           /* var setQuery = {
                isBlocked:"true"
            };*/
            var option = {
                new: true
            };
            Service.UserServices.updateUser(criteria, setQuery, option, function (err, result) {
                if (err) {
                    cb(err)
                } else {
                    data = result;
                    cb()
                }
            })

        } ],function(err,result)
    {
        if(err)
            callback(err)
        else
            callback(null,data)
    })
};
var getAllUser=function (payloadData,userData,callback) {
    var pageNo=null;
    var data={};
    var dataLength=null;

    async.auto({
        getData:function (cb) {
            var criteria = {

            };
           var projection={

           };
            var option = {
                lean: true,
                skip:payloadData.pageNo*10,
                limit:10
            };
            Service.UserServices.getUsers(criteria, projection, option, function (err, result) {
                if (err) {
                    cb(err)
                } else {
                    if(result.length)
                    {
                        data = result;
                        cb()
                    }
                    else
                        callback(null,{result,pageNo})
                }
            })

        } ,
        getlength:function (cb) {
            var criteria = {

            };
            var projection={

            }
            var option = {
            };

            Service.UserServices.getUsers(criteria, projection, option, function (err, result) {
                if (err) {
                    cb(err)
                } else {
                    dataLength=result.length;

                        cb();
                }
            })


        },
    },function(err,result) {
        if (err)
            callback(err)
        else {
            var pageNo = parseInt(payloadData.pageNo) + 1;
            callback(null, {data, pageNo,dataLength})
        }
    }
    )
};
var addToCart=function (payloadData,userData,callback) {

    var dataLength=null;
    var flag;
    var dataToSend;

    async.auto({
            checkExist:function (cb) {
                var criteria = {
                    _id:userData._id,

                };
                var projection={

                    cart: {
                        $elemMatch: {
                            'productId': payloadData.productId,
                            'is_delete':'0',
                            'size':payloadData.variations,
                            'color':payloadData.color,
                        }
                    }
                };
                var option = {

                };
                Service.UserServices.getUsers(criteria, projection, option, function (err, result) {


                    if (err) {
                        cb(err)
                    } else {
                        if(result.length)
                        {

                            if(result[0].cart.length)
                            {  flag='1';
                                cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.ALREADY_EXIST)
                            }
                              else {
                                flag='0';
                                cb()
                            }
                        }
                        else{

                            flag='0';
                            cb()
                        }


                    }
                })
            } ,
            createCart:['checkExist',function (err,cb) {



                if(flag==0)
                {
                    var criteria = {
                        _id:userData._id,

                    };
                    var dataTopush={
                        $push:{
                            cart:{
                                productId: payloadData.productId,
                                size:payloadData.variations,
                                color:payloadData.color,
                            }
                        }
                    };
                    var projection={


                    };
                    var option = {
                        new:true
                    };


                    Service.UserServices.updateUser(criteria, dataTopush, option, function (err, result) {
                        if (err) {
                            cb(err)
                        } else {
                            dataToSend=result;

                            cb();
                        }
                    })
                }
                else
                {
                    cb();
                }

            }],
        },function(err,result) {
            if (err)
                callback(err)
            else {
                //var pageNo = parseInt(payloadData.pageNo) + 1;
                callback(null,dataToSend )
            }
        }
    )
};
var getCartDetails=function (userData,callback) {

    var dataLength=null;
    var flag;
    var dataToSend;
    var productData=[];
    var data1={};
    var dataTosend=[];

    async.auto({
            getCart:function (cb) {

                Models.Users.aggregate([
                    {$unwind: '$cart'},
                    {
                        $project: {
                            cart: 1
                            // messages: { $gt: [ "$messages.receiverId", one] },
                        }
                    },
                    {
                        $match: {
                            _id: userData._id,
                            'cart.is_delete':0,

                        }
                    }], function (err, result) {

                    if (err) {
                        cb(err)
                    }
                    else {
                        if(result.length)
                        {
                            data1 = result;

                            cb(null)
                        }
                        else {
                            callback(null,dataToSend)
                        }

                    }
                })
            },
        getProductDetail:['getCart',function (err,cb) {

            var len =data1.length;

            if(len)
            {
                for(var i=0;i<len;i++)
                {
                    (function (i) {

                                getDetails(data1[i].cart.productId,function (err,result) {

                                    if(err)
                                        cb(err)
                                    else {

                                        dataTosend.push({
                                            storeName :result.storeName,
                                            productDetails:result.dataToSend[0],
                                         cartData:data1[i].cart

                                         })
                                        /*dataTosend[i].data=result.dataToSend;
                                        dataToSend[i].storename=result.storeName;*/
                                        if(i==len-1)
                                            cb()

                                    }

                                })

                    }(i))
                }
            }
            else {
                cb()
            }

        }]
        

        },function(err,result) {
            if (err)
                callback(err)
            else {
                callback(null,dataTosend )
            }
        }
    )
};

var getDetails=function (productId,callback) {

    var dataToSend={};
    var storeName;
    async.auto({

        getData:function (cb) {
            var criteria={
                _id:productId
            };
            var projection={

            };
            var options={

            };
            Service.ProductService.getProduct(criteria,projection,options,function (err,result) {

                if(err)
                    cb(err)
                else {


                    dataToSend=result;

                    cb()
                }
            })
        },
        sellerDetails:['getData',function (err,cb) {
            var criteria={
                _id:dataToSend[0].createrId
            }
            var projection={
                _id:1,
                storeName:1
            }
            var options={

            }

            Service.SellerServices.getSeller(criteria,projection,options,function (err,result) {

                if(err)
                    cb(err)
                else {

                    storeName=result[0].storeName;
                    cb()
                }
            })
        }]
    },function (err,result) {
        if (err)
            callback(err)
        else {


            callback(null, {storeName:storeName,dataToSend:dataToSend})
        }
    })

};
var removeCart=function (payload,userData,callback) {
    var criteria={
        _id:userData._id,
        'cart._id':payload.cartId
    };
    var setQuery={
                'cart.$.is_delete':1,
       };

    var option={
        new :true
    };
    Service.UserServices.updateUser(criteria, setQuery, option, function (err, result) {
        if(err)
        {
            callback(err)
        }
            else {
                callback(null,result)
        }
    })


};
var on_off_notification=function (payloadData,userData, callback) {
    var data={};
    var setQuery={};
    async.auto([
        function (cb) {
            if(payloadData.blockUnblock=="off")
            {
                setQuery.notification='0'
            }
            else {
                setQuery.notification="1"
            }

            var criteria = {
                _id:userData._id
            };
            /* var setQuery = {
             isBlocked:"true"
             };*/
            var option = {
                new: true
            };
            Service.UserServices.updateUser(criteria, setQuery, option, function (err, result) {
                if (err) {
                    cb(err)
                } else {
                    data = result;
                    cb()
                }
            })

        } ],function(err,result)
    {
        if(err)
            callback(err)
        else
            callback(null,data)
    })
};
var changePassword=function (payloadData,userData, callback) {
    var data={};
    var setQuery={};
    async.auto([
        function (cb) {
            var criteria = {
                _id:userData._id
            };
             var setQuery = {
                 password:UniversalFunctions.CryptData(payloadData.newPassword)
             };
            var option = {
                new: true
            };
            Service.UserServices.updateUser(criteria, setQuery, option, function (err, result) {
                if (err) {
                    cb(err)
                } else {
                    data = result;
                    cb()
                }
            })

        } ],function(err,result)
    {
        if(err)
            callback(err)
        else
            callback(null,data)
    })
};
var  suggestion=function(payloadData,userData,callback)
{
    var data={};
    async.auto([
            function (cb) {

                var word=payloadData.text;

                var criteria={

                };
                criteria.productName=new RegExp(word, 'i');
                criteria.repostStatus='APPROVED';
                criteria.createrType='SELLER';
                criteria.isActive='1';


                var projection={
                        id:1,
                    productName:1
                };
                var option={
                    new:true
                };
                // {name: new RegExp('^'+payloadData.text+'$', "i")}
                Service.ProductService.getProduct(criteria,projection,option,function (err,result) {
                    if (err) {
                        cb(err)
                    } else {
                        data=result;
                        cb(null,result)
                    }
                })
            },
        ], function (err, res) {
            if (err) {
                callback(err);
            } else {
                callback(null,data);
            }
        }
    )
};
var  genrateOrder=function(payloadData,userData,callback)
{
    var data={};
    var id;
    async.auto({
           createOrder1: function (cb) {


             //   var word = payloadData.text;

                var criteria = {

                    buyerId:payloadData.buyerId,
                    addressId:payloadData.addressId,
                    title:payloadData.title,
                    sku:payloadData.sku,
                    netAmount:parseFloat(payloadData.netAmount)
                };

                var projection = {};
                var option = {new:true};

                Service.OrderService.createOrder(criteria, function (err, result) {

                    if (err) {
                        cb(err)
                    } else {
                        data = result;
                        id=result._id;
                        cb(null, result)
                    }
                })
            },
        updatDetails:['createOrder1', function (err,cb) {
            var len = payloadData.details.length;
            var temp=payloadData.details;

            for(let i =0;i<len;i++){
                (function(i){
                    let criteria = {_id:id};
                    let options = {new:true};
                    let setData = {
                        $push:{
                            details:{
                                productId:temp[i].productId,
                                price:temp[i].price,
                                quantity:temp[i].quantity,
                                shippingCost:temp[i].shippingCost,
                                name:temp[i].name || null,
                                sellerId:temp[i].sellerId,
                                supplierId:temp[i].supplierId,
                                'imageUrl.original':temp[i].originalImage,
                                'imageUrl.thumbnail':temp[i].thumbnailImage,
                            }
                        }
                    };
                    Service.OrderService.updateOrder(criteria,setData,options,function(err,result){
                        if(err){
                            cb(err)
                        }else{
                            if(i == (len -1)){
                                data=result
                                cb(null)
                            }
                        }
                    })
                }(i));
            }
        }],




        }, function (err, res) {
            if (err) {
                callback(err);
            } else {
                callback(null,data);
            }
        }
    )
};
var addAddress=function(payloadData,userData,callback) {
    var data1;
    async.auto({
        list: function (cb) {
            let query = {
                _id: userData._id
            }


            let setQuery = {
                $push: {
                    address: {
                        fullName: payloadData.fullName,
                        addressLine1: payloadData.addressLine1,
                        addressLine2: payloadData.addressLine2,
                        countryName: payloadData.countryName,
                        city: payloadData.city,
                        state: payloadData.city,
                        zipcode: payloadData.zipcode,
                        phoneNo: payloadData.phoneNo,
                        isDefault:payloadData.isDefault
                    }
                }
            };
            let options = {lean: true}
            Service.UserServices.updateUser(query, setQuery, options, function (err, data) {
                if (err) {
                    cb(err)
                }
                else {
                    cb(null)
                }
            })
        }
    }, function (err, result) {
        if (err) {
            callback(err)
        }
        else {
            callback(null, result)
        }
    })
};
var getAddress=function(userData,callback){
    var data1={};
    var address={};
    async.auto({
        list:function(cb){
            let query={
                _id:userData._id,
                //'address.isDeleted':false
            }
            let projection={
               // name:1,
                //address:1
                address: {
                    $elemMatch: {
                        'isDefault': true,
                        'isDeleted':false
                    }
                }
            }
            let options={lean:true}
            Service.UserServices.getUsers(query,projection,options,function(err,data){
                if(err){
                    cb(err)
                }
                else{
                  if(data[0].address)
                  {
                      data1=data[0].address[0];
                  }


                    cb(null)
                }
            })
        }
    },function(err,result){
        if(err){
            callback(err)
        }
        else{
            callback(null,data1)
        }
    })
};
const editAddress=function(payloadData,userData,callback){
    var data1;
    async.auto({
        update:function(cb){
            let query={
                _id:userData._id,
                address: { $elemMatch: { _id: payloadData.addressId }},
            }
            let setQuery={

                'address.$.fullName': payloadData.fullName,
                'address.$.addressLine1':payloadData.addressLine1,
                'address.$.addressLine2':payloadData.addressLine2,
                'address.$.countryName':payloadData.countryName,
                'address.$.city':payloadData.city,
                'address.$.state': payloadData.state,
                'address.$.zipcode':payloadData.zipcode,
                'address.$.phoneNo':payloadData.phoneNo,
                'address.$.isDefault':payloadData.isDefault,

            }
            let options={new:true}
            Service.UserServices.updateUser(query,setQuery,options,function(err,data){
                if(err){
                    cb(err)
                }
                else{
                    data1=data;
                    cb(null)
                }
            })
        }
    },function(err,result){
        if(err){
            callback(err)
        }
        else{
            callback(null,data1)
        }
    })
}
const userLogout=function(userData, cb) {
    var criteria = {
        _id: userData._id
    }
    var updatedData = {
        accessToken: null
    }
    Service.UsersService.updateUsers(criteria, updatedData, {lean: true}, function (err, result) {
        if (err) {

            cb(err);
        }
        else {
            cb(null, result)
        }
    })
};
var  searchAll=function(payloadData,userData,callback)
{
    var text=payloadData.text;
    var criteria={};
    var data=[];
    var value=payloadData.value;
    var dataTosend=[];

    async.auto({
            getDetails:function (cb) {
                if(payloadData.value=='item')
                {
                    criteria.productName=new RegExp(text, 'i');
                    criteria.repostStatus='APPROVED';
                    criteria.createrType='SELLER';
                    criteria.isActive='1';

                    var projection={
                        defaultImage:1,
                        totalLikes:1,
                        share:1,
                        productName:1,
                        description:1,
                        total_price:1,
                        base_price_unit:1
                    };
                    var option={
                        new:true,
                        sort:{timestamp:-1}
                    };
                    // {name: new RegExp('^'+payloadData.text+'$', "i")}
                    Service.ProductService.getProduct(criteria,projection,option,function (err,result) {
                        if (err) {
                            cb(err)
                        } else {
                            data=result;
                            //dataTosend=data

                            cb()
                        }
                    })
                }
                else if(payloadData.value=='store')
                {
                    criteria.storeName=new RegExp(text, 'i');
                    criteria.isBlocked='0';
                    var projection= {
                        storeName: 1,
                        details: 1,
                        coverPicURL: 1,
                        profilePicURL:1,
                        totalFollow:1
                    };
                    var option={
                        new:true
                    };
                    // {name: new RegExp('^'+payloadData.text+'$', "i")}
                    Service.SellerServices.getSeller(criteria,projection,option,function (err,result) {
                        if (err) {
                            cb(err)
                        } else {
                            data=result;
                            dataTosend=data;

                            cb()
                        }
                    })
                }
                else if(payloadData.value=='user')
                {
                    criteria.name=new RegExp(text, 'i');
                    criteria.isBlocked=false;

                    var projection={
                        name:1,
                        totalFollowedBy:1,
                        profilePicURL:1,
                        countryName:1
                    };
                    var option={
                        new:true
                    };
                    // {name: new RegExp('^'+payloadData.text+'$', "i")}
                    Service.UserServices.getUsers(criteria,projection,option,function (err,result) {
                        if (err) {
                            cb(err)
                        } else {
                            data=result;

                            cb()
                        }
                    })
                }

                else {
                    cb()
                }


            },
        checkfollow:['getDetails',function (err,cb) {
                if(payloadData.value=='user')
                {
                    var len=data.length;
                    for(var i=0;i<len;i++)
                    {
                        (function (i) {
                            getFollowStatus(data[i]._id,userData._id, function (err, data1) {

                                if(err)
                                    cb(err);
                                else
                                {
                                    dataTosend.push({
                                        countryName:data[i].countryName,
                                        name:data[i].name,
                                        totalFollowedBy:data[i].totalFollowedBy,
                                        profilePicURL:data[i].profilePicURL,
                                        followstatus:data1

                                    })

                                    if (i== (len-1)){
                                        cb(null)
                                    }
                                }
                            })


                        }(i));

                    }
                }
                else {
                    cb()
                }
        },],
            likedStatus:['getDetails',function (err,cb) {
                if(payloadData.value=='item')
                {
                    var len=data.length;
                    if(len)
                    {
                        for(var i=0;i<len;i++)
                        {
                            (function (i) {
                                checklikedStatus(data[i]._id,userData._id, function (err, data1) {

                                    if(err)
                                        cb(err);
                                    else
                                    {
                                        dataTosend.push({


                                            _id:data[i]._id,
                                            likeStatus:data1,
                                            defaultImage:data[i].defaultImage,
                                            totalLikes:data[i].totalLikes,
                                            share:data[i].share,
                                            productName:data[i].productName,
                                            description:data[i].description,
                                            total_price:data[i].total_price,
                                            base_price_unit:data[i].base_price_unit

                                        });

                                        if (i== (len-1)){
                                            cb(null)
                                        }

                                    }
                                })


                            }(i));

                        }
                    }
                    else {
                        cb()
                    }

                }
                else {
                    cb()
                }
            }],


}, function (err, res) {
            if (err) {
                callback(err);
            } else {

                callback(null,{data:dataTosend,value:value,text:text });
            }
        }
    )
};
var getFollowStatus=function (likeId,UserId,cb) {
    var followStatus=0;
    var criteria={
        _id:likeId,
    }
    var projection = {
        followedBy: {
            $elemMatch: {
                'follower': UserId,
                'is_delete':'0'
            }
        }
    };
    var option = {
        new: true
    };
    Service.UserServices.getUsers(criteria, projection, option,function (err, result) {
        if (err) {
            cb(err)
        } else {
            if((result[0].followedBy).length)
            { followStatus='1';
                cb(null,followStatus)
            }

            else
            {
                followStatus='0';
                cb(null,followStatus)
            }


        }
    })

};
var checklikedStatus=function (productId,UserId,cb) {
    var likeStatus=0;
    var criteria={
        _id:productId,
    }
    var projection = {
        Likes: {
            $elemMatch: {
                'likeBy': UserId,
                'is_delete':'0'
            }
        }
    };
    var option = {
        new: true
    };
    Service.ProductService.getProduct(criteria, projection, option,function (err, result) {

        if (err) {
            cb(err)
        } else {

            if((result[0].Likes).length)
            {

                likeStatus=1;
                cb(null,likeStatus)
            }

            else{
                likeStatus=0;

                cb(null,likeStatus)

            }

        }
    });
};
var filterProduct=function(payloadData,userData,callback)
{
    var criteria={};
    var data={};
    var sortData={};
    var pageNo=null;
    var flag =0;

    async.auto({
        getDetails: function (cb) {
                criteria.repostStatus='APPROVED';
                criteria.createrType='SELLER';
                criteria.isActive='1';

                if (payloadData.categoryId && payloadData.categoryId != '')
                    criteria.categoryId = payloadData.categoryId;
                if (payloadData.subcategoryId && payloadData.subcategoryId != '')
                    criteria.subcategoryId = payloadData.subcategoryId;
                if (payloadData.color && payloadData.color != '')
                    criteria.color = {$in:[payloadData.color]};
                if (payloadData.variations && payloadData.variations != '')
                criteria.variations ={$in:[payloadData.variations]};
                if (payloadData.popular && payloadData.popular != '')
                    sortData.totalLikes = -1;
                if (payloadData.new  && payloadData.new != '')
                    sortData.timestamp = -1;
                 if (payloadData.minPrice && payloadData.maxPrice  &&   payloadData.minPrice != '' && payloadData.maxPrice != '' )
                 {
                     criteria.total_price={
                         $gte:  payloadData.minPrice,
                         $lt:  payloadData.maxPrice}
                 }

                 if(payloadData.sort && payloadData.sort=='LH')
                 {
                     sortData.total_price = -1;
                 }
                if(payloadData.sort && payloadData.sort=='HT')
                {
                    sortData.total_price = 1;
                }

                var projection = {};


                var option = {
                    lean: true,
                    skip: payloadData.pageNo * 20,
                    limit: 20
                };

                // {name: new RegExp('^'+payloadData.text+'$', "i")}
                Service.ProductService.getSortFilterProduct(criteria, projection, option, sortData, function (err, result) {
                    if (err) {
                        cb(err)
                    } else {
                        if(result.length)
                        {
                            data = result;
                            cb()
                        }
                        else
                            callback(null,{data,pageNo:pageNo});
                    }
                })
            },

        likedStatus:['getDetails',function (err,cb) {
                var len=data.length;

                    for(var i=0;i<len;i++)
                    {
                        (function (i) {
                            checklikedStatus(data[i]._id,userData._id, function (err, data1) {

                                if(err)
                                    cb(err);
                                else
                                {
                                    data[i].likestatus=data1

                                    if (i== (len-1) ){
                                        cb(null)
                                    }

                                }
                            })



                        }(i));

                    }
        }],
        }, function (err, res) {
            if (err) {
                callback(err);
            } else {

                var pageNo=parseInt(payloadData.pageNo)+1;
                callback(null,{data,pageNo:pageNo});
            }
        }
    )
};

var setname=function (data,callback) {

    var user={};
    var got;
    async.waterfall([function (callback) {
           console.log(".......in controller........");
        if (data.name!= '')
            user.name = data.name;
        console.log("..........",user);
        callback(null);
    },
    function (callback) {
        console.log("...........calling  service........");
        Service.UserServices.createUser(user,function (err,info) {
            if(err)
                callback(err)
            else {
                got = info;
                console.log("...........coming back to controller.......", got,info);
                callback(null);
            }
            });
            }],
        function (err, res) {
        if (err) {
            callback(err);
        } else {

            callback(null,got);
        }
    })

};

var fetchname=function (data2,callback) {
    var data1;

    console.log("...........calling  service........");
            var criteria = {
                  name:data2.name
            };

            var projection = {};
            var option ={};
            Service.UserServices.getUsers(criteria,projection,option,function (err,info) {
                 if(err)
                     callback(err);
                 else
                 {data1=info;
                 callback(null,data1);}
            });
}


module.exports = {
    createUser: createUser,
    loginUsers:loginUsers,
    logoutUser:logoutUser,
    loginUserViaFacebook:loginUserViaFacebook,
    updateUser:updateUser,
    loginUserViaGoogle:loginUserViaGoogle,
    getResetPasswordToken:getResetPasswordToken,
    followSeller:followSeller,
    followUser:followUser,
    unfollowSeller:unfollowSeller,
    countFollowForUser:countFollowForUser,
    unfollowUser:unfollowUser,
    likeProduct:likeProduct,
    dislikeProduct:dislikeProduct,
    item_store_activity:item_store_activity,
    getGlobalActivity:getGlobalActivity,
    getUserActivity:getUserActivity,
    shareProduct:shareProduct,
    blockUnblockUser:blockUnblockUser,
    getUserDetails:getUserDetails,
    getAllUser:getAllUser,
    addToCart:addToCart,
    getCartDetails:getCartDetails,
    removeCart:removeCart,
    on_off_notification:on_off_notification,
    changePassword:changePassword,
    addAddress:addAddress,
    suggestion:suggestion,
    genrateOrder:genrateOrder,
    getAddress:getAddress,
    editAddress:editAddress,
    searchAll:searchAll,
    getFriendsActivity:getFriendsActivity,
    filterProduct:filterProduct,
    setname: setname,
    fetchname:fetchname

};