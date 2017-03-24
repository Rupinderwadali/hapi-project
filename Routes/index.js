
'use strict';

//var AdminRoute = require('./AdminRoute');
//var newSellerRoute = require('./newSellerRoute');
var taskUser = require('./taskUser');
var taskAdmin=require('./taskAdmin');
//var newAdminRoute=require('./newAdminRoute');
//var informationRoute=require('./informationRoute');
//var eveTask=require('./eveTask');


var all = [].concat(taskAdmin,taskUser);
module.exports = all;

