var Controller = require('../Controllers');
var UniversalFunctions = require('../Utils/UniversalFunctions');
var Joi = require('joi');


module.exports=[

    {
        method: 'POST',
        path: '/Seller/Register',
        handler: function (request, reply) {
            var payloadData = request.payload;

            Controller.SellerController.createSeller(payloadData, function (err, data) {
                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.CREATED, data)).code(201)
                }
            });
        },
        config: {
            description: 'Register Seller',
            tags: ['api', 'seller'],

            validate: {
                payload: {
                    name: Joi.string().regex(/^[a-zA-Z ]+$/).trim().required(),
                    email: Joi.string().email().required(),
                    password: Joi.string().optional().trim(),
                    fullName:Joi.string().trim().required(),
                    addressLine1:Joi.string().trim().required(),
                    addressLine2:Joi.string().trim().optional(),
                    city:Joi.string().trim().required(),
                    state:Joi.string().trim().required(),
                    countryName:Joi.string().trim().required(),
                    zipCode:Joi.string().trim().required(),
                    phoneNo:Joi.string().trim().required()
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
        method:'POST',
        path:'/Seller/Login',
        handler:function (request,reply) {
            var data1 = request.payload;
            Controller.SellerController.loginSeller(data1, function (err, data) {
                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess(null, data))
                }
            });
        },
        config:{
            description:'Seller will Login here',
            tags:['api','seller','login'],
            validate: {
                payload: {
                    name: Joi.string().regex(/^[a-zA-Z ]+$/).trim().required(),
                    email: Joi.string().email().required(),
                    password: Joi.string().optional().trim()
                },
                failAction: UniversalFunctions.failActionFunction
            },
            plugins:{
                'hapi-swagger':{
                    payloadType:'form',
                    responseMessages:UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }

    }
];
