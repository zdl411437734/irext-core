/**
 * Created by Strawmanbobi
 * 2016-11-27
 */

require('../mini_poem/configuration/constants');

var AdminAuth = require('../authority/admin_auth.js');
var MD5 = require('../mini_poem/crypto/md5.js');
var RequestSender = require('../mini_poem/http/request.js');

var Enums = require('../constants/enums.js');
var ErrorCode = require('../constants/error_code.js');
var logger = require('../mini_poem/logging/logger4js').helper;

var enums = new Enums();
var errorCode = new ErrorCode();

var adminAuth = new AdminAuth(REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, null);

var signInService = "/irext/certificate/admin_login";
var changePwService = "/irext/certificate/change_pw";

exports.adminLoginWorkUnit = function (userName, password, callback) {
    var queryParams = new Map();

    var requestSender =
        new RequestSender(EXTERNAL_SERVER_ADDRESS,
            EXTERNAL_SERVER_PORT,
            signInService,
            queryParams);

    var signinInfo = {
        user_name : userName,
        password : password
    };
    requestSender.sendPostRequest(signinInfo,
        function(signInRequestErr, signInResponse) {
            if (signInRequestErr == errorCode.SUCCESS.code && null != signInResponse) {
                var resp = JSON.parse(signInResponse);
                if (undefined != resp.entity) {
                    var admin = resp.entity;
                    var token,
                        key,
                        ttl = 24 * 60 * 60 * 14,
                        timeStamp,
                        name;
                    timeStamp = new Date().getTime();
                    token = admin.token;
                    key = "admin_" + admin.id;
                    adminAuth.setAuthInfo(key, token, ttl, function(setAdminAuthErr) {
                        if (errorCode.SUCCESS.code == setAdminAuthErr.code) {
                            key = "admin_name_" + admin.id;
                            name = admin.user_name;
                            adminAuth.setAuthInfo(key, name, ttl, function(setAdminNameErr) {
                                if (errorCode.SUCCESS.code == setAdminNameErr.code) {
                                    admin.token = token;
                                }
                                callback(setAdminNameErr, admin);
                            });
                        }
                    });
                } else {
                    callback(errorCode.FAILED, null);
                }
            } else {
                logger.error("admin sign in failed");
                callback(errorCode.FAILED, null);
            }
        });
};

exports.verifyTokenWorkUnit = function (id, token, callback) {
    var key = "admin_" + id;
    adminAuth.validateAuthInfo(key, token, function(validateAdminAuthErr, result) {
        if (validateAdminAuthErr.code == errorCode.SUCCESS.code) {
            logger.info("token validation successfully");
        } else {
            logger.info("token validation failed");
        }
        callback(validateAdminAuthErr);
    });
};

exports.verifyTokenWithPermissionWorkUnit = function (id, token, permissions, callback) {
    var key = "admin_" + id;
    adminAuth.validateAuthInfo(key, token, function(validateAdminAuthErr, result) {
        if (validateAdminAuthErr.code == errorCode.SUCCESS.code) {
            logger.info("token validation successfully");
            if (undefined != result && null != result && "" != result) {
                if (result.indexOf(permissions) != -1) {
                    callback(errorCode.SUCCESS);
                } else {
                    logger.info("permission do not match");
                    callback(errorCode.AUTHENTICATION_FAILURE);
                }
            }
        } else {
            logger.info("token validation failed");
            callback(validateAdminAuthErr);
        }
    });
};

exports.sendChangePwMailWorkUnit = function (userName, callbackURL, callback) {
    var queryParams = new Map();

    var requestSender =
        new RequestSender(EXTERNAL_SERVER_ADDRESS,
            EXTERNAL_SERVER_PORT,
            changePwService,
            queryParams);

    var userInfo = {
        user_name : userName,
        callback_url :callbackURL
    };
    requestSender.sendPostRequest(userInfo,
        function(changePwRequestErr, changePwResponse) {
            if (changePwRequestErr == errorCode.SUCCESS.code && null != changePwResponse) {
                var resp = JSON.parse(changePwResponse);
                if (undefined != resp.status && errorCode.SUCCESS == resp.status) {
                    callback(errorCode.SUCCESS);
                } else {
                    callback(errorCode.FAILED);
                }
            } else {
                callback(errorCode.FAILED);
            }
        });
};