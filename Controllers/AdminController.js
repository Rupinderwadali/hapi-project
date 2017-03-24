'use strict';

var Service = require('../Services');
var UniversalFunctions = require('../Utils/UniversalFunctions');
var async = require('async');

var UploadManager = require('../Lib/UploadManager');
var TokenManager = require('../Lib/TokenManager');
var NotificationManager = require('../Lib/NotificationManager');

var updateCustomer = function (phoneNo, data, callback) {
    var criteria = {
        phoneNo: phoneNo
    };
    var dataToSet = {};
    if (data.name) {
        dataToSet.name = data.name;
    }
    if (data.email) {
        dataToSet.email = data.email;
    }
    if (data.phoneNo) {
        dataToSet.phoneNo = data.phoneNo;
    }
    if (data.deviceToken) {
        dataToSet.deviceToken = data.deviceToken;
    }
    if (data.appVersion) {
        dataToSet.appVersion = data.appVersion;
    }
    if (data.deviceType) {
        dataToSet.deviceType = data.deviceType;
    }
    if (data.hasOwnProperty('isBlocked')) {
        dataToSet.isBlocked = data.isBlocked;
    }
    if (data.hasOwnProperty('defaultCheckoutOption')) {
        dataToSet.defaultCheckoutOption = data.defaultCheckoutOption;
    }
    var options = {
        new: true
    };
    Service.CustomerService.updateCustomer(criteria, dataToSet, options, function (err, data) {
        if (err) {
            callback(err)
        } else {
            if (data) {
                callback(null, data)
            } else {
                callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.NOT_FOUND)
            }
        }
    })
};

