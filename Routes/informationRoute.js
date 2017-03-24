var Controller = require('../Controllers');
var UniversalFunctions = require('../Utils/UniversalFunctions');
var Joi = require('joi');

module.exports = [

    {
        method: 'POST',
        path: '/GeoBasedApp/getDistance',
        handler: function (request, reply) {
            var payloadData = request.payload;
            console.log("........payload....",payloadData);
            Controller.informationController.calculateDistance(payloadData, function (err, data) {

                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess("information retrived", data));
                }
            });
        },
        config: {
            description: 'calculate distance by lat and log',
            tags: ['api', 'geo'],

            validate: {
                payload: {
                    startLatitude: Joi.string().trim().required(),
                    startLongitude: Joi.string().trim().required(),
                    stopLatitude: Joi.string().trim().required(),
                    stopLongitude: Joi.string().trim().required(),
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
        path: '/GeoBasedApp/fetchAddress',
        handler: function (request, reply) {
            var payloadData = request.payload;
            console.log("........payload....",payloadData);
            Controller.informationController.fetchAddress(payloadData, function (err, data) {

                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess("information retrived", data));
                }
            });
        },
        config: {
            description: 'fetch address by lat and log',
            tags: ['api', 'geo'],

            validate: {
                payload: {
                    Latitude: Joi.string().trim().required(),
                    Longitude: Joi.string().trim().required(),
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
        path: '/GeoBasedApp/fetchLattitudeLongitude',
        handler: function (request, reply) {
            var payloadData = request.payload;
            console.log("........payload....",payloadData);
            Controller.informationController.fetchLatLong(payloadData, function (err, data) {

                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess("information retrived", data));
                }
            });
        },
        config: {
            description: 'fetch lat and log by address',
            tags: ['api', 'geo'],

            validate: {
                payload: {
                    Address: Joi.string().trim().required(),
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
        path: '/SMS/SendSMS',
        handler: function (request, reply) {
            var payloadData = request.payload;
            console.log("........payload....",payloadData);
            Controller.informationController.sendSms(payloadData, function (err, data) {

                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess("information retrived", data));
                }
            });
        },
        config: {
            description: 'send SMS to user',
            tags: ['api', 'sms'],

            validate: {
                payload: {
                    message: Joi.string().trim().required(),
                    number: Joi.string().trim().required(),
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
        path: '/pushNotifications',
        handler: function (request, reply) {
          
            Controller.informationController.pushNote( function (err, data) {

                if (err) {
                    reply(UniversalFunctions.sendError(err));
                } else {
                    reply(UniversalFunctions.sendSuccess("information retrived", data));
                }
            });
        },
        config: {
            description: 'send notification to device',
            tags: ['api', 'notification'],

            validate: {
                payload: {
                  
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