/**
 * Created by strawmanbobi
 * 2015-01-23
 */

// global inclusion
var orm = require('../../../Infrastructure/BackEnd/node_modules/orm');
var dbOrm = require('../../../Infrastructure/BackEnd/db/mysql/mysql_connection').mysqlDB;
var logger = require('../../../Infrastructure/BackEnd/logging/logger4js').helper;

// local inclusion
var ErrorCode = require('../configuration/error_code');
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
                    logger.info("list stbOperators successfully");
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
                    logger.info("list stbOperators successfully");
                    callback(errorCode.SUCCESS, stbOperators);
                }
            });
    }
};

module.exports = StbOperator;