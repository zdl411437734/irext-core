/**
 * Created by Strawmanbobi
 * 2016-11-27
 */

var Constants = require('../mini_poem/configuration/constants');

var Admin = require('../model/admin_dao.js');
var AdminAuth = require('../authority/admin_auth.js');
var MD5 = require('../mini_poem/security/md5.js');
var StringUtils = require('../mini_poem/utils/string_utils.js');
var nodemailer = require('nodemailer');

var Enums = require('../constants/enums.js');
var ErrorCode = require('../constants/error_code.js');
var logger = require('../mini_poem/logging/logger4js').helper;

var enums = new Enums();
var errorCode = new ErrorCode();

var adminAuth = new AdminAuth(REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, null);

exports.adminLoginWorkUnit = function (userName, password, callback) {
    var conditions = {
        user_name: userName,
        password: password
    };
    Admin.findAdminsByConditions(conditions, 0, 1, "id", function(findAdminErr, admins) {
        if (findAdminErr.code == errorCode.SUCCESS.code &&
            null != admins && admins.length > 0) {
            // add information of this user into cache
            var userID,
                token,
                key,
                ttl = 24 * 60 * 60 * 14,
                timeStamp,
                admin;

            admin = admins[0];
            timeStamp = new Date().getTime();
            token = MD5.MD5(password  + timeStamp);
            token += "," + admin.permissions;
            key = "admin_" + admin.id;
            adminAuth.setAuthInfo(key, token, ttl, function(setAdminAuthErr) {
                admin.token = token;
                callback(setAdminAuthErr, admin);
            });
        } else {
            callback(errorCode.AUTHENTICATION_FAILURE, null);
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

exports.sendChangePwMailWorkUnit = function (userName, callback) {
    var conditions = {
        user_name: userName
    };
    Admin.findAdminsByConditions(conditions, 0, 1, "id", function(getAdminErr, admins) {
        if (errorCode.SUCCESS.code == getAdminErr.code && undefined != admins && null != admins && admins.length > 0) {
            var admin = admins[0];
            var userEmail = admin.user_name;
            var sendEmailErr;
            var newPw = StringUtils.randomNumber(6);
            var timeStamp = new Date().getTime();
            var passwdKey = MD5.MD5(userName.toString() + timeStamp);
            var passwdMD5 = MD5.MD5(newPw, true).toUpperCase();
            var ttl = 2 * 60 * 60;

            // save password fetch key and password MD5 value to cache first
            var smtpTransport = nodemailer.createTransport("SMTP", {
                host: "smtp.163.com",
                name: "",
                secureConnection: true,
                use_authentication: true,
                port: 465,
                auth: {
                    user: "strawmanbobi@163.com",
                    pass: "Fs11233209."
                }
            });
            adminAuth.setAuthInfo(passwdKey, passwdMD5, ttl, function(setPasswordAuthErr) {
                if (setPasswordAuthErr.code == errorCode.SUCCESS.code) {
                    logger.info("save temp password successfully, continue process email post");
                    // send email to notify user
                    smtpTransport.sendMail({
                        from : "strawmanbobi@163.com",
                        to : userEmail ,
                        subject: "分配新密码",
                        generateTextFromHTML : true,
                        html: "<html><body style='font-family: 微软雅黑; font-size: 14px;'>"+
                        "<p>Yo-- 这是 irext 数据中心为您随机分配的新密码，请牢记之后，点击它表示确认 &lt;(￣︶￣)&gt;</p>" +
                        "<a target='_blank' href='http://"+MAIN_SERVER_ADDRESS+":"+MAIN_SERVER_PORT+
                        "/irext/certificate/confirm_pw?id="+ admin.id +
                        "&key="+passwdKey+"&password="+newPw+"'><b>" + newPw + "</b></a></body></html>"
                    }, function(error, response) {
                        if(error) {
                            sendEmailErr = errorCode.FAILED;
                            logger.info("send change password email failed :" + error);
                            logger.info(sendEmailErr+"  userLogic.....");
                            callback(sendEmailErr);
                        } else {
                            sendEmailErr = errorCode.SUCCESS;
                            logger.info("change password email send successfully : " + response.message);
                            logger.info(sendEmailErr+"  userLogic.....");
                            callback(sendEmailErr);
                        }
                        smtpTransport.close();
                    });
                } else {
                    logger.info("failed to save temp password");
                    callback(setPasswordAuthErr);
                }
            });
        } else {
            logger.info("no admin info found");
            callback(errorCode.FAILED);
        }
    });
};

exports.confirmPasswordWorkUnit = function(id, fetchKey, callback) {
    adminAuth.getAuthInfo(fetchKey, function(getAuthInfoErr, result) {
        if (errorCode.SUCCESS.code == getAuthInfoErr.code) {
            logger.info("succeeded to fetch ciphered password value " + result);
            Admin.updatePasswordByID(id, result, function(updateAdminErr, updatedAdmin) {
                callback(updateAdminErr);
            });
        } else {
            logger.info("failed to fetch ciphered password value");
            callback(errorCode.FAILED);
        }
    });
};