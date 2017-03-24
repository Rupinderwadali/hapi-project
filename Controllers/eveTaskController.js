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
var Path = require('path');
var im = require('imagemagick');
var fsExtra = require('fs-extra');
var nodemailer = require('nodemailer');

var addCity=function (payloadData, callback) {

    console.log("......",payloadData);
    var dataToSave = payloadData;
    var userData={};

    dataToSave={};
    dataToSave.cityName=payloadData.cityName;
    dataToSave.isDefault=payloadData.default;
    
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
                  console.log("........info...",info,info[0]._id);
                  dataToSave.CreatorID=info[0]._id;
                  console.log("........id...", dataToSave.CreaterID);
                  callback(null);
              }
          });
        },

        function(callback){
             if(dataToSave.isDefault==true){
                var criteria={isDefault:true};
                 var setQuery = {
                    $set:{isDefault:false}
                };
                 Service.UserServices.updateAdminCity(criteria, setQuery, {new: true}, function (err, result) {
                    if(err)
                    callback(err);
                    else{
                        console.log("........updated...",result);
                    callback(null);
                    }
                });
             }
             else
             callback(null);
        },

            function (callback) {
        
             Service.UserServices.createAdminCity(dataToSave, function (err, userDataFromDB) {
                if (err) { 
                        callback(err)
                } 
                else {
                    console.log(userDataFromDB);
                    userData = userDataFromDB;
                    callback(null);
                }
            });
        },


    ],
    function (err, data) {
        if (err) {
            callback(err);
        } else {
            callback(null, userData);
        }
    });
};

var addPic=function(payloadData,callback){
   
    console.log("......",payloadData);
    var dataToUpdate ={};
    var updatedData;

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
                 if(info)
                 callback(null);
                 else{
                     callback("not a valid token");
                 }
              }
          });
        },
        
            function (callback) {

               console.log("...................",payloadData.cityPic.filename,payloadData.cityPic);
                console.log("...............here.......");
               var finalpath = Path.resolve('./uploads/eveTask/' +payloadData.cityPic.filename);
                console.log("finalpath...........",finalpath),
                     dataToUpdate.cityImageURL=finalpath;
                fsExtra.copy(payloadData.cityPic.path, finalpath, function (err, data) {
                    console.log("................done");
                    if(err)
                        callback(err);
                    else
                        callback(null);
                });
            },

      /*  function (callback) {
            var finalpath = Path.resolve('./uploads/eveTask/' +payloadData.cityPic.filename);
            dataToUpdate.cityImageURL=finalpath;
            im.resize({
                srcPath: payloadData.cityPic.path,
                dstPath: finalpath,
                width: 300,
                height: 300
            }, function(err){
                if (err) callback(err);
                else{
                console.log('resized image');
                 callback(null);}
            });
           
        },*/

           
       function (cb) {

                var criteria = {
                    _id: payloadData.cityID
                };
                var setQuery = {
                    $set: dataToUpdate
                };
                console.log("..............updating pic");
                Service.UserServices.updateAdminCity(criteria, setQuery, {new: true}, function (err, result) {
                    if(err)
                    callback(err);
                    else{
                        console.log("........updated...",result);
                    updatedData = result;
                    cb(null)
                    }
                });
            }
    
    ],
    function (err, data) {
        if (err) {
            callback(err);
        } else {
            callback(null, updatedData);
        }
    });
};

var loginAdmin = function (payloadData, callback) {
    var adminFound = false;
    var accessToken = null;
    var successLogin = false;
    
    var updatedAdminDetails = {};
    async.waterfall([

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
                            // updatedAdminDetails.accessToken=accessToken;
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


var createUser=function (payloadData, callback) {

    var accessToken = null;
    console.log("......",payloadData);
    var dataToSave = payloadData;
    var url;
    var flag=1;
    if (dataToSave.password)
        dataToSave.password = UniversalFunctions.CryptData(dataToSave.password);
    var userData;

    async.waterfall([
            function (callback) {
             
                if (!UniversalFunctions.verifyEmailFormat(dataToSave.email)) {
                    callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_EMAIL);
                } else {
                    callback(null);
                }
            },

            function (callback) {

                Service.UserServices.creatEveTaskUser(dataToSave, function (err, userDataFromDB) {
                    if (err) {

                        if (err.code == 11000 && err.message.indexOf('customers.$phoneNo_1') > -1){
                            callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.PHONE_NO_EXIST);

                        } else if (err.code == 11000 ){
                            callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.EMAIL_ALREADY_EXIST);

                        }else {
                            callback(err)
                        }
                    } else {
                        userData = userDataFromDB;
                    console.log(".........",userDataFromDB,"......",userData);
                    callback(null);
                    }
                });
            },
  
             

     function (callback) {
            console.log("????????????",userData);
             if (userData) {
                 console.log("...inside  if");
             var tokenData = {
             id: userData._id,
             type: UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.USER_ROLES.CUSTOMER
            };
                        console.log("call token ");

             TokenManager.setToken(tokenData, function (err, output) {
             console.log("...gvsedg...",err,output);
             if (err) {
             callback(err);
            } 
            else {
             accessToken = output && output.accessToken || null;
             userData.accessToken=accessToken;
             callback(null);
             }
             });
            }
            else {
             cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR)
            }
            
        },
        
    function (callback) {
        
            console.log("........city...",payloadData.city);
         var criteria={
             cityName:payloadData.city
         };
          var projection={};       
          var options={};
          Service.UserServices.getAdminCity(criteria,projection,options,function (err,data) {
             console.log("....",err,data);
              if(err)
                  callback(err);
              else
              {
                 if(data.length>0){
                     url=data[0].cityImageURL;
              console.log("..........",url,data.cityImageURL)
                 callback(null);}
                 else{ flag=0;         
                     console.log("not a valid city will be using default city");
                     callback(null);
                 }
              }
          });
        },
        function (callback) {
        
             console.log("........city...",payloadData.city);
        if(flag==0){
         var criteria={
             isDefault:true
         };
          var projection={};
          var options={};
          Service.UserServices.getAdminCity(criteria,projection,options,function (err,info) {
             console.log("....",err,info);
              if(err)
                  callback(err);
              else
              {
                 if(info.length>0){
                     url=info[0].cityImageURL
                 callback(null);}
                 else{ flag=0;         
                     callback("no defaul`t city found");
                 }
              }
          });}
          else
          callback(null);
        },

function(callback){

     var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: Config.emailConfig.nodeMailer.Mandrill.auth.user,
            pass: Config.emailConfig.nodeMailer.Mandrill.auth.pass
        },
        secure: true
    });

   
      var mailOptions = {
        from: 'jakshat782@gmail.com',
        to: 'thapliyalshivam@gmail.com', 
        subject:'sending ur city image',
        html: '<b>hi</b>'
    };

    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(error);
            callback(null)
        }
        else{
            console.log('Message sent: ' + info.response);
            callback(null);
        }
    });
}

            
        ],
        function (err, data) {
            if (err) {
                callback(err);
            } else {
                callback(null, userData);
            }
        });
};


module.exports={
    addCity:addCity,
    addPic:addPic,
    loginAdmin:loginAdmin,
    createUser:createUser
    
}