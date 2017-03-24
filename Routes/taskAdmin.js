var Controller = require('../Controllers');
var UniversalFunctions = require('../Utils/UniversalFunctions');
var Joi = require('joi');

module.exports=[

    {
        method: 'POST',
        path: '/Admin/Login',
        config: {
            description: 'Login for Super Admin',
            tags: ['api', 'admin'],
            handler: function (request, reply) {
                var payloadData =request.payload;
                Controller.taskAdminController.loginAdmin(payloadData, function (err, data) {
                    if (err) {
                        reply(UniversalFunctions.sendError(err))
                    } else {
                        reply(UniversalFunctions.sendSuccess(null, data))
                    }
                })
            },
            validate: {

                payload: {
                    email: Joi.string().email().required(),
                    password: Joi.string().required()
                },
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType:'form',
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },

    {
        method: 'POST',
        path: '/Admin/Show',
        config: {
            description: 'fetch people visiting places',
            tags: ['api', 'admin'],
            handler: function (request, reply) {
                var payloadData =request.payload;
                Controller.taskAdminController.show(payloadData, function (err, data) {
                    if (err) {
                        reply(UniversalFunctions.sendError(err))
                    } else {
                        reply(UniversalFunctions.sendSuccess(null, data))
                    }
                })
            },
            validate: {

                payload: {
                },
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType:'form',
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },

    {
        method: 'POST',
        path: '/Admin/filter',
        config: {
            description: 'filter places ',
            tags: ['api', 'admin'],
            handler: function (request, reply) {
                var payloadData =request.payload;
                Controller.taskAdminController.filter(payloadData, function (err, data) {
                    if (err) {
                        reply(UniversalFunctions.sendError(err))
                    } else {
                        reply(UniversalFunctions.sendSuccess(null, data))
                    }
                })
            },
            validate: {

                payload: {
                    age:Joi.number().optional(),
                    hobbies:Joi.string().optional(),
                    gender:Joi.string().valid(['male','female']),
                    barName:Joi.string().optional()
                },
                failAction: UniversalFunctions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType:'form',
                    responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },
];