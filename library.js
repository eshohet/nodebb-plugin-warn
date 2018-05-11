"use strict";

const controllers = require('./lib/controllers');
const SocketPlugins = module.parent.require('./socket.io/plugins');
const async = require('async');
const user = module.parent.require('./user');
const posts = module.parent.require('./posts');
const notifications = module.parent.require('./notifications');

let plugin = {};

plugin.init = function (params, callback) {
    const router = params.router,
        hostMiddleware = params.middleware,
        hostControllers = params.controllers;

    // We create two routes for every view. One API call, and the actual route itself.
    // Just add the buildHeader middleware to your route and NodeBB will take care of everything for you.

    router.get('/admin/plugins/quickstart', hostMiddleware.admin.buildHeader, controllers.renderAdminPage);
    router.get('/api/admin/plugins/quickstart', controllers.renderAdminPage);

    SocketPlugins.warn = {
        addWarn: (socket, data, callback) => {
            if (!data.pid) {
                return callback(new Error('Cannot warn on an invalid post'));
            }
            async.waterfall([
                    (callback) => {
                        user.isAdminOrGlobalMod(socket.uid, callback);
                    },
                    (isAdminOrGlobalMod, callback) => {
                        if (!isAdminOrGlobalMod) {
                            return callback(new Error('Action not allowed'));
                        }
                        else {
                            callback();
                        }
                    },
                    (callback) => {
                        posts.delete(data.pid, socket.uid);
                        callback();
                    }
                ], (error, results) => {

                    if (!error) {
                        notifications.create({
                            nid: 'plugin:warn:' + data.pid,
                            bodyShort: 'Your post violates our rules and has been deleted',
                            path: '/post/' + data.pid,
                            from: socket.uid
                        }, (error, notification) => {
                            if(error) {
                                return callback(error);
                            }

                            notifications.push(notification, data.uid, () => {
                                callback();
                            })
                        });
                    }
                }
            );


        }
    };
    callback();
};

plugin.addAdminNavigation = function (header, callback) {
    header.plugins.push({
        route: '/plugins/quickstart',
        icon: 'fa-tint',
        name: 'Quickstart'
    });

    callback(null, header);
};

plugin.addModeratorButton = (data, callback) => {
    console.log(data);
    callback();
};


module.exports = plugin;