var resetPassword = function (email, callback) {
    var generatedPassword = UniversalFunctions.generateRandomString();
    var customerObj = null;
    if (!email) {
        callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    } else {
        async.series([
            function (cb) {
                //Get User
                var criteria = {
                    email: email
                };
                var setQuery = {
                    firstTimeLogin: true,
                    password: UniversalFunctions.CryptData(generatedPassword)
                };
                Service.CustomerService.updateCustomer(criteria, setQuery, {new: true}, function (err, userData) {
                    console.log('update customer', err, userData)
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
                if (customerObj) {
                    var variableDetails = {
                        user_name: customerObj.name,
                        password_to_login: generatedPassword
                    };
                    NotificationManager.sendEmailToUser(variableDetails, customerObj.email, cb)
                } else {
                    cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR)
                }
            }
        ], function (err, result) {
            callback(err, {generatedPassword: generatedPassword}); //TODO Change in production DO NOT Expose the password
        })
    }
};
var addCategory=function(payloadData, userData,callback)
{
    var dataTosave={};
    var dataToUpdate={};
    var CategoryData;
    if (payloadData.profilePic && payloadData.profilePic.filename) {
        dataToUpdate.categoryImage = {
            original: null,
            thumbnail: null
        }
    }
    async.auto({

       createCategory: function (cb) {

        var criteria={
            createrID:userData._id,
            name: payloadData.name,
            description:payloadData.description,
            order: payloadData.order,
        };

            Service.AdminService.addCategory(criteria,function (err,result) {
            if (err) {
                if (err.code == 11000 ){
                    cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.ORDER_EXIST);

                } else {
                    cb(err)
                }

            } else {
                    CategoryData=result;
                    cb(null,result)
            }
        })

        },
        uploadImage:['createCategory',function (err,cb) {
                //Check if profile pic is being updated
                if (CategoryData && CategoryData._id && payloadData.profilePic && payloadData.profilePic.filename) {
                    UploadManager.uploadFileToS3WithThumbnail(payloadData.profilePic, userData._id, function (err, uploadedInfo) {
                        console.log('update profile pic',err,uploadedInfo)
                        if (err) {
                            cb(err)
                        } else {
                            dataToUpdate.categoryImage.original = uploadedInfo && uploadedInfo.original && UniversalFunctions.CONFIG.awsS3Config.s3BucketCredentials.s3URL + uploadedInfo.original || null;
                            dataToUpdate.categoryImage.thumbnail = uploadedInfo && uploadedInfo.thumbnail && UniversalFunctions.CONFIG.awsS3Config.s3BucketCredentials.s3URL + uploadedInfo.thumbnail || null;

                            cb();
                        }
                    })
                } else {
                    cb();
                }
            }],
         updateImage:['uploadImage',   function (err,cb) {
                if (CategoryData && dataToUpdate && dataToUpdate.categoryImage && dataToUpdate.categoryImage.original) {
                    //Update User
                    var criteria = {
                        _id: CategoryData._id
                    };
                    var setQuery = {
                        $set: dataToUpdate
                    };
                    Service.AdminService.updateCategory(criteria, setQuery, {new: true}, function (err, updatedData) {
                        CategoryData = updatedData;
                        cb(err,CategoryData)
                    })
                }else {
                    if (CategoryData && CategoryData._id && payloadData.profilePic && payloadData.profilePic.filename && !dataToUpdate.categoryImage.original){
                        var criteria = {
                            _id: userData._id
                        };
                        Service.AdminService.deleteCategory(criteria,function (err, updatedData) {
                            cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.ERROR_PROFILE_PIC_UPLOAD);
                        })
                    }else {
                        cb();
                    }
                }
            }],
   }, function (err, data) {
    if (err) {
        callback(err);
    } else {
        callback(null, CategoryData);
    }
})

};
var deleteCategory=function(userPayload, userData,callback)
{
    var dataTosave={};
    async.auto([

            function (cb) {

                var criteria={
                    _id:userPayload.categoryId,
                }
                var setQuery = {
                    $set: {
                        is_deleted :true
                    }
                };
                var option={
                    lean:true
                }

                Service.AdminService.updateCategory(criteria,setQuery,option,function (err,result) {
                    if (err) {
                        cb(err)
                    } else {

                        cb(null,result)
                    }
                })
            }
        ], function (err, data) {
            if (err) {
                callback(err);
            } else {
                callback(null,data);
            }
        }
    )
};
var getCategory=function( userData,callback)
{
    var dataToSend={}
    async.auto([
            function (cb) {
                var criteria={
                }

                var option={
                    lean:true
                };
               var projection={

                };

                Service.AdminService.getCategory(criteria,projection,option,function (err,result) {
                    if (err) {
                        cb(err)
                    } else {
                        dataToSend=result;
                        cb(null,result)
                    }
                })

            }
        ], function (err, data) {
            if (err) {
                callback(err);
            } else {
                callback(null,dataToSend);
            }
        }
    )
};
var updateCategory=function(userPayload, userData,callback) {
    var datatoUpdate={} ;
    var updatedData={};

    if (userPayload.name && userPayload.name != '')
        datatoUpdate.name = UniversalFunctions.sanitizeName(userPayload.name);
    if (userPayload.description && userPayload.description != '')
        datatoUpdate.description = UniversalFunctions.sanitizeName(userPayload.description);
    if (userPayload.order && userPayload.order != '')
        datatoUpdate.order = UniversalFunctions.sanitizeName(userPayload.order);
    if (userPayload.image && userPayload.image.filename) {
        datatoUpdate.categoryImage = {
            original: null,
            thumbnail: null
        }
    }
    if (Object.keys(datatoUpdate).length == 0) {
        callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.NOTHING_TO_UPDATE);
    } else {
        async.auto({

            imageUpload: function (cb) {
                //Check if profile pic is being updated
                if (userPayload.image && userPayload.image.filename) {
                    UploadManager.uploadFileToS3WithThumbnail(userPayload.image, userData.id, function (err, uploadedInfo) {
                        if (err) {
                            cb(err)
                        } else {
                            datatoUpdate.categoryImage.original = uploadedInfo && uploadedInfo.original && UniversalFunctions.CONFIG.awsS3Config.s3BucketCredentials.s3URL + uploadedInfo.original || null;
                            datatoUpdate.categoryImage.thumbnail = uploadedInfo && uploadedInfo.thumbnail && UniversalFunctions.CONFIG.awsS3Config.s3BucketCredentials.s3URL + uploadedInfo.thumbnail || null;
                            cb();
                        }
                    })
                } else {
                    cb(null);
                }
            },
            dataUpdate: ['imageUpload', function (err, cb) {
                console.log("data to update is herer ", datatoUpdate)

                var criteria = {
                    _id: userPayload.categoryId,
                }
                var setQuery = datatoUpdate;


                console.log(setQuery, "hellohere")
                var option = {
                    new: true
                }
                Service.AdminService.updateCategory(criteria, setQuery, option, function (err, result) {
                    if (err) {
                        cb(err)
                    } else {
                        updatedData=result;
                        cb(null,result)
                    }
                })
            }],


        }, function (err, data) {
            if (err) {
                callback(err);
            } else {
                callback(null, updatedData);
            }
        })
    }
};
var addSubCategory=function(payloadData, userData,callback)
{
    var dataTosave={};
    var dataToUpdate={};
    var subCategoryData;
    if (payloadData.profilePic && payloadData.profilePic.filename) {
        dataToUpdate.subCategoryImage = {
            original: null,
            thumbnail: null
        }
    }
    async.auto({

            createSubCategory:function (cb) {

                var criteria={
                    categoryId:payloadData.categoryId,
                    createrId:userData._id,
                    name: payloadData.name,
                    description:payloadData.description,
                    order: payloadData.order,
                }

                Service.AdminService.addSubCategory(criteria,function (err,result) {
                    if (err) {
                        if (err.code == 11000 ){
                            cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.ORDER_EXIST);

                        } else {
                            cb(err)
                        }
                    } else {
                        subCategoryData=result;
                        cb(null,result)
                    }
                })


            },
        uploadImage:['createSubCategory',function (err,cb) {
    //Check if profile pic is being updated
             if (subCategoryData && subCategoryData._id && payloadData.profilePic && payloadData.profilePic.filename) {
                     UploadManager.uploadFileToS3WithThumbnail(payloadData.profilePic, userData._id, function (err, uploadedInfo) {
                console.log('update profile pic',err,uploadedInfo)
               if (err) {
                cb(err)
            } else {
                dataToUpdate.subCategoryImage.original = uploadedInfo && uploadedInfo.original && UniversalFunctions.CONFIG.awsS3Config.s3BucketCredentials.s3URL + uploadedInfo.original || null;
                dataToUpdate.subCategoryImage.thumbnail = uploadedInfo && uploadedInfo.thumbnail && UniversalFunctions.CONFIG.awsS3Config.s3BucketCredentials.s3URL + uploadedInfo.thumbnail || null;

                cb();
            }
        })
    } else {
        cb();
    }
}],
    updateImage:['uploadImage',   function (err,cb) {
    if (subCategoryData && dataToUpdate && dataToUpdate.subCategoryImage && dataToUpdate.subCategoryImage.original) {
        //Update User
        var criteria = {
            _id: subCategoryData._id
        };
        var setQuery = {
            $set: dataToUpdate
        };
        Service.AdminService.updateSubCategory(criteria, setQuery, {new: true}, function (err, updatedData) {
            subCategoryData = updatedData;
            cb(null)
        })
    }else {
        if (CategoryData && CategoryData._id && payloadData.profilePic && payloadData.profilePic.filename && !dataToUpdate.subCategoryImage.original){
            var criteria = {
                _id: userData._id
            };
            Service.AdminService.deleteSubCategory(criteria,function (err, updatedData) {
                cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.ERROR_PROFILE_PIC_UPLOAD);
            })
        }else {
            cb();
        }
    }
}],}
        , function (err, data) {
            if (err) {
                callback(err);
            } else {
                callback(null,subCategoryData);
            }
        }
    )
};
var deleteSubCategory=function(userPayload, userData,callback)
{
    var dataTosave={};
    async.auto([
            function (cb) {
                var criteria={
                    _id:userPayload.subCategoryId,
                }
                var setQuery = {
                    $set: {
                        is_deleted :true
                    }
                };
                var option={
                    lean:true
                }
                Service.AdminService.updateSubCategory(criteria,setQuery,option,function (err,result) {
                    if (err) {
                        cb(err)
                    } else {

                        cb(null)
                    }
                })
            }
        ], function (err, data) {
            if (err) {
                callback(err);
            } else {
                callback(null,"deleted");
            }
        }
    )
};

