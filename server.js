
'use strict';

var Hapi = require('hapi');
var Routes = require('./Routes');
var Bootstrap = require('./Utils/BootStrap');
//var Plugins = require('./Plugins');
const Inert = require('inert');
const Vision = require('vision');
const HapiSwagger = require('hapi-swagger');
const Pack = require('./package');
var mongoose = require('mongoose');
var Plugins = require('./Plugins');
var univ=require('./Utils/UniversalFunctions')
//var Model=require('./Models');
mongoose.Promise = global.Promise;
var moment=require('moment');
var path=require('path');
var server = new Hapi.Server();
server.connection({ port: 4001,
    routes: { cors: true }});
mongoose.connect('mongodb://localhost/swimpy');
//mongoose.connect('http://localhost:9200/');

/*
server.route(
    {
        method: 'GET',
        path: '/',
        handler: function (req, res) {
            //TODO Change for production server
            directory:{
            path: './uploads/eveTask',
            listing: false,
            index: true
        }
    }
    }
    
);*/



/*var thumbnail = require('quicklook-thumbnail');

var options1 = {
    size: 256,
    folder: '/home/cbl34/Desktop/daya/video '
};

thumbnail.create('/home/cbl34/Desktop/daya/video/4sharedscraper.mp4 ', options1, function(err, result){
    console.log("Created thumbnail at: " + result);
})*/


const options = {
    info: {
        'title': 'Test API Documentation',
        'version': Pack.version
    }
};


server.register([
    Inert,
    Vision,
    {
        'register': HapiSwagger,
        'options': options
    }], function (err) {


    if (err){
        server.error('Error while loading plugins : ' + err)
    }else {
        server.log('info','Plugins Loaded')
    }
});


server.register(Plugins, function (err) {
    if (err){
        server.error('Error while loading plugins : ' + err)
    }else {
        server.log('info','Plugins Loaded')
    }
});
var d = new Date();
var e=moment();
console.log("d...........",d,e)
var n = d.getMilliseconds();

console.log("random",n)
server.register(Inert, function(err){
    if(err){
        throw err;
    }
    console.log(".................here.......");
    server.route(Routes);
    console.log("..............passed.........");
});

Bootstrap.connectSocket(server);

Bootstrap.bootstrapAdmin(function (err, message) {
    if (err) {
        console.log('Error while bootstrapping admin : ' + err)
    } else {
        console.log(message);
    }
});



server.start(
    console.log("server is running"),
    console.log('Server running at:', server.info.uri)
);
