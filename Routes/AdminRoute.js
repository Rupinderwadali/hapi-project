'use strict';
/**
 * Created by shahab on 10/7/15.
 */

var Controller = require('../Controllers');
var UniversalFunctions = require('../Utils/UniversalFunctions');
var Joi = require('joi');

var non_auth_routes = [
    {
        method: 'DELETE',
        path: '/admin/deleteCustomer',
        handler: function (request, reply) {
            var phoneNo = request.query.phoneNo;
            Controller.AdminController.deleteCustomer(phoneNo, function (err, data) {
                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.DELETED))
                }
            });

        }, config: {
        description: 'ONLY FOR TESTING',
        tags: ['api', 'admin', 'customer'],
        validate: {
            query: {
                phoneNo: Joi.string().required().min(10)
            },
            failAction: UniversalFunctions.failActionFunction
        },
        plugins: {
            'hapi-swagger': {
                responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
            }
        }
    }
    }
   /* {
        method: 'DELETE',
        path: '/api/admin/deleteDriver',
        handler: function (request, reply) {
            var phoneNo = request.query.phoneNo;
            Controller.AdminController.deleteDriver(phoneNo, function (err, data) {
                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess(null))
                }
            });

        }, config: {
        description: 'ONLY FOR TESTING',
        tags: ['api', 'admin', 'driver'],
        validate: {
            query: {
                phoneNo: Joi.string().regex(/^[0-9]+$/).required().length(10)
            },
            failAction: UniversalFunctions.failActionFunction
        },
        plugins: {
            'hapi-swagger': {
                responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
            }
        }
    }
    }, */

    ,{
        method: 'POST',
        path: '/admin/login',
        config: {
            description: 'Login for Super Admin',
            tags: ['api', 'admin'],
            handler: function (request, reply) {
                var queryData = {
                    email: request.payload.email,
                    password: request.payload.password,
                    ipAddress: request.info.remoteAddress || null
                };
                Controller.AdminController.adminLogin(queryData, function (err, data) {
                    if (err) {
                        reply(UniversalFunctions.sendError(err))
                    } else {
                        reply(UniversalFunctions.sendSuccess(null, data))
                    }
                })
            },
            validate: {
                failAction: UniversalFunctions.failActionFunction,
                payload: {
                    email: Joi.string().email().required(),
                    password: Joi.string().required()
                }
            },
            plugins: {
                'hapi-swagger': {
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    }

];

var userRoutes = [
    {
        method: 'GET'
        , path: '/admin/getAllCustomers'
        , handler: function (request, reply) {
        var data = request.query;
        Controller.AdminController.getCustomer(data, function (err, data) {
            if (err) {
                reply(UniversalFunctions.sendError(err));
            } else {
                reply(UniversalFunctions.sendSuccess(null, data))
            }
        });
    }, config: {
        description: 'Get List Of Customers',
        tags: ['api', 'admin'],
        validate: {
            query: {
                phoneNo: Joi.string().regex(/^[0-9]+$/).optional().length(10),
                userId: Joi.string().optional().trim(),
                appVersion: Joi.string().optional().trim(),
                deviceToken: Joi.string().optional().trim(),
                deviceType: Joi.string().optional().valid([UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.DEVICE_TYPES.ANDROID, UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.DEVICE_TYPES.IOS]),
                isBlocked: Joi.boolean().optional(),
                limit: Joi.number().integer().optional(),
                skip: Joi.number().integer().optional()
            },
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
        method: 'POST',
        path: '/admin/addCategory',
        handler: function (request, reply) {
            var userPayload = request.payload;
            console.log("userdajkjkj",userPayload)
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
            if (userData && userData.id) {
                Controller.AdminController.addCategory(userPayload, userData, function (err, data) {
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
            description: 'add category',
            auth: 'UserAuth',
            tags: ['api', 'admin'],
            payload: {
                maxBytes: 2000000000,
                parse: true,
                output: 'file'
            },

            validate: {
                payload: {
                    name: Joi.string().regex(/^[a-zA-Z ]+$/).trim().min(2).required(),
                    description: Joi.string().optional().trim().optional(),
                    order:Joi.string().optional().trim().optional(),
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
                    payloadType : 'form',
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },
    {
        method: 'POST',
        path: '/admin/getCategory',
        handler: function (request, reply) {
            var userPayload = request.payload;
            console.log("userdajkjkj",userPayload)
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
            if (userData && userData.id) {
                Controller.AdminController.getCategory( userData, function (err, data) {
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
            description: 'Register users',
            auth: 'UserAuth',
            tags: ['api', 'admin'],

            validate: {
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
        path: '/admin/setFeaturedProduct',
        handler: function (request, reply) {
            var userPayload = request.payload;
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
            if (userData && userData.id) {
                Controller.ProductController.setFeaturedProduct(userPayload, function (err, data) {
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
            description: 'user set featured',
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
        path: '/admin/clearedFeaturedProduct',
        handler: function (request, reply) {
            var userPayload = request.payload;
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
            if (userData && userData.id) {
                Controller.ProductController.clearedFeaturedProduct(userPayload, function (err, data) {
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
            description: 'user set featured',
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
        path: '/admin/blockUnblockUser',
        handler: function (request, reply) {
            var userPayload = request.payload;
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
            if (userData && userData.id) {
                Controller.UserController.blockUnblockUser(userPayload, function (err, data) {
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
            description: 'user set featured',
            auth: 'UserAuth',
            tags: ['api', 'customer'],

            validate: {
                payload: {
                    userId:Joi.string().required(),
                    blockUnblock:Joi.string().required().valid(["block","unblock"])
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
        path: '/admin/blockUnblockSupplier',
        handler: function (request, reply) {
            var userPayload = request.payload;
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
            if (userData && userData.id) {
                Controller.SupplierController.blockUnblockSupplier(userPayload, function (err, data) {
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
            description: 'user set featured',
            auth: 'UserAuth',
            tags: ['api', 'customer'],

            validate: {
                payload: {
                    supplierId:Joi.string().required(),
                    blockUnblock:Joi.string().required().valid(["block","unblock"])
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
        path: '/admin/blockUnblockSeller',
        handler: function (request, reply) {
            var userPayload = request.payload;
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
            if (userData && userData.id) {
                Controller.SellerController.blockUnblockSeller(userPayload, function (err, data) {
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
                    sellerId:Joi.string().required(),
                    blockUnblock:Joi.string().required().valid(["block","unblock"])
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
        path: '/admin/repostResponse',
        handler: function (request, reply) {
            var userPayload = request.payload;
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
            if (userData && userData.id) {
                Controller.ProductController.repostResponse(userPayload, function (err, data) {
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
            description: 'approve and reject repost request',
            auth: 'UserAuth',
            tags: ['api', 'customer'],

            validate: {
                payload: {
                    productId: Joi.string().required(),
                    repostStatus: Joi.string().required().valid(["APPROVED","REJECT"])
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
        path: '/admin/deleteCategory',
        handler: function (request, reply) {
            var userPayload = request.payload;

            console.log("userdajkjkj",userPayload)
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
            if (userData && userData.id) {
                Controller.AdminController.deleteCategory(userPayload, userData, function (err, data) {
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
            description: 'delete category',
            auth: 'UserAuth',
            tags: ['api', 'admin'],
            /* payload: {
             maxBytes: 20000000,
             parse: true,
             output: 'file'
             },*/

            validate: {
                payload: {

                    categoryId:Joi.string().required(),
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
        path: '/admin/updateCategory',
        handler: function (request, reply) {
            var userPayload = request.payload;

            console.log("userdajkjkj",userPayload)
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
            if (userData && userData.id) {
                Controller.AdminController.updateCategory(userPayload, userData, function (err, data) {
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
            description: 'update category',
            auth: 'UserAuth',
            tags: ['api', 'admin'],
             payload: {
             maxBytes: 20000000,
             parse: true,
             output: 'file'
             },
            validate: {
                payload: {
                    categoryId:Joi.string().required(),
                    name: Joi.string().regex(/^[a-zA-Z ]+$/).trim().min(2).optional(),
                    description: Joi.string().optional().trim().optional(),
                    order:Joi.string().optional().trim().optional(),
                    image: Joi.any()
                        .meta({swaggerType: 'file'})
                        .optional()
                        .description('image file')
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
        path: '/admin/addSubCategory',
        handler: function (request, reply) {
            var userPayload = request.payload;
            console.log("userdajkjkj",userPayload)
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
            if (userData && userData.id) {
                Controller.AdminController.addSubCategory(userPayload, userData, function (err, data) {
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
            description: 'Register Category',
            auth: 'UserAuth',
            tags: ['api', 'admin'],
            payload: {
             maxBytes: 200000000,
             parse: true,
             output: 'file'
             },
            validate: {
                payload: {
                    categoryId: Joi.string().optional().trim().optional(),
                    name: Joi.string().regex(/^[a-zA-Z ]+$/).trim().min(2).required(),
                    description: Joi.string().optional().trim().optional(),
                    order:Joi.string().optional().trim().optional(),
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
                    payloadType : 'form',
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },
    {
        method: 'POST',
        path: '/admin/getSubCategory',
        handler: function (request, reply) {
            var userPayload = request.payload;
            console.log("userdajkjkj",userPayload)
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
            if (userData && userData.id) {
                Controller.AdminController.getSubCategory(userPayload, userData, function (err, data) {
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
            description: 'Register users',
            auth: 'UserAuth',
            tags: ['api', 'admin'],

            validate: {
                payload: {
                    //categoryId:Joi.string().required(),
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
        path: '/admin/deleteSubCategory',
        handler: function (request, reply) {
            var userPayload = request.payload;

            console.log("userdajkjkj",userPayload)
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
            if (userData && userData.id) {
                Controller.AdminController.deleteSubCategory(userPayload, userData, function (err, data) {
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
            description: 'delete category',
            auth: 'UserAuth',
            tags: ['api', 'admin'],


            validate: {
                payload: {
                    subCategoryId:Joi.string(),
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
        path: '/admin/updateSubCategory',
        handler: function (request, reply) {
            var userPayload = request.payload;

            console.log("userdajkjkj",userPayload)
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
            if (userData && userData.id) {
                Controller.AdminController.updateSubCategory(userPayload, userData, function (err, data) {
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
            description: 'update category',
            auth: 'UserAuth',
            tags: ['api', 'admin'],
             payload: {
             maxBytes: 20000000,
             parse: true,
             output: 'file'
             },

            validate: {
                payload: {
                    subCategoryId:Joi.string().required(),
                    name: Joi.string().regex(/^[a-zA-Z ]+$/).trim().min(2).optional(),
                    description: Joi.string().optional().trim().optional(),
                    order:Joi.string().optional().trim().optional(),
                    image: Joi.any()
                        .meta({swaggerType: 'file'})
                        .optional()
                        .description('image file')
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


    /* {
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
                     phoneNo: Joi.string().regex(/^[0-9]+$/).min(5).optional(),
                     deviceToken: Joi.string().optional().trim().allow(''),
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
 */
    /*{
        method: 'GET'
        , path: '/api/admin/getAllDrivers'
        , handler: function (request, reply) {
        var data = request.query;
        Controller.AdminController.getDriver(data, function (err, data) {
            if (err) {
                reply(UniversalFunctions.sendError(err));
            } else {
                reply(UniversalFunctions.sendSuccess(null, data))
            }
        });
    }, config: {
        description: 'Get List Of Drivers',
        tags: ['api', 'admin'],
        validate: {
            query: {
                phoneNo: Joi.string().regex(/^[0-9]+$/).optional().length(10),
                email: Joi.string().email().optional(),
                appVersion: Joi.string().optional().trim(),
                deviceToken: Joi.string().optional().trim(),
                deviceType: Joi.string().optional().valid([UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.DEVICE_TYPES.ANDROID, UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.DEVICE_TYPES.IOS]),
                emailVerified: Joi.boolean().optional(),
                wheelChairAccessibilityVan: Joi.boolean().optional(),
                availabilityStatus: Joi.boolean().optional(),
                isBlocked: Joi.boolean().optional(),
                limit: Joi.number().integer().optional(),
                skip: Joi.number().integer().optional()
            },
            failAction: UniversalFunctions.failActionFunction
        },
        plugins: {
            'hapi-swagger': {
                responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
            }
        }
    }
    },*/
    {
        method: 'PUT'
        , path: '/admin/updateCustomer'
        , handler: function (request, reply) {
        var payloadData = request.payload;
        var phoneNo = request.query.phoneNo;
        Controller.AdminController.updateCustomer(phoneNo, payloadData, function (err, data) {
            if (err) {
                reply(UniversalFunctions.sendError(err));
            } else {
                reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.UPDATED, data))
            }
        });

    }, config: {
        description: 'Update Customer',
        tags: ['api', 'admin', 'customer'],
        validate: {
            query: {
                phoneNo: Joi.string().optional().min(10).trim()
            },
            payload: {
                name: Joi.string().regex(/^[a-zA-Z ]+$/).optional().trim(),
                email: Joi.string().email().optional().trim(),
                phoneNo: Joi.string().optional().min(10).trim(),
                deviceType: Joi.string().optional().valid([UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.DEVICE_TYPES.IOS, UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.DEVICE_TYPES.ANDROID]),
                deviceToken: Joi.string().optional().trim(),
                appVersion: Joi.string().optional().trim(),
                isBlocked: Joi.boolean().optional()
           },
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
        method: 'GET',
        path:  '/admin/getAllUser',
        handler: function (request, reply) {
            var payloadData = request.query;
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
            console.log("userdat.......",userData)
            Controller.UserController.getAllUser(payloadData, userData,function (err, data) {
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
        method: 'POST',
        path: '/admin/blockUnblockCategory',
        handler: function (request, reply) {
            var userPayload = request.payload;
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
            if (userData && userData.id) {
                Controller.AdminController.blockUnblockCategory(userPayload, function (err, data) {
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
                    categoryId:Joi.string().required(),
                    blockUnblock:Joi.string().required().valid(["block","unblock"])
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
        path: '/admin/blockUnblockSubCategory',
        handler: function (request, reply) {
            var userPayload = request.payload;
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
            if (userData && userData.id) {
                Controller.AdminController.blockUnblockSubCategory(userPayload, function (err, data) {
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
                    subCategoryId:Joi.string().required(),
                    blockUnblock:Joi.string().required().valid(["block","unblock"])
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
        path: '/admin/orderlisting',
        handler: function (request, reply) {
            var payloadData = request.query;
            var userData = request.auth && request.auth.credentials && request.auth.credentials.userData;
            console.log("userdat.......",payloadData)
            Controller.SellerController.orderlisting( payloadData,userData,function (err, data) {
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
                    Order_status:Joi.string().optional(),
                    Order_ID:Joi.string().optional(),
                    startDate:Joi.string().optional(),
                    endDate:Joi.string().optional(),
                    pageNo:Joi.string().required(),
                    status: Joi.string().optional().valid(['all','repost'])
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
    },    /*{
        method: 'GET'
        , path: '/api/admin/getAppVersion'
        , handler: function (request, reply) {
        var appType = request.query.appType;
        Controller.AppVersionController.getAppVersion(appType, function (err, data) {
            if (err) {
                reply(UniversalFunctions.sendError(err));
            } else {
                reply(UniversalFunctions.sendSuccess(null, data))
            }
        });
    }, config: {
        description: 'Get App Version',
        tags: ['api', 'admin'],
        validate: {
            query: {
                appType: Joi.string().required().valid([
                    UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.USER_ROLES.CUSTOMER,
                    UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.USER_ROLES.DRIVER
                ])
            },
            failAction: UniversalFunctions.failActionFunction
        },
        plugins: {
            'hapi-swagger': {
                responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
            }
        }
    }
    },*/
   /* {
        method: 'PUT',
        path: '/api/admin/updateAppVersion',
        handler: function (request, reply) {
        var payloadData = request.payload;
        Controller.AppVersionController.updateAppVersion(payloadData, function (err, data) {
            if (err) {
                reply(UniversalFunctions.sendError(err));
            } else {
                reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.UPDATED, data))
            }
        });

    }, config: {
        description: 'Update App Version',
        tags: ['api', 'admin'],
        validate: {
            payload: {
                latestCriticalVersion: Joi.string().optional(),
                latestUpdatedVersion: Joi.string().optional(),
                deviceType: Joi.string().required().valid([
                    UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.DEVICE_TYPES.IOS,
                    UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.DEVICE_TYPES.ANDROID
                ]),
                appType: Joi.string().required().valid([
                    UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.USER_ROLES.CUSTOMER,
                    UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.USER_ROLES.DRIVER
                ])
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
    }*/
    /*,
    {
        method: 'PUT'
        , path: '/api/admin/updateDriver'
        , handler: function (request, reply) {
        var payloadData = request.payload;
        var phoneNo = request.query.phoneNo;
        Controller.AdminController.updateDriver(phoneNo, payloadData, function (err, data) {
            if (err) {
                reply(UniversalFunctions.sendError(err));
            } else {
                reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.UPDATED, data))
            }
        });

    }, config: {
        description: 'Update Driver',
        tags: ['api', 'admin', 'driver'],
        validate: {
            query: {
                phoneNo: Joi.string().regex(/^[0-9]+$/).length(10).required()
            },
            payload: {
                name: Joi.string().regex(/^[a-zA-Z ]+$/).optional().trim(),
                email: Joi.string().email().optional(),
                password: Joi.string().optional().length(3),
                phoneNo: Joi.string().regex(/^[0-9]+$/).length(10).optional().trim(),
                deviceType: Joi.string().optional().valid([UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.DEVICE_TYPES.IOS, UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.DEVICE_TYPES.ANDROID]),
                deviceToken: Joi.string().optional().trim(),
                appVersion: Joi.string().optional().trim(),
                isBlocked: Joi.boolean().optional(),
                wheelChairAccessibilityVan: Joi.boolean().optional(),
                emailVerified: Joi.boolean().optional(),
            },
            failAction: UniversalFunctions.failActionFunction
        },
        plugins: {
            'hapi-swagger': {
                responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
            }
        }
    }
    }*/
];

var adminLogin = [
    {
        method: 'PUT'
        , path: '/admin/logout'
        , handler: function (request, reply) {
        var token = request.auth.credentials.token;
        var userData = request.auth.credentials.userData;
        if (!token) {
            reply(UniversalFunctions.sendError(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_TOKEN));
        } else if (userData && userData.role != UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.USER_ROLES.ADMIN) {
            reply(UniversalFunctions.sendError(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.UNAUTHORIZED))
        } else {
            Controller.AdminController.adminLogout(token, function (err, data) {
                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess())
                }
            });

        }
    }, config: {
        description: 'Logout for Super Admin',
        tags: ['api', 'admin'],
        validate: {
            failAction: UniversalFunctions.failActionFunction
        },
        plugins: {
            'hapi-swagger': {
                responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
            }
        }
    }
    }
];


var authRoutes = [].concat(userRoutes, adminLogin);

module.exports = authRoutes.concat(non_auth_routes);