var getSubCategory=function(userPayload, userData,callback)
{

};var dataToSend={};
async.auto({
        saa:function(cb) {

            var criteria = {};
            var option = {
                lean: true
            };
            var projection = {};
            var populatedAry = [
                {
                    path: 'categoryId',
                    match: {},
                    select: "name",
                    options: {}
                }
            ];
            Service.AdminService.getSubCategory(criteria, projection, option, populatedAry, function (err, result) {
                if (err) {
                    cb(err)
                } else {
                    dataToSend = result;
                    cb(null, result);
                }
            });
        }
    }, function (err, data) {
        if (err) {
            callback(err);
        } else {
            callback(null,dataToSend);
        }
    }
)
var updateSubCategory=function(userPayload, userData,callback)
{
    var datatoUpdate={};
    var updatedData;
    if(userPayload.name && userPayload.name!='')
        datatoUpdate.name=UniversalFunctions.sanitizeName(userPayload.name);
    if(userPayload.description && userPayload.description!='')
        datatoUpdate.description=UniversalFunctions.sanitizeName(userPayload.description);
    if(userPayload.order && userPayload.order!='')
        datatoUpdate.order=UniversalFunctions.sanitizeName(userPayload.order);
    if (userPayload.image && userPayload.image.filename) {
        datatoUpdate.subCategoryImage = {
            original: null,
            thumbnail: null
        }
    }
    if (Object.keys(datatoUpdate).length == 0) {
        callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.NOTHING_TO_UPDATE);
    } else {
        async.auto({
            imageUpload: function (cb) {
                //Check if profile pic is being updated
                if (userPayload.image && userPayload.image.filename) {
                    UploadManager.uploadFileToS3WithThumbnail(userPayload.image, userData.id, function (err, uploadedInfo) {
                        if (err) {
                            cb(err)
                        } else {
                            datatoUpdate.subCategoryImage.original = uploadedInfo && uploadedInfo.original && UniversalFunctions.CONFIG.awsS3Config.s3BucketCredentials.s3URL + uploadedInfo.original || null;
                            datatoUpdate.subCategoryImage.thumbnail = uploadedInfo && uploadedInfo.thumbnail && UniversalFunctions.CONFIG.awsS3Config.s3BucketCredentials.s3URL + uploadedInfo.thumbnail || null;
                            cb();
                        }
                    })
                } else {
                    cb(null);
                }
            },
            dataUpdate: ['imageUpload', function (err, cb) {
                console.log("data to update is herer ", datatoUpdate)


                    console.log("data to update is herer ", datatoUpdate)

                    var criteria = {
                        _id: userPayload.subCategoryId,
                    }
                    var setQuery = datatoUpdate;

                    console.log(setQuery, "hellohere")
                    var option = {
                        new: true
                    }
                    Service.AdminService.updateSubCategory(criteria, setQuery, option, function (err, result) {
                        if (err) {
                            cb(err)
                        } else {
                            updatedData=result;
                            cb(null, result)
                        }
                    })
                }]
            }, function (err, data) {
                if (err) {
                    callback(err);
                } else {
                    callback(null,updatedData);
                }
            }
        )
    }

};

