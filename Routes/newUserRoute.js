var Controller = require('../Controllers');
var UniversalFunctions = require('../Utils/UniversalFunctions');
var Joi = require('joi');

module.exports = [

    {
        method: 'POST',
        path: '/Users/Register',
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
                    name: Joi.string().regex(/^[a-zA-Z ]+$/).trim().required(),
                    email: Joi.string().email().required(),
                    password: Joi.string().optional().trim(),
                    countryName: Joi.string().optional().trim(),
                    profilePic: Joi.any().meta({swaggerType: 'file'}).required().description('image file')
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
        path: '/Users/login',
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
                    password: Joi.string().required().trim(),
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