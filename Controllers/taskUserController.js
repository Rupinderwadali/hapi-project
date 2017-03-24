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
var geolib = require('geolib');
var request = require("request");
var Models = require('../Models');
var fsExtra = require('fs-extra');


var createUser=function (payloadData, callback) {

    var accessToken = null;
    //console.log("......",payloadData);
    var dataToSave = payloadData;
    dataToSave.address={};
    dataToSave.address.addressLine=payloadData.addressLine;
    dataToSave.address.countryName=payloadData.countryName;
    dataToSave.address.city=payloadData.city;
    dataToSave.address.state=payloadData.state;
    dataToSave.address.zipcode=payloadData.zipcode;
    var obj=JSON.parse(payloadData.hobbies);
    dataToSave.hobbies=obj;
    var obj1=payloadData.dateOfBirth.split("-");
    dataToSave.dob={};
    dataToSave.dob.date=parseInt(obj1[0]);
    dataToSave.dob.month=parseInt(obj1[1]);
    dataToSave.dob.year=parseInt(obj1[2])
   // console.log(".....",obj1);
    if (dataToSave.password)
        dataToSave.password = UniversalFunctions.CryptData(dataToSave.password);
    var userData = {};
    userData.clubsToShow=[];
    
    //console.log("..........." ,dataToSave.dob.date, dataToSave.dob.month, dataToSave.dob.year);

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

                dataToSave.registrationDate = new Date().toISOString();
                Service.UserServices.createUser(dataToSave, function (err, userDataFromDB) {
                    if (err) {

                        if (err.code == 11000 && err.message.indexOf('customers.$phoneNo_1') > -1){
                            callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.PHONE_NO_EXIST);

                        } else if (err.code == 11000 ){
                            callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.EMAIL_ALREADY_EXIST);

                        }else {
                            callback(err)
                        }
                    } else {
                        
                        userData.user = userDataFromDB;
                        console.log("||||||",userData);
                        callback(null);
                    }
                })
            },

        
               function (cb) {

             if (userData) {
             var tokenData = {
             id: userData.user._id,
             type: UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.USER_ROLES.CUSTOMER
             };
             TokenManager.setToken(tokenData, function (err, output) {
                 console.log(".............",err,output);
             if (err) {
             cb(err);
            }
             else {
               accessToken = output && output.accessToken || null;
                userData.user.accessToken=accessToken;
               cb();
                 }
             })
             } else {
             cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR)
             }
            },
            
            function(callback){
                var data1={};
                data1.clatitude=payloadData.latitude;
                data1.clongitude=payloadData.longitude;
                fetchplaces(data1,function(err,result){
                   // console.log(".........res....",result);
                    if(err)
                    callback(err);
                    else
                    {
                        userData.clubsToShow=(result);
                      //  console.log("..........clubsto show....",userData.clubsToShow);
                        callback(null);
                    }
                })
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


var loginUsers = function (payloadData, callback) {
    var userFound;
    var accessToken = null;
    var successLogin = false;
    var dataToShow = {};
    var dataToShow = {};
    dataToShow.clubsToShow=[];
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
                    dataToShow.user = result[0];
                    console.log("........uf...",dataToShow.user);
                    cb();
                }
            });
        },
        function (cb) {
            //validations
            if (!dataToShow.user) {
                cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.EMAIL_NOT_FOUND);
            }
            else {
                console.log(".....pass..",dataToShow.user.password,"...",UniversalFunctions.CryptData(payloadData.password));
                if ( dataToShow.user.password != UniversalFunctions.CryptData(payloadData.password)) {
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
                    id: dataToShow.user._id,
                    type: UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.USER_ROLES.CUSTOMER
                };
                TokenManager.setToken(tokenData, function (err, output) {
                    if (err) {
                        cb(err);
                    } else {
                        if (output && output.accessToken) {
                            accessToken = output && output.accessToken;
                             dataToShow.user.accessToken=accessToken;
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

          
            function(callback){
                var data1={};
                data1.clatitude=payloadData.clatitude;
                data1.clongitude=payloadData.clongitude;
                fetchplaces(data1,function(err,result){
                   // console.log(".........res....",result);
                    if(err)
                    callback(err);
                    else
                    {
                        dataToShow.clubsToShow=(result);
                      //  console.log("..........clubsto show....",userData.clubsToShow);
                        callback(null);
                    }
                })
            }
       
        
    ], function (err, data) {
        if (err) {
            callback(err);
        } else {
            callback(null,dataToShow);
        }
    });
};


var updateLocation = function (payloadData, callback) {
    var userFound = false;
    var accessToken = null;
    var successLogin = false;
    var updatedUserDetails = {};
    console.log("......",payloadData);
    async.waterfall([

        function (cb) {
            var criteria = {
                accessToken: payloadData.accessToken
            };
            var projection = {};
            var option = {
                lean: true
            };
            Service.UserServices.getUsers(criteria, projection, option, function (err, result) {
                if (err) {
                    cb(err)
                } else {
                    console.log("......",result);
                    userFound = result && result[0] || null;
                    cb();
                }
            });
        },


        function (callaback) {
            var criteria={
                id:userFound._id
            }
            var dataToSet={
                clatitude:payloadData.clatitude,
                clongitude:payloadData.clongitude
            }
            var options={};
            Service.UserServices.updateUser(criteria,dataToSet,options,function (err,data) {
                if(err)
                    callback(err);
                else
                    updatedUserDetails=data;
                    callback(null);
            })
        },


    ], function (err, data) {
        if (err) {
            callback(err);
        } else {
            callback(null,updatedUserDetails);
        }
    });
};

var fetchplaces=function (payloadData,callback) {

    var info;
    var dataToSave=[];
    var dataToCompare;
    var dataToShow=[];
    var flag;
    var data1;
    async.waterfall([

        function(callback){
        /*var lat=parseFloat(payloadData.clatitude);
        var lng=parseFloat(payloadData.clongitude);
        var latmin=parseInt(lat/10);
        var latmax=latmin+1;
        latmin=parseFloat(latmin*10.002);
        latmax=parseFloat(latmax*10.002);
        var lngmin=parseInt(lat/10);
        var lngmax=latmin+1;
        lngmin=parseFloat(latmin*10.002);
        lngmax=parseFloat(latmax*10.002);*/
            var criteria={};
            var projection={};
            var options={};
            var data1;
            Service.UserServices.getPlace(criteria,projection,options,function (err, userDataFromDB) {
                if (err) {
                    callback(err)
                }
                else {
                    if(userDataFromDB) {
                        dataToCompare = userDataFromDB;
                        callback(null);
                    }
                    else
                    {
                        callback(null,"no data");
                    }
                }
            });
        },


        function(callback){
            console.log("...........in controller");
            var distance;
            var j=0;
             flag=0;
            for(var i=0;i<dataToCompare.length;i++){
            distance =geolib.getDistance({latitude:parseFloat(payloadData.clatitude),longitude:parseFloat(payloadData.clongitude)},{latitude:parseFloat(dataToCompare[i].latitude),longitude:parseFloat(dataToCompare[i].longitude)},1);
            if (distance<=1000)
            {
                flag=1;
              dataToShow[j]={};
              dataToShow[j]=dataToCompare[i];
              j++;
            }

        }
        if(flag==1)
        {
            console.log("......",dataToShow,".......not from api");
            callback(null);
        }
        else
        {
            var location = payloadData.clatitude + ',' + payloadData.clongitude;


            var API_END_POINT = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?',
                loc = location,
                radius = '1000',
                type = 'clubs',
                key_ = 'AIzaSyAu7tyNNWpKkPFAZ1QBys4IgNv_ODDjlaY';

            var url = API_END_POINT + "location=" + loc + "&radius=" + radius + "&type=" + type + "&key=" + key_;
            console.log("............", url);
            var options = {
                method: 'GET',
                url: url,

            }

            request(options, function (error, response) {
                if (error) {
                    console.log( error);
                }
                else {
                    //console.log("in response",response)
                    console.log(response.body);
                    info = JSON.parse(response.body)
                    console.log(".......",info,"....",info.results.length);
                    console.log("........",info.results[0]);
                    console.log("........",info.results[0].geometry);
                    console.log("........",info.results[0].geometry.location.lat);
                    console.log("........",info.results[0].name);
                    console.log("........",info.results[0].vicinity);
                    callback(null);

                }
            });
        }


        },




    /*    function (callback) {

            //http://www.omdbapi.com/?t=frozen&y=&plot=short&r=json
//https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=-33.8670522,151.1957362&radius=500&type=restaurant&keyword=cruise&key=YOUR_API_KEY
//https://maps.googleapis.com/maps/api/place/nearbysearch/output?parameters
//https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=-33.8670522,151.1957362&radius=500&type=clubs&key=AIzaSyAu7tyNNWpKkPFAZ1QBys4IgNv_ODDjlaY

            var location = payloadData.clatitude + ',' + payloadData.clongitude;


            var API_END_POINT = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?',
                loc = location,
                radius = '100',
                type = 'clubs',
                key_ = 'AIzaSyAu7tyNNWpKkPFAZ1QBys4IgNv_ODDjlaY';

            var url = API_END_POINT + "location=" + loc + "&radius=" + radius + "&type=" + type + "&key=" + key_;
            console.log("............", url);
            var options = {
                method: 'GET',
                url: url,

            }

            request(options, function (error, response) {
                if (error) {
                    console.log( error);
                }
                else {
                    //console.log("in response",response)
                   // console.log(response.body);
                    info = JSON.parse(response.body)
                    console.log(".......",info,"....",info.results.length);
                    console.log("........",info.results[0]);
                    console.log("........",info.results[0].geometry);
                    console.log("........",info.results[0].geometry.location.lat);
                    console.log("........",info.results[0].name);
                    console.log("........",info.results[0].vicinity);
                    callback(null);

                }
            });
        },*/
        
        
        function (callback) {

            if(flag==0){
          for(var i=0;i<info.results.length;i++) {
             dataToSave[i]={};
             dataToSave[i].name = info.results[i].name;
             dataToSave[i].latitude = info.results[i].geometry.location.lat;
             dataToSave[i].longitude = info.results[i].geometry.location.lng;
             dataToSave[i].vicinity = info.results[i].vicinity;
         }

        console.log("...........before hitting service........");
         Service.UserServices.createPlace(dataToSave,function (err, userDataFromDB) {
             if (err) {
                 callback(err)
                 }
             else {
                 console.log(userDataFromDB,"......data stored...");
                 dataToShow=userDataFromDB;
                 callback(null);
             }
         });}
         else
         callback(null)
        }

    ],function (err,reply) {
            if (err) {
                callback(err);
            } else {
                callback(null, dataToShow);
            }
        });
 }

 var getPlaces=function (callback) {
    var criteria={};
    var projection={};
    var options={};
    var data1;
     Service.UserServices.getPlace(criteria,projection,options,function (err, userDataFromDB) {
         if (err) {
             callback(err)
         }
         else {
             if(userDataFromDB) {
                 console.log(userDataFromDB);
                 data1 = userDataFromDB;
                 callback(null, data1);
             }
             else
             {
                 callback(null,"no entries");
             }
         }
     });
 }

var checkIn=function (payloadData,callback) {   
 
 console.log("..............check in",payloadData);
    var userFound;
    var dataToUpdate={};
    var updatedData;
    async.waterfall([
        function (cb) {
            var criteria = {
                accessToken:payloadData.accessToken
            };
            var projection = {};
            var option = {
                lean: true
            };
            Service.UserServices.getUsers(criteria, projection, option, function (err, result) {
                if (err) {
                    cb(err)
                } else {
                    userFound = result ;
                    console.log(".....",result,"....",userFound);
                    cb();
                }
            });
        },
        function (cb) {
            var criteria = {
                _id:payloadData.barID
        };
           dataToUpdate.users={};
           dataToUpdate.users.uid=userFound._id;
           dataToUpdate.users.checkIN=new Date().toISOString();
        //    var{$push: { "places.users.uid" : userFound[0]._id  ,"places.users.checkIN":new Date().toISOString()}}
          console.log("......",userFound[0]._id);
           var options={};

            Service.UserServices.updatePlaces(criteria, {$push: {"users":{ "uid" : userFound[0]._id  ,"checkIN":new Date().toISOString()}}},{new:true},function (err,info) {
                if (err) {
                    cb(err)
                } else {
                    updatedData = info ;
                    console.log(".....ud...",info,updatedData);
                    cb();
                }
            });
        }
    ],function (err,result) {
        if(err)
            callback(err);
        else
            callback(null,updatedData)
    })

};

var checkOut=function (payloadData,callback) {

  console.log("...payload",payloadData);
    var updatedData;
    async.waterfall([

        function (cb) {
            var criteria = {
                    '_id':payloadData.barID,
                   'users._id':payloadData.checkinID
            };
            var dataToSet={$set:{"users.$.checkOUT":new Date().toISOString()}};
            var projection={};

            var options={new:true};

            Service.UserServices.updatePlaces(criteria,dataToSet, options,function (err,info) {
                if (err) {
                    cb(err)
                } else {
                    updatedData = info ;
                    console.log(".....",info,updatedData);
                    cb();
                }
            });
        }
    ],function (err,result) {
        if(err)
            callback(err);
        else
            callback(null,updatedData)
    })

}




module.exports = {
    createUser: createUser,
    loginUsers: loginUsers,
    updateLocation:updateLocation,
    fetchplaces:fetchplaces,
    getPlaces:getPlaces,
    checkIn:checkIn,
    checkOut:checkOut

}