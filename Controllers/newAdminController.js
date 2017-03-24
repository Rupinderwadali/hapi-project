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
var fsExtra = require('fs-extra');
var Path = require('path');
var im = require('imagemagick');


var loginAdmin = function (payloadData, callback) {
    var adminFound = false;
    var accessToken = null;
    var successLogin = false;
    // var flushPreviousSessions = payloadData.flushPreviousSessions || false;
    var updatedAdminDetails = {};
    async.series([

        function (cb) {
            var criteria = {
                email: payloadData.email
            };
            var projection = {};
            var option = {
                lean: true
            };
            Service.AdminService.getAdmin(criteria, projection, option, function (err, result) {
                if (err) {
                    cb(err)
                } else {
                    adminFound = result && result[0] || null;
                    cb();
                }
            });
        },
        function (cb) {
            //validations
            if (!adminFound) {
                cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.EMAIL_NOT_FOUND);
            }
            else {
                if (adminFound && adminFound.password != UniversalFunctions.CryptData(payloadData.password)) {
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
                    id: adminFound._id,
                    type: UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.USER_ROLES.ADMIN
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
                _id: adminFound._id
            };
            var projection={};
            var options={};
            Service.AdminService.getAdmin(criteria,projection,options , function (err, data) {

                updatedAdminDetails = data;


                cb(err, updatedAdminDetails);
            });

        },

    ], function (err, data) {
        if (err) {
            callback(err);
        } else {
            callback(null,updatedAdminDetails);
        }
    });
};

var addCategory=function(payloadData, callback)
{

    var CategoryData=payloadData;
    CategoryData.categoryPicURL={};
    var adminData={};

    async.waterfall([

       function (callback) {

           console.log("........token...",payloadData.token);
         var criteria={
             accessToken:payloadData.token
         };
          var projection={};
          var options={};
          Service.AdminService.getAdmin(criteria,projection,options,function (err,info) {
              if(err)
                  callback(err);
              else
              {
                  console.log("........info...",info);
                  CategoryData.createrID=info._id;
                  console.log("........id...", CategoryData.createrID);
                  callback(null);
              }
          });
        },

        function (callback) {

            var finalpath = Path.resolve('./uploads/category/' + payloadData.name +payloadData.categoryPic.filename);
            console.log("finalpath...........",finalpath);
                CategoryData.categoryPicURL.original=finalpath;
            fsExtra.copy(payloadData.categoryPic.path, finalpath, function (err, data) {
                console.log("................done");
                if(err)
                    callback(err);
                else
                    callback(null);
            });
        },

        function (callback) {
            var finalpath = Path.resolve('./uploads/category/' +'_thumbnail_'+ payloadData.name +payloadData.categoryPic.filename);
            CategoryData.categoryPicURL.thumbnail=finalpath;
            im.resize({
                srcPath: payloadData.categoryPic.path,
                dstPath: finalpath,
                width:   256
            }, function(err){
                if (err) callback(err);
                console.log('resized image');
                callback(null);
            });

        },

        function (cb){

            Service.AdminService.addCategory(CategoryData,function (err,result) {
                if (err) {
                    if (err.code == 11000 ){
                        cb("CATEGORY ALREADY EXSIST");

                    } else {
                        cb(err)
                    }

                } else {
                    CategoryData=result;
                    console.log("..........cd.......",CategoryData);
                    callback(null)
                }
            });

        }

    ], function (err, result) {
        if (err) {
            callback(err);
        } else {
            callback(null, CategoryData);
        }
    })

};
module.exports = {
    loginAdmin: loginAdmin,
    addCategory: addCategory,
}