var Controller = require('../Controllers');
var UniversalFunctions = require('../Utils/UniversalFunctions');
var Joi = require('joi');
var path=require('path');



module.exports = [

    {
        method: 'POST',
        path: '/task/Admin/AddCity',
        handler: function (request, reply) {
            var payloadData = request.payload;

            Controller.eveTaskController.addCity(payloadData, function (err, data) {
                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.CREATED, data)).code(201)
                }
            });
        },
        config: {
            description: 'Add city',
            tags: ['api', 'users'],
            validate: {
                payload: {
                    token:Joi.string().trim().required(),
                    cityName: Joi.string().trim().min(2).required(),
                    default:Joi.boolean().valid([true,false]).optional()
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
        path: '/task/Admin/AddCityPic',
        handler: function (request, reply) {
            var payloadData = request.payload;

            Controller.eveTaskController.addPic(payloadData, function (err, data) {
                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.CREATED, data)).code(201)
                }
            });
        },
        config: {
            description: 'add image to city ID',
            tags: ['api', 'users'],
            payload: {
                maxBytes: 2000000,
                parse: true,
                output: 'file'
             },
            validate: {
                payload: {
                   accessToken: Joi.string().trim().required(),
                   cityID:Joi.string().trim().required(),
                   cityPic: Joi.any().meta({swaggerType: 'file'}).optional().description('image file')
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
    path: '/task/Admin/Login',
    config: {
    description: 'Login for Super Admin',
        tags: ['api', 'admin'],
        handler: function (request, reply) {
        var payloadData =request.payload;
        Controller.eveTaskController.loginAdmin(payloadData, function (err, data) {
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
        path: '/task/Users/register',
        handler: function (request, reply) {
            var payloadData = request.payload;

            Controller.eveTaskController.createUser(payloadData, function (err, data) {
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
                    name:Joi.string().required(),
                    email: Joi.string().email().required(),
                    password: Joi.string().required().trim(),
                    city: Joi.string().required().trim(),
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


];