var adminLogin = function(userData, callback) {

    var tokenToSend = null;
    var responseToSend = {};
    var tokenData = null;
    async.series([
        function (cb) {
        var getCriteria = {
            email: userData.email,
            password: UniversalFunctions.CryptData(userData.password)
           // password:userData.password
        };
        Service.AdminService.getAdmin(getCriteria, {}, {}, function (err, data) {
            if (err) {
                cb({errorMessage: 'DB Error: ' + err})
            } else {
                if (data && data.length > 0 && data[0].email) {
                    tokenData = {
                        id: data[0]._id,
                        username: data[0].username,
                        type : UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.USER_ROLES.ADMIN
                    };
                    cb()
                } else {
                    cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_USER_PASS)
                }
            }
        });
    }, function (cb) {
        var setCriteria = {
            email: userData.email
        };
        var setQuery = {
            $push: {
                loginAttempts: {
                    validAttempt: (tokenData != null),
                    ipAddress: userData.ipAddress
                }
            }
        };
        Service.AdminService.updateAdmin(setCriteria, setQuery, function (err, data) {
            cb(err,data);
        });
    }, function (cb) {
        if (tokenData && tokenData.id) {
            TokenManager.setToken(tokenData, function (err, output) {
                if (err) {
                    cb(err);
                } else {
                    tokenToSend = output && output.accessToken || null;
                    cb();
                }
            });

        } else {
            cb()
        }

    }], function (err, data) {
        console.log('sending response')
        responseToSend = {access_token: tokenToSend, ipAddress: userData.ipAddress};
        if (err) {
            callback(err);
        } else {
            callback(null,responseToSend)
        }

    });
};

var adminLogout = function (token, callback) {
    TokenManager.expireToken(token, function (err, data) {
        if (!err && data == 1) {
            callback(null, UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT);
        } else {
            callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.TOKEN_ALREADY_EXPIRED)
        }
    })
};

