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

var City = dbOrm.define('city',
    {
        id: Number,
        code: String,
        name: String,
        longitude: Number,
        latitude: Number,
        name_tw: String
    },
    {
        cache: false
    }
);

City.listProvinces = function(callback) {
    var error = errorCode.SUCCESS;
    dbOrm.driver.execQuery("SELECT * FROM city WHERE code LIKE '__0000'", function(getProvincesErr, result) {
            if (getProvincesErr) {
                logger.info("get provinces failed : " + getProvincesErr);
                error = errorCode.FAILED;
                callback(error,null);
            } else {
                callback(error, result);
            }
        }
    );
};

City.listCities = function(provincePrefix, callback) {
    var error = errorCode.SUCCESS;
    // dbOrm is object of ORM
    dbOrm.driver.execQuery("SELECT * FROM city WHERE code LIKE '" + provincePrefix + "__00' AND code NOT LIKE '__0000'", function(getCitiesErr, result) {
            if (getCitiesErr) {
                logger.info("get cities failed : " + getCitiesErr);
                error = errorCode.FAILED;
                callback(error,null);
            } else {
                callback(error, result);
            }
        }
    );
};

City.countCities = function(conditions, callback) {
    dbOrm.driver.execQuery("SELECT COUNT(id) AS number FROM city WHERE " + conditions,
        function (countCitiesErr, result) {
            if (countCitiesErr) {
                logger.info("count cities failed : " + countCitiesErr);
                callback(errorCode.FAILED, null);
            } else {
                callback(errorCode.SUCCESS, result);
            }
        });
};

City.findCitiesByConditions = function(conditions, from, count, sortField, callback) {
    if("id" == sortField && 0 != from) {
        conditions.id = orm.lt(from);
        City.find(conditions).limit(parseInt(count)).orderRaw("?? ASC", [sortField])
            .run(function (error, cities) {
                if (error) {
                    logger.error("find city error : " + error);
                    callback(errorCode.FAILED, null);
                } else {
                    callback(errorCode.SUCCESS, cities);
                }
            });
    } else {
        City.find(conditions).limit(parseInt(count)).offset(parseInt(from)).orderRaw("?? ASC", [sortField])
            .run(function (error, cities) {
                if (error) {
                    logger.error("find city error : " + error);
                    callback(errorCode.FAILED, null);
                } else {
                    callback(errorCode.SUCCESS, cities);
                }
            });
    }

};
module.exports = City;