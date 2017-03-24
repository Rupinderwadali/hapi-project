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


var loginAdmin = function (payloadData, callback) {
    var adminFound = false;
    var accessToken = null;
    var successLogin = false;
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

var show=function (payloadData,callback) {
    var dataToSend={};
    async.waterfall([
            function(cb) {
                var criteria = {};
                var option = {
                    lean: true
                };
                var projection = {};
                var populatedAry = [
                    {
                        path: 'users.uid',
                        match: {},
                        select: {},
                        options: {}
                    }
                ];
                Service.AdminService.getplace(criteria, projection, option, populatedAry, function (err, result) {
                    if (err) {
                        cb(err)
                    } else {
                        dataToSend = result;
                        cb(null, result);
                    }
                });
            }
        ], function (err, data) {
            if (err) {
                callback(err);
            } else {
                callback(null,dataToSend);
            }
        }
    )
}

var filter=function (payloadData,callback) {
    console.log(".....pd....",payloadData);
    var dataToSend={};
    var criteria={};
    var match={}
    async.waterfall([

        //{$or:[{$and:[{"dob.year":1995},{"dob.month":{$lte:2}}]},{$and:[{"dob.year":1994},{"dob.month":{$gte:2}}]}]}
        // $and:[ {$or:[{$and:[{"dob.year":1995},{"dob.month":{$lte:2}}]},{$and:[{"dob.year":1994},{"dob.month":{$gte:2}}]}]},{"hobbies":"night out"}]
   
           function (callback) {
               var flagH=0;
               var flagG=0;
             if(payloadData.hobbies){
                 match.hobbies=payloadData.hobbies;
                  flagH=1;
               }
                if(payloadData.gender){
                   match.gender=payloadData.gender;
                   flagG=1;
               }
             if(payloadData.age){
                 var age=payloadData.age;
                 var d=new Date();
                 var yr=d.getFullYear()-age;
                 var mon=d.getUTCMonth()+1;
                 var date=d.getDate();
                 console.log(",,,,,,,",d,age,yr,mon,date);

                 if(flagH==1&&flagG==1)
                 match={$and:[ {$or:[{$and:[{"dob.year":yr},{"dob.month":{$lte:mon}}]},{$and:[{"dob.year":(yr-1)},{"dob.month":{$gte:mon}}]}]},{"hobbies":payloadData.hobbies},{"gender":payloadData.gender}]}
                 else if(flagH==1)
                 match={$and:[ {$or:[{$and:[{"dob.year":yr},{"dob.month":{$lte:mon}}]},{$and:[{"dob.year":(yr-1)},{"dob.month":{$gte:mon}}]}]},{"hobbies":payloadData.hobbies}]}
                 else if(flagG==1)
                 match={$and:[ {$or:[{$and:[{"dob.year":yr},{"dob.month":{$lte:mon}}]},{$and:[{"dob.year":(yr-1)},{"dob.month":{$gte:mon}}]}]},{"gender":payloadData.gender}]}            
                 else
                 match={$or:[{$and:[{"dob.year":yr},{"dob.month":{$lte:mon}}]},{$and:[{"dob.year":(yr-1)},{"dob.month":{$gte:mon}}]}]}
                } 
            
               
              
               if(payloadData.barName){
                   criteria.name=payloadData.barName;
               }

               console.log("..........",criteria,"...",match);
               callback(null);

           },

           function(cb) {
                var option = {
                    lean: true
                };
                var projection = {};
                var populatedAry = [
                    {
                        path: 'users.uid',
                        match: match,
                        select: {},
                        options: {}
                    }
                ];
                Service.AdminService.getplace(criteria, projection, option, populatedAry, function (err, result) {
                    if (err) {
                        cb(err)
                    } else {
                        dataToSend = result;
                        cb(null);
                    }
                });
            }
        ], function (err, data) {
            if (err) {
                callback(err);
            } else {
                callback(null,dataToSend);
            }
        }
    )
}


module.exports = {
    loginAdmin: loginAdmin,
    show:show,
    filter:filter
}