var changePassword = function (queryData, userData, callback) {
    var userFound = null;
    if (!queryData.oldPassword || !queryData.newPassword || !userData) {
        callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    } else {
        async.series([
            function (cb) {
                var criteria = {
                    _id: userData.id
                };
                var projection = {};
                var options = {
                    lean: true
                };
                Service.CustomerService.getCustomer(criteria, projection, options, function (err, data) {
                    if (err) {
                        cb(err)
                    } else {
                        if (data && data.length > 0 && data[0]._id) {
                            userFound = data[0];
                            cb();
                        } else {
                            cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.NOT_FOUND)
                        }
                    }
                })
            },
            function (cb) {
                //Check Old Password
                if (userFound.password != UniversalFunctions.CryptData(queryData.oldPassword)) {
                    cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INCORRECT_OLD_PASS)
                } else if (userFound.password == UniversalFunctions.CryptData(queryData.newPassword)) {
                    cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.SAME_PASSWORD)
                } else {
                    cb();
                }
            },
            function (cb) {
                // Update User Here
                var criteria = {
                    _id: userFound._id
                };
                var setQuery = {
                    $set: {
                        firstTimeLogin: false,
                        password: UniversalFunctions.CryptData(queryData.newPassword)
                    }
                };
                var options = {
                    lean: true
                };
                Service.CustomerService.updateCustomer(criteria, setQuery, options, cb);
            }

        ], function (err, result) {
            callback(err, null);
        })
    }
};

var getCustomer = function (queryData, callback) {
    var criteria = {};
    if (queryData.userId) {
        criteria._id = queryData.userId;
    }
    if (queryData.phoneNo) {
        criteria.phoneNo = queryData.phoneNo;
    }
    if (queryData.email) {
        criteria.email = queryData.email;
    }
    if (queryData.deviceToken) {
        criteria.deviceToken = queryData.deviceToken;
    }
    if (queryData.appVersion) {
        criteria.appVersion = queryData.appVersion;
    }
    if (queryData.deviceType) {
        criteria.deviceType = queryData.deviceType;
    }
    if (queryData.defaultCheckoutOption) {
        criteria.defaultCheckoutOption = queryData.defaultCheckoutOption;
    }
    if (queryData.hasOwnProperty('isBlocked')) {
        criteria.isBlocked = queryData.isBlocked;
    }
    var options = {
        limit: queryData.limit || 0,
        skip: queryData.skip || 0,
        sort: {registrationDate: -1}
    };
    Service.CustomerService.getCustomer(criteria, { __v: 0}, options, function (err, data) {
        callback(err, {count: data && data.length || 0, customersArray: data})
    })
};

var getPartner = function (queryData, callback) {
    var criteria = {};
    if (queryData.partnerId) {
        criteria._id = queryData.partnerId;
    }
    if (queryData.phoneNo) {
        criteria.phoneNo = queryData.phoneNo;
    }
    if (queryData.email) {
        criteria.email = queryData.email;
    }
    if (queryData.hasOwnProperty('isBlocked')) {
        criteria.isBlocked = queryData.isBlocked;
    }
    var options = {
        limit: queryData.limit || 0,
        skip: queryData.skip || 0,
        sort: {registrationDate: -1}
    };
    Service.PartnerService.getPartner(criteria, { __v: 0}, options, function (err, data) {
        callback(err, {count: data && data.length || 0, partnersArray: data})
    })
};

var getInvitedUsers = function (data, callback) {
    var criteria = {  };
    if (data.phoneNo) {
        criteria.phoneNo = data.phoneNo;
    }
    if (data.deviceToken) {
        criteria.deviceToken = data.deviceToken;
    }
    if (data.appVersion) {
        criteria.appVersion = data.appVersion;
    }
    if (data.deviceType) {
        criteria.deviceType = data.deviceType;
    }
    if (data.referralCode) {
        criteria.referralCode = data.referralCode;
    }
    var options = {
        limit: data.limit || 0
        , skip: data.skip || 0,
        sort : {rank: 1}
    };
    Service.InvitedUserService.getUser(criteria, {__v: 0}, options, function (err, data) {
        callback(err, {count: data.length || 0, invitedUsersArray: data})
    })
};

var deleteCustomer = function (phoneNo, callback) {
    var userId = null;
    if (!phoneNo) {
        callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    } else {
        async.series([
            function (cb) {
                //Get User
                var criteria = {
                    phoneNo: phoneNo
                };
                Service.CustomerService.getCustomer(criteria, function (err, userData) {
                    if (err) {
                        cb(err)
                    } else {
                        if (!userData || userData.length == 0) {
                            cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.NOT_FOUND);
                        } else {
                            userId = userData[0] && userData[0]._id;
                            cb()
                        }
                    }
                })
            },
            /*function (cb) {
             //TODO use it later when bookings API are completed
             //Delete Booking
             var criteria = {
             $or: [{driver: userId}, {customer: userId}]
             };
             Service.Booking.deleteBooking(criteria, cb)
             },*/
            function (cb) {
                //Finally Delete User
                var criteria = {
                    _id: userId
                };
                Service.CustomerService.deleteCustomer(criteria, function (err, data) {
                    cb(err, data);
                })
            }
        ], function (err, result) {
            callback(err, null)

        })
    }
};

