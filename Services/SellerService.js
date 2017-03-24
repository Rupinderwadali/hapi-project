var Models = require('../Models');



var createSeller= function (objToSave, callback) {
    new Models.Seller(objToSave).save(callback)
};

var updateSeller = function (criteria, dataToSet, options, callback) {
    Models.Seller.findOneAndUpdate(criteria, dataToSet, options, callback);
};

var getSeller = function (criteria, projection, options, callback) {
    Models.Seller.find(criteria, projection, options, callback);
};

var addProduct=function(objToSave,callback){
    new Models.products(objToSave).save(callback)
}

module.exports = {
    createSeller: createSeller,
    updateSeler:updateSeller,
    getSeller:getSeller,
};