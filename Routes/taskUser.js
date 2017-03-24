var Controller = require('../Controllers');
var UniversalFunctions = require('../Utils/UniversalFunctions');
var Joi = require('joi');


module.exports = [
    {
        method: 'POST',
        path: '/Users/register',
        handler: function (request, reply) {
            var payloadData = request.payload;

            Controller.taskUserController.createUser(payloadData, function (err, data) {
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

            validate: {
                payload: {
                    name: Joi.string().trim().min(2).required(),
                    email: Joi.string().email().required(),
                    password: Joi.string().required().trim(),
                    gender: Joi.string().required().valid(['male', 'female']),
                    dateOfBirth: Joi.string().required(),
                    addressLine: Joi.string().optional().trim(),
                    city: Joi.string().required().trim(),
                    state: Joi.string().optional().trim(),
                    countryName: Joi.string().optional().trim(),
                    zipcode: Joi.string().optional().trim(),
                    phoneNo: Joi.string().optional().trim(),
                    hobbies:Joi.string().required().trim(),
                    latitude:Joi.string().required().trim(),
                    longitude:Joi.string().required().trim()
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
        path: '/Users/login',
        handler: function (request, reply) {
            var payloadData = request.payload;
            Controller.taskUserController.loginUsers(payloadData, function (err, data) {
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
                    password: Joi.string().required().trim(),
                    clatitude: Joi.string().required().trim(),
                    clongitude: Joi.string().required().trim(),
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
        path: '/Users/updateLocation',
        handler: function (request, reply) {
            var userPayload = request.payload;
            console.log("....",request.payload);
            if (userPayload) {
                Controller.taskUserController.updateLocation(userPayload,  function (err, data) {
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
            description: 'Update location of User',
            tags: ['api', 'customer'],

            validate: {
                payload: {
                    clatitude: Joi.string().required().trim(),
                    clongitude: Joi.string().required().trim(),
                    accessToken: Joi.string().required().trim(),
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
        path: '/Users/fetchClubs',
        handler: function (request, reply) {
            var userPayload = request.payload;
            console.log(".................",userPayload);
            if (userPayload) {
                Controller.taskUserController.fetchplaces(userPayload, function (err, data) {
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
            description: 'Update location of User',

            tags: ['api', 'customer'],

            validate: {
                payload: {
                    clatitude: Joi.string().required().trim(),
                    clongitude: Joi.string().required().trim(),
                   // accessToken: Joi.string().optional().trim(),
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
        path: '/watch/Users/getClubs',
        handler: function (request, reply) {
            var userPayload = request.payload;
            console.log(".................",userPayload);
            if (userPayload){
                Controller.taskUserController.getPlaces(userPayload, function (err, data) {
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
            description: 'gives stored db places',

            tags: ['api', 'customer'],

            validate: {
                payload: {

                    // accessToken: Joi.string().optional().trim(),
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
        path: '/Users/CheckIn',
        handler: function (request, reply) {
            var userPayload = request.payload;
            console.log(".................",userPayload);
            if (userPayload){
                Controller.taskUserController.checkIn(userPayload, function (err, data) {
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
            description: 'gives stored db places',

            tags: ['api', 'customer'],

            validate: {
                payload: {
                    barID: Joi.string().required().trim(),
                    accessToken: Joi.string().required().trim(),
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
        path: '/Users/CheckOut',
        handler: function (request, reply) {
            var userPayload = request.payload;
            console.log(".................", userPayload);
            if (userPayload) {
                Controller.taskUserController.checkOut(userPayload,function (err, data) {
                    if (err) {
                        reply(UniversalFunctions.sendError(err));
                    } else {
                        reply(UniversalFunctions.sendSuccess(null, data))
                    }
                });

            }
            else {
                reply(UniversalFunctions.sendError(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR));
            }
        },
            config: {
            description: 'gives stored db places',

            tags: ['api', 'customer'],

            validate: {
                payload: {
                    barID: Joi.string().required().trim(),
                    checkinID: Joi.string().required().trim(),
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
    }

    ];