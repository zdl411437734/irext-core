/**
 * Created by strawmanbobi
 * 2016-11-27
 */

// system inclusion
var constants = require('../mini_poem/configuration/constants');

// local inclusion
var ServiceResponse = require('../response/service_response.js');
var LoginResponse = require('../response/login_response.js');

var logger = require('../mini_poem/logging/logger4js').helper;

var certificateLogic = require('../work_unit/certificate_logic.js');

var Enums = require('../constants/enums');
var ErrorCode = require('../constants/error_code');

var enums = new Enums();
var errorCode = new ErrorCode();

/*
 * function :   Admin Login
 * parameter :  user_name in request body
 *              password in request body
 * return :     ServiceResponse
 */
exports.adminLogin = function (req, res) {
    var admin = req.body;
    var userName = admin.user_name;
    var password = admin.password;

    var loginResponse = new LoginResponse();
    certificateLogic.adminLoginWorkUnit(userName, password, function (adminLoginErr, admin) {
        logger.info("admin login successfully, entity = " + JSON.stringify(admin));
        loginResponse.status = adminLoginErr;
        loginResponse.entity = admin;
        res.send(loginResponse);
        res.end();
    });
};

/*
 * function :   Verify Token
 * parameter :  id parameter of token KV
 *              token parameter of token KV
 * return :     ServiceResponse
 */
exports.verifyToken = function (req, res) {
    var bodyParam = req.body;
    var id = bodyParam.id;
    var token = bodyParam.token;

    var serviceResponse = new ServiceResponse();
    certificateLogic.verifyTokenWorkUnit(id, token, function (verifyTokenErr) {
        serviceResponse.status = verifyTokenErr;
        res.send(serviceResponse);
        res.end();
    });
};

/*
 * function :   Change password
 * parameter :  id parameter of token KV
 *              token parameter of token KV
 * return :     ServiceResponse
 */
exports.changePassword = function (req, res) {
    var bodyParam = req.body;
    var userName = bodyParam.user_name;

    var serviceResponse = new ServiceResponse();
    certificateLogic.sendChangePwMailWorkUnit(userName, function (changePWErr) {
        serviceResponse.status = changePWErr;
        res.send(serviceResponse);
        res.end();
    });
};

/*
 * function :   Confirm password change
 * parameter :  id of Adminstrator
 *              new password fetch ID
 * return :     redirection to irext data center
 */
exports.confirmPassword = function (req, res) {
    var id = req.query.id;
    var fetchKey = req.query.key;
    var password = req.query.password;

    var serviceResponse = new ServiceResponse();
    certificateLogic.confirmPasswordWorkUnit(id, fetchKey, function (confirmPWErr) {
        if (errorCode.SUCCESS.code == confirmPWErr.code) {
            res.redirect("http://"+MAIN_SERVER_ADDRESS+":"+MAIN_SERVER_PORT+"/error/confirm_pw.html?password="+
                    password+"&result=1");
        } else {
            res.redirect("http://"+MAIN_SERVER_ADDRESS+":"+MAIN_SERVER_PORT+"/error/confirm_pw.html?result=0");
        }
    });
};