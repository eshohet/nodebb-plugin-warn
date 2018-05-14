"use strict";

const SocketPlugins = module.parent.require('./socket.io/plugins');
const async = require('async');
const user = module.parent.require('./user');
const posts = module.parent.require('./posts');
const notifications = module.parent.require('./notifications');

let plugin = {};

plugin.init = function (params, callback) {
    SocketPlugins.warn = {
        addWarn: (socket, data, callback) => {
            if (!data.pid) {
                return callback('Cannot warn on an invalid post');
            }
            async.waterfall([
                (callback) => {
                    user.isAdminOrGlobalMod(socket.uid, callback);
                },
                (isAdminOrGlobalMod, callback) => {
                    if (isAdminOrGlobalMod === false) {
                        callback('Action not allowed');
                    }
                    else {
                        callback();
                    }
                },
                (callback) => {
                    posts.delete(data.pid, socket.uid, callback);
                },
            ], (error, success) => {
                if(error)
                    callback(error);
                else
                {
                    notifications.create({
                        nid: 'plugin:warn:' + data.pid,
                        bodyShort: 'Your post violates our rules and has been deleted',
                        path: '/post/' + data.pid,
                        from: socket.uid
                    }, (error, notification) =>  {
                        notifications.push(notification, data.uid);
                        callback(error, error ? null : "ok");
                    });
                }
            });
        }
    };
    callback();
};

plugin.addModeratorButton = (data, callback) => {
    console.log(data);
    callback();
};


module.exports = plugin;
