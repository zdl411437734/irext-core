/**
 * Created by Strawmanbobi
 * 2016-12-05
 */

// system inclusion
var constants = require('../mini_poem/configuration/constants');
var formidable = require('formidable');


/*
 * function :   Navigation to certain URL
 * parameter :  Name of page to navigate
 * return :     Redirect to the certain URL
 */
exports.navToURL = function(req, res) {
    var bodyParam = req.body;
    var page = bodyParam.page;
    res.redirect("/" + page);
};