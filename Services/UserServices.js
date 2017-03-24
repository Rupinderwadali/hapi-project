'use strict';

var Models = require('../Models');


//Insert User in DB
var createUser= function (objToSave, callback) {
    console.log("...........in user service......",objToSave);
    new Models.taskUsers(objToSave).save(callback)
};

var createPlace=function (objToSave,callback) {
    console.log("...........in user service......",objToSave);
    new Models.places.$__insertMany(objToSave,callback)
}

//Update User in DB
var updateUser = function (criteria, dataToSet, options, callback) {
    Models.taskUsers.findOneAndUpdate(criteria, dataToSet, options, callback);
};

var updatePlaces = function (criteria, dataToSet, options, callback) {
    console.log(".....",criteria,".....",dataToSet)
    Models.places.findOneAndUpdate(criteria, dataToSet, options, callback);
};

//Delete User in DB
var deleteUser = function (criteria, callback) {
    Models.taskUsers.findOneAndRemove(criteria, callback);
};

var getUsers = function (criteria, projection, options, callback) {
    console.log("...........in user service......",criteria);
        Models.taskUsers.find(criteria, projection, options, callback);
    };

var getPlace = function (criteria, projection, options, callback) {
    console.log("...........in user service......");
    Models.places.find(criteria, projection, options, callback);
};


var getActivity = function (criteria, projection, options, callback) {
    Models.Activity.find(criteria, projection, options, callback);
};

//Get Rides from DB
var getActivityPopulate = function (criteria, projection, options,populateArray, callback) {
    Models.Activity.find(criteria, projection, options).populate(populateArray).exec(function (err, result) {
        console.log("result.......",result)
        callback(null,result)
    });
};

var createActivity = function (objToSave, callback) {
    new Models.Activity(objToSave).save(callback)
};
var getAllGeneratedCodes = function (callback) {
    var criteria = {
        OTPCode : {$ne : null}
    };
    var projection = {
        OTPCode : 1
    };
    var options = {
        lean : true
    };
    Models.Users.find(criteria,projection,options, function (err, dataAry) {
        if (err){
            callback(err)
        }else {
            var generatedCodes = [];
            if (dataAry && dataAry.length > 0){
                dataAry.forEach(function (obj) {
                    generatedCodes.push(obj.OTPCode.toString())
                });
            }
            callback(null,generatedCodes);
        }
    })
};

var createAdminCity= function (objToSave, callback) {
    console.log("...........in user service......",objToSave);
    new Models.adminCity(objToSave).save(callback)
};

var creatEveTaskUser= function (objToSave, callback) {
    console.log("...........in user service......",objToSave);
    new Models.eveTaskUser(objToSave).save(callback)
};

var getAdminCity = function (criteria, projection, options, callback) {
    console.log("...........in user service......",criteria);
    Models.adminCity.find(criteria, projection, options, callback);
};

var updateAdminCity = function (criteria, dataToSet, options, callback) {
    console.log(".....",criteria,".....",dataToSet)
    Models.adminCity.findOneAndUpdate(criteria, dataToSet, options, callback);
};


var updateeveTaskUser = function (criteria, dataToSet, options, callback) {
    console.log(".....",criteria,".....",dataToSet)
    Models.eveTaskUser.findOneAndUpdate(criteria, dataToSet, options, callback);
};


module.exports = {

    createUser: createUser,
    createPlace:createPlace,
    updateUser:updateUser,
    deleteUser:deleteUser,
    getAllGeneratedCodes:getAllGeneratedCodes,
    getUsers:getUsers,
    getPlace:getPlace,
    createActivity:createActivity,
    getActivity:getActivity,
    getActivityPopulate:getActivityPopulate,
    updatePlaces:updatePlaces,
    createAdminCity:createAdminCity,
    getAdminCity:getAdminCity,
    updateAdminCity:updateAdminCity,
    creatEveTaskUser:creatEveTaskUser,
    updateeveTaskUser:updateeveTaskUser
    //getCount:getCount


};

