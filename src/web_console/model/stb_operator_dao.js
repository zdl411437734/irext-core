/**
 * Created by strawmanbobi
 * 2016-11-27
 */

// global inclusion
var orm = require('orm');
var dbOrm = require('../mini_poem/db/mysql/mysql_connection').mysqlDB;
var logger = require('../mini_poem/logging/logger4js').helper;

// local inclusion
var ErrorCode = require('../constants/error_code');
var errorCode = new ErrorCode();

var StbOperator = dbOrm.define('stb_operator',
    {
        id: Number,
        operator_id: String,
        operator_name: String,
        city_code: String,
        city_name: String,
        status: Number,
        operator_name_tw: String
    },
    {
        cache: false
    }
);

StbOperator.listStbOperators = function(conditions, from, count, sortField, callback) {
    if("id" == sortField && 0 != from) {
        conditions.id = orm.lt(from);
        StbOperator.find(conditions).limit(parseInt(count)).orderRaw("?? DESC", [sortField])
            .run(function (error, stbOperators) {
                if (error) {
                    logger.error("list stbOperators error : " + error);
                    callback(errorCode.FAILED, null);
                } else {
                    callback(errorCode.SUCCESS, stbOperators);
                }
            });
    } else {
        StbOperator.find(conditions).limit(parseInt(count)).offset(parseInt(from)).orderRaw("?? DESC", [sortField])
            .run(function (error, stbOperators) {
                if (error) {
                    logger.error("list stbOperators error : " + error);
                    callback(errorCode.FAILED, null);
                } else {
                    callback(errorCode.SUCCESS, stbOperators);
                }
            });
    }
};

StbOperator.findStbOperatorsByConditions = function(conditions, callback) {
    StbOperator.find(conditions, function (error, stbOperators) {
        if (error) {
            logger.error("find stbOperators error : " + error);
            callback(errorCode.FAILED, null);
        } else {
            callback(errorCode.SUCCESS, stbOperators);
        }
    });
};

module.exports = StbOperator;