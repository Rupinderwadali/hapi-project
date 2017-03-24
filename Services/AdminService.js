'use strict';

var Models = require('../Models');

//Get Users from DB
var getAdmin = function (criteria, projection, options, callback) {
    Models.Admins.find(criteria, projection, options, callback);
};
//Insert User in DB
var createAdmin = function (objToSave, callback) {
    new Models.Admins(objToSave).save(callback)
};
//Update User in DB
var updateAdmin = function (criteria, dataToSet, options, callback) {
    Models.Admins.findOneAndUpdate(criteria, dataToSet, options, callback);
};
var addCategory = function (objToSave, callback) {
    new Models.Category(objToSave).save(callback)
};
var updateCategory = function (criteria, dataToSet, options, callback) {
    Models.Categories.findOneAndUpdate(criteria, dataToSet, options, callback);
};
var getCategory = function (criteria, projection, options, callback) {
    Models.Categories.find(criteria, projection, options, callback);
}
var addSubCategory = function (objToSave, callback) {
    new Models.SubCategories(objToSave).save(callback)
};
var updateSubCategory = function (criteria, dataToSet, options, callback) {
    Models.SubCategories.findOneAndUpdate(criteria, dataToSet, options, callback);
};
var getSubCategoryName = function (criteria, projection, options, callback) {
    Models.SubCategories.find(criteria, projection, options, callback);
};

var getSubCategory = function (criteria, project, options,populateModelArr, callback) {
    Models.SubCategories.find(criteria, project, options).populate(populateModelArr).exec(function (err, docs) {
        if (err) {
            return callback(err, docs);
        }else{
            callback(null, docs);
        }
    });
};
var deleteCategory = function (criteria, callback) {
    Models.Categories.findOneAndRemove(criteria, callback);
};
var deleteSubCategory = function (criteria, callback) {
    Models.SubCategories.findOneAndRemove(criteria, callback);
};


var getplace=function (criteria, project, options,populateModelArr, callback) {
    Models.places.find(criteria, project, options).populate(populateModelArr).exec(function (err, docs) {
        if (err) {
            return callback(err, docs);
        }else{
            callback(null, docs);
        }
    });
};

module.exports = {
    getAdmin: getAdmin,
    createAdmin: createAdmin,
    updateAdmin: updateAdmin,
    addCategory:addCategory,
    updateCategory:updateCategory,
    getCategory:getCategory,
    getSubCategory:getSubCategory,
    updateSubCategory:updateSubCategory,
    addSubCategory:addSubCategory,
    deleteCategory:deleteCategory,
    deleteSubCategory:deleteSubCategory,
    getSubCategoryName:getSubCategoryName,
    getplace:getplace
};

