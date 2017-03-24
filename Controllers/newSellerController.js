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
var moment=require('moment');
var Models = require('../Models');

var createSeller=function (payloadData, callback) {

    var accessToken = null;
    var dataToSave = payloadData;
    dataToSave.address={};
    dataToSave.address.fullName=payloadData.fullName;
    dataToSave.address.addressLine1=payloadData.addressLine1;
    dataToSave.address.addressLine1=payloadData.addressLine2;
    dataToSave.address.city=payloadData.city;
    dataToSave.address.state=payloadData.state;
    dataToSave.address.countryName=payloadData.countryName;
    dataToSave.address.zipCode=payloadData.zipCode;
    dataToSave.address.PhoneNo=payloadData.phoneNo;

    if (dataToSave.password)
        dataToSave.password = UniversalFunctions.CryptData(dataToSave.password);
    var sellerData = null;

    async.series([
        function (cb) {
            //verify email address
            if (!UniversalFunctions.verifyEmailFormat(dataToSave.email)) {
                cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_EMAIL);
            } else {
                cb();
            }
        },

        /* function (cb) {
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
            Service.SellerService.createSeller(dataToSave, function (err, sellerDataFromDB) {
                if (err) {

                    if (err.code == 11000 && err.message.indexOf('customers.$phoneNo_1') > -1){
                        cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.PHONE_NO_EXIST);

                    } else if (err.code == 11000 ){
                        cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.EMAIL_ALREADY_EXIST);

                    }else {
                        cb(err)
                    }
                } else {
                    sellerData = sellerDataFromDB;
                    cb();
                }
            })
        },
        /* function (cb) {
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
         /*function (cb) {
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
                    id: sellerData._id,
                    type: UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.USER_ROLES.SELLER
                };
                TokenManager.setToken(tokenData, function (err, output) {
                    if (err) {
                        cb(err);
                    } else {
                        accessToken = output && output.accessToken || null;
                        sellerData.accessToken=accessToken;
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
            callback(null, sellerData);
        }
    });
};


var loginSeller = function (payloadData, callback) {
    var sellerFound = false;
    var accessToken = null;
    var successLogin = false;
    // var flushPreviousSessions = payloadData.flushPreviousSessions || false;
    var updatedSellerDetails = {};
    async.series([

        function (cb) {
            var criteria = {
                email: payloadData.email
            };
            var projection = {};
            var option = {
                lean: true
            };
            Service.SellerService.getSeller(criteria, projection, option, function (err, result) {
                if (err) {
                    cb(err)
                } else {
                    sellerFound = result && result[0] || null;
                    cb();
                }
            });
        },
        function (cb) {
            //validations
            if (!sellerFound) {
                cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.EMAIL_NOT_FOUND);
            }
            else {
                if (sellerFound && sellerFound.password != UniversalFunctions.CryptData(payloadData.password)) {
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
                    type: UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.USER_ROLES.SELLER
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
            Service.SellerService.getSeller(criteria,projection,options , function (err, data) {

                updatedSellerDetails = data;


                cb(err, updatedUserDetails);
            });

        },

    ], function (err, data) {
        if (err) {
            callback(err);
        } else {
            callback(null,updatedSellerDetails);
        }
    });
};

var addproducts=function (payloadData,callback) {

    var dataToSave={};

}


module.exports = {
    createSeller: createSeller,
    loginSeller: loginSeller
}