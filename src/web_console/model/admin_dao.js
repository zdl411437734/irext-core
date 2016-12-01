/**
 * Created by strawmanbobi
 * 2016-11-12
 */

// global inclusion
var orm = require('../../../Infrastructure/BackEnd/node_modules/orm');
var dbOrm = require('../../../Infrastructure/BackEnd/db/mysql/mysql_connection').mysqlDB;
var logger = require('../../../Infrastructure/BackEnd/logging/logger4js').helper;

// local inclusion
var ErrorCode = require('../constants/error_code');
var errorCode = new ErrorCode();

var Admin = dbOrm.define('admin',
    {
        id: Number,
        user_name: String,
        password: String,
        permissions: String,
        admin_type: String
    },
    {
        cache: false
    }
);

Admin.findAdminsByConditions = function(conditions, from, count, sortField, callback) {
    if("id" == sortField && 0 != from) {
        conditions.id = orm.lt(from);
        Admin.find(conditions).limit(parseInt(count)).orderRaw("?? ASC", [sortField])
            .run(function (error, admins) {
                if (error) {
                    logger.error("find admin error : " + error);
                    callback(errorCode.FAILED, null);
                } else {
                    logger.info("find admin successfully, length of admins = " + admins.length);
                    callback(errorCode.SUCCESS, admins);
                }
            });
    } else {
        Admin.find(conditions).limit(parseInt(count)).offset(parseInt(from)).orderRaw("?? ASC", [sortField])
            .run(function (error, admins) {
                if (error) {
                    logger.error("find admin error : " + error);
                    callback(errorCode.FAILED, null);
                } else {
                    logger.info("find admin successfully, length of admins = " + admins.length);
                    callback(errorCode.SUCCESS, admins);
                }
            });
    }
};

Admin.updatePasswordByID = function(adminID, password, callback) {
    Admin.get(adminID, function(error, admin) {
        if (error) {
            logger.error("get admin failed in update password : " + error);
            callback(errorCode.SUCCESS, null);
        } else {
            admin.password = password;
            admin.save(function(error, savedAdmin) {
                if (error) {
                    logger.error("save admin failed in update password : " + error);
                    callback(errorCode.SUCCESS, null);
                } else {
                    logger.info("save admin successfully in update password");
                    callback(errorCode.SUCCESS, savedAdmin);
                }
            });
        }
    });
};

Admin.getAdminByID = function(adminID, callback) {
    Admin.get(adminID, function(error, admin) {
        if (error) {
            logger.error("get admin failed : " + error);
            callback(errorCode.FAILED, null);
        } else {
            logger.info("get admin successfully");
            callback(errorCode.SUCCESS, admin);
        }
    });
};

module.exports = Admin;