var getContactBusiness= function (payload, callback) {
    Service.ContactFormService.getBusinessData({},{__v:0},{lean:true}, function (err, businessArray) {
        if (err){
            callback(err)
        }else {
            callback(null,{count:businessArray && businessArray.length || 0, businessArray : businessArray || []})
        }
    })};

var getContactDriver = function (payload, callback) {
    Service.ContactFormService.getDriverData({},{__v:0},{lean:true}, function (err, driverArray) {
        if (err){
            callback(err)
        }else {
            callback(null,{count:driverArray && driverArray.length || 0, driverArray : driverArray || []})
        }
    })
};
var blockUnblockCategory=function (payloadData, callback) {
    var status;
    var setQuery={};
    async.auto({
        updateSellerProfile:function (cb) {
            if(payloadData.blockUnblock=="block")
            {
                setQuery.is_deleted=true
            }
            else {
                setQuery.is_deleted=false
            }

            var criteria = {
                _id:payloadData.categoryId
            };
            /* var setQuery = {
             isBlocked:"true"
             };*/
            var option = {
                new: true
            };
            Service.AdminService.updateCategory(criteria, setQuery, option, function (err, result) {
                if (err) {
                    cb(err)
                } else {
                    console.log("datata",result)
                    status = result.is_deleted;
                    cb()
                }
            })

        },
        updateProduct:['updateSellerProfile',function (err,cb) {
            if(payloadData.blockUnblock=="block")
            {
                setQuery.isActive='0'
            }
            else {
                setQuery.isActive="1"
            }

            var criteria = {
                categoryId:payloadData.categoryId
            };
            /* var setQuery = {
             isBlocked:"true"
             };*/
            var option = {
                multi: true
            };
            Service.ProductService.updateAllProduct(criteria, setQuery, option, function (err, result) {
                if (err) {
                    cb(err)
                } else {
                    //data = result;

                    cb()
                }
            })

        }],

    },function(err,result)
    {
        if(err)
            callback(err)
        else
            callback(null, {status:status} )
    })
};
var blockUnblockSubCategory=function (payloadData, callback) {
    var data={};
    var setQuery={};
    async.auto({
        updateSellerProfile:function (cb) {
            if(payloadData.blockUnblock=="block")
            {
                setQuery.is_deleted=true
            }
            else {
                setQuery.is_deleted=false
            }

            var criteria = {
                _id:payloadData.subCategoryId
            };
            /* var setQuery = {
             isBlocked:"true"
             };*/
            var option = {
                new: true
            };
            Service.AdminService.updateSubCategory(criteria, setQuery, option, function (err, result) {
                if (err) {
                    cb(err)
                } else {

                    cb()
                }
            })

        },
        updateProduct:['updateSellerProfile',function (err,cb) {
            if(payloadData.blockUnblock=="block")
            {
                setQuery.isActive='0'
            }
            else {
                setQuery.isActive="1"
            }

            var criteria = {
                subcategoryId:payloadData.subCategoryId
            };
            /* var setQuery = {
             isBlocked:"true"
             };*/
            var option = {
                multi: true
            };
            Service.ProductService.updateAllProduct(criteria, setQuery, option, function (err, result) {
                if (err) {
                    cb(err)
                } else {
                    data = result;
                    cb()
                }
            })

        }],

    },function(err,result)
    {
        if(err)
            callback(err)
        else
            callback(null,"success")
    })
};


module.exports = {
    deleteCustomer: deleteCustomer,
    deleteDriver: changePassword,
    getContactDriver : getContactDriver,
    getContactBusiness : getContactBusiness,
    adminLogin: adminLogin,
    adminLogout: adminLogout,
    updateCustomer: updateCustomer,
    getCustomer: getCustomer,
    getInvitedUsers: getInvitedUsers,
    getPartner: getPartner,
    addCategory:addCategory,
    deleteCategory:deleteCategory,
    getCategory:getCategory,
    updateCategory:updateCategory,
    updateSubCategory:updateSubCategory,
    getSubCategory:getSubCategory,
    deleteSubCategory:deleteSubCategory,
    addSubCategory:addSubCategory,
    blockUnblockCategory:blockUnblockCategory,
    blockUnblockSubCategory:blockUnblockSubCategory



};