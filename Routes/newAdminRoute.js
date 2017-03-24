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
        Controller.AdminController.loginAdmin(payloadData, function (err, data) {
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
        path: '/Admin/AddCategory',
        config: {
            description: 'Admin can only add category',
            tags: ['api', 'admin','category'],
            handler: function (request, reply) {
                var payloadData =request.payload;
                Controller.AdminController.addCategory(payloadData, function (err, data) {
                    if (err) {
                        reply(UniversalFunctions.sendError(err))
                    } else {
                        console.log("")
                        reply(UniversalFunctions.sendSuccess(null, data))
                    }
                })
            },
            payload: {
                maxBytes: 20000000,
                parse: true,
                output: 'file'
            },
            validate: {
                payload: {
                    name: Joi.string().required(),
                    description: Joi.string().required(),
                    active:Joi.boolean().valid(true,false),
                    token:Joi.string().required(),
                    categoryPic: Joi.any().meta({swaggerType: 'file'}).required().description('image file')
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
    }

];