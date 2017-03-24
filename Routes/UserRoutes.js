

var Controller = require('../Controllers');
var UniversalFunctions = require('../Utils/UniversalFunctions');
var Joi = require('joi');


module.exports = [
    {
        method: 'POST',
        path: '/api/users/register',
        handler: function (request, reply) {
            var payloadData = request.payload;

            Controller.UserController.createUser(payloadData, function (err, data) {
                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.CREATED, data)).code(201)
                }
            });
        },
        config: {
            description: 'Register users',
            tags: ['api', 'users'],
            payload: {
                maxBytes: 20000000,
                parse: true,
                output: 'file'
            },

            validate: {
                payload: {
                    name: Joi.string().regex(/^[a-zA-Z ]+$/).trim().min(2).required(),
                    email: Joi.string().email().required(),
                    password: Joi.string().optional().min(5).trim(),
                    countryName:Joi.string().optional().trim(),
                    deviceType: Joi.string().required().valid([UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.DEVICE_TYPES.IOS, UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.DEVICE_TYPES.ANDROID]),
                    deviceToken: Joi.string().required().trim(),
                    profilePic: Joi.any()
                        .meta({swaggerType: 'file'})
                        .optional()
                        .description('image file')
                },
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType : 'form',
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },

    {
        method: 'POST',
        path: '/api/users/login',
        handler: function (request, reply) {
            var payloadData = request.payload;
            Controller.UserController.loginUsers(payloadData, function (err, data) {
                //reply(UniversalFunctions.sendSuccess(null,err))
                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess(null, data))
                }
            });
        },
        config: {
            description: 'Login Via Email & Password For users',
            tags: ['api', 'users'],
            validate: {
                payload: {
                    email: Joi.string().email().required(),
                    password: Joi.string().required().min(5).trim(),
                    deviceType: Joi.string().required().valid([UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.DEVICE_TYPES.IOS, UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.DEVICE_TYPES.ANDROID]),
                    deviceToken: Joi.string().required().trim(),
                    //appVersion: Joi.string().required().trim(),
                    //lat: Joi.number().required(),
                    //long: Joi.number().required()
                },
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form',
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },

    {
        method: 'PUT',
        path: '/api/users/updateProfile',
        handler: function (request, reply) {
            var userPayload = request.payload;
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
            if (userData && userData.id) {
                Controller.UserController.updateUser(userPayload, userData, function (err, data) {
                    if (err) {
                        reply(UniversalFunctions.sendError(err));
                    } else {
                        reply(UniversalFunctions.sendSuccess(null, data))
                    }
                });
            } else {
                reply(UniversalFunctions.sendError(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));
            }
        },
        config: {
            description: 'User Update profile || WARNING : Will not work from documentation, use postman instead',
            auth: 'UserAuth',
            tags: ['api', 'customer'],
            payload: {
                maxBytes: 2000000,
                parse: true,
                output: 'file'
            },
            validate: {
                payload: {
                    name: Joi.string().optional().min(2),
                    email: Joi.string().email().optional(),
                    deviceToken: Joi.string().optional().trim().allow(''),
                    countryName:Joi.string().optional().trim(),
                    profilePic: Joi.any()
                        .meta({swaggerType: 'file'})
                        .optional()
                        .description('image file')
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form',
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },
    {
        method: 'POST',
        path: '/api/users/forgotPassword',
        handler: function (request, reply) {
            var userPayload = request.payload.email;
            if (userPayload) {
                Controller.UserController.getResetPasswordToken(userPayload, function (err, data) {
                    if (err) {
                        reply(UniversalFunctions.sendError(err));
                    } else {
                        reply(UniversalFunctions.sendSuccess(null, data))
                    }
                });
            } else {
                reply(UniversalFunctions.sendError(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));
            }
        },
        config: {
            description: 'User Update profile || WARNING : Will not work from documentation, use postman instead',
            tags: ['api', 'customer'],
            validate: {
                payload: {
                    email: Joi.string().email().required(),
                },
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form',
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },
    {
        method: 'PUT',
        path: '/api/users/changePassword',
        handler: function (request, reply) {
            var userPayload = request.payload;
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
            if (userPayload) {
                Controller.UserController.changePassword(userPayload,userData, function (err, data) {
                    if (err) {
                        reply(UniversalFunctions.sendError(err));
                    } else {
                        reply(UniversalFunctions.sendSuccess(null, data))
                    }
                });
            } else {
                reply(UniversalFunctions.sendError(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));
            }
        },
        config: {
            description: 'User Update profile || WARNING : Will not work from documentation, use postman instead',
            auth: 'UserAuth',
            tags: ['api', 'customer'],


            validate: {
                payload: {
                    newPassword:Joi.string().required().min(5),
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form',
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },
    {
        method: 'PUT',
        path: '/api/users/followStores',
        handler: function (request, reply) {
            var userPayload = request.payload;
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
            if (userData && userData.id) {
                Controller.UserController.followSeller(userPayload, userData, function (err, data) {
                    if (err) {
                        reply(UniversalFunctions.sendError(err));
                    } else {
                        reply(UniversalFunctions.sendSuccess(null, data))
                    }
                });
            } else {
                reply(UniversalFunctions.sendError(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));
            }
        },
        config: {
            description: 'user follow',
            auth: 'UserAuth',
            tags: ['api', 'customer'],

            validate: {
                payload: {
                    sellerId:Joi.string().required(),
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form',
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },

    {
        method: 'POST',
        path: '/api/users/likeProduct',
        handler: function (request, reply) {
            var userPayload = request.payload;
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
            if (userData && userData.id) {
                Controller.UserController.likeProduct(userPayload, userData, function (err, data) {
                    if (err) {
                        reply(UniversalFunctions.sendError(err));
                    } else {
                        reply(UniversalFunctions.sendSuccess(null, data))
                    }
                });
            } else {
                reply(UniversalFunctions.sendError(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));
            }
        },
        config: {
            description: 'user likeProduct',
            auth: 'UserAuth',
            tags: ['api', 'customer'],

            validate: {
                payload: {
                    productId:Joi.string(),
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form',
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },
    {
        method: 'POST',
        path: '/api/users/shareProduct',
        handler: function (request, reply) {
            var userPayload = request.payload;
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
            if (userData && userData.id) {
                Controller.UserController.shareProduct(userPayload, userData, function (err, data) {
                    if (err) {
                        reply(UniversalFunctions.sendError(err));
                    } else {
                        reply(UniversalFunctions.sendSuccess(null, data))
                    }
                });
            } else {
                reply(UniversalFunctions.sendError(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));
            }
        },
        config: {
            description: 'user likeProduct',
            auth: 'UserAuth',
            tags: ['api', 'customer'],

            validate: {
                payload: {
                    productId:Joi.string(),
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form',
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },
    {
        method: 'POST',
        path: '/api/users/DislikeProduct',
        handler: function (request, reply) {
            var userPayload = request.payload;
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
            if (userData && userData.id) {
                Controller.UserController.dislikeProduct(userPayload, userData, function (err, data) {
                    if (err) {
                        reply(UniversalFunctions.sendError(err));
                    } else {
                        reply(UniversalFunctions.sendSuccess(null, data))
                    }
                });
            } else {
                reply(UniversalFunctions.sendError(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));
            }
        },
        config: {
            description: 'user likeProduct',
            auth: 'UserAuth',
            tags: ['api', 'customer'],

            validate: {
                payload: {
                    productId:Joi.string().required(),
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form',
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/api/users/getUserActivity',
        handler: function (request, reply) {
            var payloadData = request.query;
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
            console.log("userdat.......",userData)
            Controller.UserController.getUserActivity(payloadData, userData,function (err, data) {
                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.CREATED, data)).code(201)
                }
            });
        },
        config: {
            description: 'get active product  ',
            auth: 'UserAuth',
            tags: ['api', 'User'],
            validate: {
                query: {
                    pageNo:Joi.string().required(),
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType : 'form',
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/api/users/getUserDetails',
        handler: function (request, reply) {
            var payloadData = request.query;
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
            //console.log("userdat.......",userData)
            Controller.UserController.getUserDetails(payloadData, userData,function (err, data) {
                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.CREATED, data)).code(201)
                }
            });
        },
        config: {
            description: 'get user Details  ',
            auth: 'UserAuth',
            tags: ['api', 'User'],
            validate: {
                query: {
                    userId:Joi.string().required(),
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType : 'form',
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/api/users/getGlobalActivity',
        handler: function (request, reply) {
            var payloadData = request.query;
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
            console.log("userdat.......",userData)
            Controller.UserController.getGlobalActivity(payloadData, userData,function (err, data) {
                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.CREATED, data)).code(201)
                }
            });
        },
        config: {
            description: 'get global Activity  ',
            auth: 'UserAuth',
            tags: ['api', 'User'],
            validate: {
                query: {
                    pageNo:Joi.string().required(),
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType : 'form',
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/api/users/getFriendsActivity',
        handler: function (request, reply) {
            var payloadData = request.query;
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
            console.log("userdat.......",userData)
            Controller.UserController.getFriendsActivity(payloadData, userData,function (err, data) {
                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.CREATED, data)).code(201)
                }
            });
        },
        config: {
            description: 'get global Activity  ',
            auth: 'UserAuth',
            tags: ['api', 'User'],
            validate: {
                query: {
                    pageNo:Joi.string().required(),
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType : 'form',
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },
    {
        method: 'PUT',
        path: '/api/users/unfollowStores',
        handler: function (request, reply) {
            var userPayload = request.payload;
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
            if (userData && userData.id) {
                Controller.UserController.unfollowSeller(userPayload, userData, function (err, data) {
                    if (err) {
                        reply(UniversalFunctions.sendError(err));
                    } else {
                        reply(UniversalFunctions.sendSuccess(null, data))
                    }
                });
            } else {
                reply(UniversalFunctions.sendError(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));
            }
        },
        config: {
            description: 'user follow',
            auth: 'UserAuth',
            tags: ['api', 'customer'],

            validate: {
                payload: {
                    sellerId:Joi.string().required(),
                   // followId:Joi.string().required(),
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form',
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },
    {
        method: 'PUT',
        path: '/api/users/unfollowUser',
        handler: function (request, reply) {
            var userPayload = request.payload;
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
            if (userData && userData.id) {
                Controller.UserController.unfollowUser(userPayload, userData, function (err, data) {
                    if (err) {
                        reply(UniversalFunctions.sendError(err));
                    } else {
                        reply(UniversalFunctions.sendSuccess(null, data))
                    }
                });
            } else {
                reply(UniversalFunctions.sendError(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));
            }
        },
        config: {
            description: 'user follow',
            auth: 'UserAuth',
            tags: ['api', 'customer'],

            validate: {
                payload: {
                    userId:Joi.string().required(),
                    // followId:Joi.string().required(),
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form',
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },

    {
        method: 'POST',
        path: '/api/users/followUser',
        handler: function (request, reply) {
            var userPayload = request.payload;
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
            if (userData && userData.id) {
                Controller.UserController.followUser(userPayload, userData, function (err, data) {
                    if (err) {
                        reply(UniversalFunctions.sendError(err));
                    } else {
                        reply(UniversalFunctions.sendSuccess(null, data))
                    }
                });
            } else {
                reply(UniversalFunctions.sendError(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));
            }
        },
        config: {
            description: 'user follow',
            auth: 'UserAuth',
            tags: ['api', 'customer'],

            validate: {
                payload: {
                    userId:Joi.string().required(),
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form',
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },
    {
        method: 'POST',
        path: '/sellers/followcountForUser',
        handler: function (request, reply) {
            var userPayload = request.payload;
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
            if (userData && userData.id) {
                Controller.UserController.countFollowForUser(userPayload, userData, function (err, data) {
                    if (err) {
                        reply(UniversalFunctions.sendError(err));
                    } else {
                        reply(UniversalFunctions.sendSuccess(null, data))
                    }
                });
            } else {
                reply(UniversalFunctions.sendError(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));
            }
        },
        config: {
            description: 'user follow',
            auth: 'UserAuth',
            tags: ['api', 'customer'],

            validate: {
                payload: {
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form',
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },
    {
        method: 'POST',
        path: '/api/users/item_store_activity',
        handler: function (request, reply) {
            var userPayload = request.payload;
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
          //  console.log("datata ",userData);
            if (userData && userData.id) {
                Controller.UserController.item_store_activity(userPayload, userData, function (err, data) {
                    if (err) {
                        reply(UniversalFunctions.sendError(err));
                    } else {
                        reply(UniversalFunctions.sendSuccess(null, data))
                    }
                });
            } else {
                reply(UniversalFunctions.sendError(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));
            }
        },
        config: {
            description: 'user follow',
            auth: 'UserAuth',
            tags: ['api', 'customer'],

            validate: {
                payload: {
                    userId:Joi.string().required(),
                    Type: Joi.string().required().valid([UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.USER_GET_TYPE.ITEMS,
                                                         UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.USER_GET_TYPE.STORES ]),
                    pageNo:Joi.string().required()
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form',
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/sellers/getStoreDetails',
        handler: function (request, reply) {
            var payloadData = request.query;
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
            console.log("userdat.......",userData)
            Controller.SellerController.getStoreDetails( payloadData,userData,function (err, data) {
                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.CREATED, data)).code(201)
                }
            });
        },
        config: {
            description: 'get active product  ',
            auth: 'UserAuth',
            tags: ['api', 'User'],
            validate: {
                query: {
                    sellerId:Joi.string().required(),
                    pageNo:Joi.string().required()
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType : 'form',
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },


    {
        method: 'POST',
        path: '/api/users/loginViaFacebook',
        handler: function (request, reply) {
            var payloadData = request.payload;
            Controller.UserController.loginUserViaFacebook(payloadData, function (err, data) {
                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess(null, data))
                }
            });
        },
        config: {
            description: 'Login Via Facebook For  Customer',
            tags: ['api', 'users'],
            validate: {
                payload: {
                    facebookId: Joi.string().required(),
                    name:Joi.string().required(),
                    facebookImageUrl:Joi.string().required(),
                    deviceType: Joi.string().required().valid([UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.DEVICE_TYPES.IOS, UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.DEVICE_TYPES.ANDROID]),
                    language: Joi.string().required().valid([
                        UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.LANGUAGE.EN,
                        UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.LANGUAGE.ES_MX]),
                    deviceToken: Joi.string().required().trim(),
                    flushPreviousSessions: Joi.boolean().required(),
                    //appVersion: Joi.string().required().trim()
                },
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form',
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },
    {
        method: 'POST',
        path: '/api/users/loginViaGoogle',
        handler: function (request, reply) {
            var payloadData = request.payload;
            Controller.UserController.loginUserViaGoogle(payloadData, function (err, data) {
                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess(null, data))
                }
            });
        },
        config: {
            description: 'Login Via Google For  Customer',
            tags: ['api', 'users'],
            validate: {
                payload: {
                    googleId: Joi.string().required(),
                    name:Joi.string().required(),
                    googleImageUrl:Joi.string().required(),
                    deviceType: Joi.string().required().valid([UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.DEVICE_TYPES.IOS, UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.DEVICE_TYPES.ANDROID]),
                    language: Joi.string().required().valid([
                        UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.LANGUAGE.EN,
                        UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.LANGUAGE.ES_MX]),
                    deviceToken: Joi.string().required().trim(),
                    flushPreviousSessions: Joi.boolean().required(),
                    //appVersion: Joi.string().required().trim()
                },
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form',
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },
    {
        method: 'PUT',
        path: '/api/users/logout',
        handler: function (request, reply) {
        var userData = request.auth && request.auth.credentials && request.auth.credentials.userData || null;
            console.log(userData._id)
            if (userData.ps == UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.USER_ROLES.CUSTOMER){
                reply(UniversalFunctions.sendError(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.UNAUTHORIZED));
           }else {
                Controller.UserController.logoutUser(userData, function (err, data) {
                    if (err) {
                        reply(UniversalFunctions.sendError(err));
                    } else {
                        reply(UniversalFunctions.sendSuccess())
                    }
                });
            }
        },
        config: {
            auth: 'UserAuth',
            validate: {
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            description: 'Logout user',
            tags: ['api', 'users'],
            plugins: {
                'hapi-swagger': {
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },
    {
        method: 'POST',
        path: '/api/users/addToCart',
        handler: function (request, reply) {
            var userPayload = request.payload;
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
            //  console.log("datata ",userData);
            if (userData && userData.id) {
                Controller.UserController.addToCart(userPayload, userData, function (err, data) {
                    if (err) {
                        reply(UniversalFunctions.sendError(err));
                    } else {
                        reply(UniversalFunctions.sendSuccess(null, data))
                    }
                });
            } else {
                reply(UniversalFunctions.sendError(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));
            }
        },
        config: {
            description: 'user follow',
            auth: 'UserAuth',
            tags: ['api', 'customer'],

            validate: {
                payload: {
                    productId:Joi.string().required(),
                    variations:Joi.string().optional(),
                    color:Joi.string().optional(),
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form',
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },
    {
        method: 'POST',
        path: '/api/users/getCartDetails',
        handler: function (request, reply) {
           // var userPayload = request.payload;
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
            //  console.log("datata ",userData);
            if (userData && userData.id) {
                Controller.UserController.getCartDetails(userData, function (err, data) {
                    if (err) {
                        reply(UniversalFunctions.sendError(err));
                    } else {
                        reply(UniversalFunctions.sendSuccess(null, data))
                    }
                });
            } else {
                reply(UniversalFunctions.sendError(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));
            }
        },
        config: {
            description: 'user follow',
            auth: 'UserAuth',
            tags: ['api', 'customer'],

            validate: {
                /*payload: {

                },*/
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form',
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },
    {
        method: 'PUT',
        path: '/api/users/removeCart',
        handler: function (request, reply) {
            var userPayload = request.payload;
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
            //  console.log("datata ",userData);
            if (userData && userData.id) {
                Controller.UserController.removeCart(userPayload, userData, function (err, data) {
                    if (err) {
                        reply(UniversalFunctions.sendError(err));
                    } else {
                        reply(UniversalFunctions.sendSuccess(null, data))
                    }
                });
            } else {
                reply(UniversalFunctions.sendError(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));
            }
        },
        config: {
            description: 'user removeCart',
            auth: 'UserAuth',
            tags: ['api', 'customer'],

            validate: {
                payload: {
                    cartId:Joi.string().required(),
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form',
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },
    {
        method: 'POST',
        path:'/api/users/on_off_notification',
        handler: function (request, reply) {
            var userPayload = request.payload;
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
            if (userData && userData.id) {
                Controller.UserController.on_off_notification(userPayload,userData, function (err, data) {
                    if (err) {
                        reply(UniversalFunctions.sendError(err));
                    } else {

                        reply(UniversalFunctions.sendSuccess(null, data))
                    }
                });
            } else {
                reply(UniversalFunctions.sendError(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));
            }
        },
        config: {
            description: 'block and unblock seller',
            auth: 'UserAuth',
            tags: ['api', 'customer'],

            validate: {
                payload: {
                    blockUnblock:Joi.string().required().valid(["on","off"])
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form',
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },
   /* {
        method: 'POST',
        path: '/api/users/addAddress',
        handler: function (request, reply) {
            var userPayload = request.payload;
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
            //  console.log("datata ",userData);
            if (userData && userData.id) {
                Controller.UserController.addAddress(userPayload, userData, function (err, data) {
                    if (err) {
                        reply(UniversalFunctions.sendError(err));
                    } else {
                        reply(UniversalFunctions.sendSuccess(null, data))
                    }
                });
            } else {
                reply(UniversalFunctions.sendError(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));
            }
        },
        config: {
            description: 'user follow',
            auth: 'UserAuth',
            tags: ['api', 'customer'],

            validate: {
                payload: {
                    fullName:Joi.string().required(),
                    addressLine1:Joi.string().required(),
                    addressLine2: Joi.string().required(),
                    countryName:Joi.string().required(),
                    city :Joi.string().required(),
                    state:Joi.string().required(),
                    zipcode:Joi.string().required(),
                    phoneNo: Joi.string().required(),

                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form',
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },*/
    {
        method: 'GET',
        path: '/api/users/suggestion',
        handler: function (request, reply) {
            var payloadData = request.query;
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
            console.log("userdat.......",userData)
            Controller.UserController.suggestion( payloadData,userData,function (err, data) {
                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.CREATED, data)).code(201)
                }
            });
        },
        config: {
            description: 'get active product  ',
            auth: 'UserAuth',
            tags: ['api', 'User'],
            validate: {
                query: {
                    text:Joi.string().trim().required(),

                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType : 'form',
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/api/users/searchAll',
        handler: function (request, reply) {
            var payloadData = request.query;
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
            console.log("userdat.......",userData)
            Controller.UserController.searchAll( payloadData,userData,function (err, data) {
                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.CREATED, data)).code(201)
                }
            });
        },
        config: {
            description: 'get active product  ',
            auth: 'UserAuth',
            tags: ['api', 'User'],
            validate: {
                query: {
                    text:Joi.string().trim().required(),
                    value:Joi.string().required().valid(["item","store","user"])
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType : 'form',
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },
    {
        method: 'POST'
        , path: '/api/users/genrateOrder'
        , handler: function (request, reply) {
        var data=request.payload;
        console.log("datattata",data)
        var userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
        if(userData && userData.id){
            Controller.UserController.genrateOrder(data,userData, function (err, data) {
                if (err) {
                    reply(UniversalFunctions.sendError(err));
                }
                else {
                    reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT, data))
                }
            })
        };
    }, config: {
        description: 'genrate Order ,details:[{productId:"",price:"",quantity:"",name:"",shippingCost:"",originalImage:"",thumbnailImage:"",sellerId:"",supplierId:""}]' ,
        tags: ['api', 'admin'],
        auth: 'UserAuth',
        validate: {
            payload:{
                buyerId:Joi.string().required(),
                addressId:Joi.string().required(),
                details:Joi.array().optional(),
                title:Joi.string().required(),
                sku:Joi.string().required(),
                netAmount:Joi.string().required(),

            },
            headers: UniversalFunctions.authorizationHeaderObj,
            failAction: UniversalFunctions.failActionFunction
        },
        plugins: {
            'hapi-swagger': {
                responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
            }
        }
     }
    },
    {
        method: 'POST'
        , path: '/api/users/addAddress'
        , handler: function (request, reply) {
        var data=request.payload;
        var userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
        if(userData && userData.id){
            Controller.UserController.addAddress(data,userData, function (err, data) {
                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.UPDATED, data))
                }
            })};

    }, config: {
        description: 'add address of user',
        tags: ['api', 'admin'],
        auth: 'UserAuth',
        validate: {
            payload: {
                fullName:Joi.string().required(),
                addressLine1: Joi.string().required(),
                addressLine2: Joi.string().optional(),
                countryName:Joi.string().required(),
                city :Joi.string().required(),
                state:Joi.string().required(),
                zipcode:Joi.string().required(),
                phoneNo: Joi.string().required(),
                isDefault:Joi.string().required().valid(["true","false"])

            }
            ,
            headers: UniversalFunctions.authorizationHeaderObj,
            failAction: UniversalFunctions.failActionFunction
        },
        plugins: {
            'hapi-swagger': {
                payloadType: 'form',
                responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
            }
         }
        }
    },
    {
        method: 'GET'
        , path: '/api/users/getAddresss'
        , handler: function (request, reply) {
        var userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
        if(userData && userData.id){
            Controller.UserController.getAddress(userData, function (err, data) {
                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT, data))
                }
            })};

    }, config: {
        description: 'Get Address details of User',
        tags: ['api', 'admin'],
        auth: 'UserAuth',

        validate: {
            headers: UniversalFunctions.authorizationHeaderObj,
            failAction: UniversalFunctions.failActionFunction
        },
        plugins: {
            'hapi-swagger': {
                payloadType: 'form',
                responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
            }
        }
    }
    },
    {
        method: 'POST'
        , path: '/api/users/deleteAddress'
        , handler: function (request, reply) {
        var data=request.payload;
        var userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
        if(userData && userData.id){
            Controller.UsersController.deleteAddrss(data,userData, function (err, data) {
                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT, data))
                }
            })};

    }, config: {
        description: 'Update default distance of 5 km',
        tags: ['api', 'admin'],
        auth: 'UserAuth',

        validate: {
            payload:{
                addressId:Joi.string().required()
            },
            headers: UniversalFunctions.authorizationHeaderObj,
            failAction: UniversalFunctions.failActionFunction
        },
        plugins: {
            'hapi-swagger': {
                payloadType: 'form',
                responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
            }
        }
    }
    },
    {
        method: 'POST'
        , path: '/api/users/editAddress'
        , handler: function (request, reply) {
        var data=request.payload;
        var userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
        if(userData && userData.id){
            Controller.UserController.editAddress(data,userData, function (err, data) {
                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT, data))
                }
            })};

    }, config: {
        description: 'Update default distance of 5 km',
        tags: ['api', 'admin'],
        auth: 'UserAuth',

        validate: {
            payload:{
                addressId:Joi.string().required(),
                fullName:Joi.string().required(),
                addressLine1: Joi.string().required(),
                addressLine2: Joi.string().optional(),
                countryName:Joi.string().required(),
                city :Joi.string().required(),
                state:Joi.string().required(),
                zipcode:Joi.string().required(),
                phoneNo: Joi.string().required(),
                isDefault:Joi.string().required().valid(["true","false"])
            },
            headers: UniversalFunctions.authorizationHeaderObj,
            failAction: UniversalFunctions.failActionFunction
        },
        plugins: {
            'hapi-swagger': {
                payloadType: 'form',
                responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
            }
        }
    }
    },
    {
        method: 'GET',
        path: '/api/users/filterProduct',
        handler: function (request, reply) {
            var payloadData = request.query;
            console.log("payloadDaya34",payloadData)
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
            //console.log("userdat.......",userData)

            Controller.UserController.filterProduct( payloadData,userData,function (err, data) {
                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.CREATED, data)).code(201)
                }
            });
        },
        config: {
            description: 'get active product  ',
            auth: 'UserAuth',
            tags: ['api', 'User'],
            validate: {
                query: {
                    createrId:Joi.string().trim().optional(),
                    categoryId:Joi.string().trim().optional(),
                    subcategoryId:Joi.string().trim().optional(),
                    new:Joi.string().trim().optional(),
                    popular:Joi.string().trim().optional(),
                    pageNo:Joi.string().required(),
                    color:Joi.string().optional(),
                    variations:Joi.string().optional(),
                    minPrice:Joi.string().optional(),
                    maxPrice:Joi.string().optional(),
                    sort: Joi.string().optional().valid(['LH','HT'])
                },
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType : 'form',
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },

    {
        method: 'POST'
        , path: '/api/users/newApi'
        , handler: function (request, reply) {
        var data=request.payload;
        console.log(".................in routes............");
       Controller.UserController.setname(data, function (err, data) {
            if (err) {
                reply(UniversalFunctions.sendError(err));
            } else {
                console.log("........coming back to routes......");
                reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT, data))
            }
        })

    }, config: {
        description: 'Adding user name',
        tags: ['api', 'user'],

        validate: {
            payload:{
                name:Joi.string().required()
            },
            //    headers: UniversalFunctions.authorizationHeaderObj,
            failAction: UniversalFunctions.failActionFunction
        },
        plugins: {
            'hapi-swagger': {
                payloadType: 'form',
                responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
            }
        }
    }
    },



    {
        method: 'GET'
        , path: '/api/users/FetchAPI'
        , handler: function (request, reply) {
        var data=request.query;
        console.log(".................in routes............");
        Controller.UserController.fetchname(data, function (err, data) {
            if (err) {
                reply(UniversalFunctions.sendError(err));
            } else {
                console.log("........back to routes......");
                reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT, data))
            }
        })

    }, config: {
        description: 'fetch details by user name',
        tags: ['api', 'user'],

        validate: {
            query:{
                name:Joi.string().required()
            },
            //    headers: UniversalFunctions.authorizationHeaderObj,
            failAction: UniversalFunctions.failActionFunction
        },
        plugins: {
            'hapi-swagger': {
                payloadType: 'form',
                responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
            }
        }
    }
    },
];