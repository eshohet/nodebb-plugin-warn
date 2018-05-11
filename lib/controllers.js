'use strict';

let Controllers = {};

Controllers.renderAdminPage = function (req, res, next) {
    res.render('admin/plugins/quickstart', {});
};

module.exports = Controllers;
