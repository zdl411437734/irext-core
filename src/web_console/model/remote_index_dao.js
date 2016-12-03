/**
 * Created by strawmanbobi
 * 2016-11-27
 */

// global inclusion
var orm = require('../mini_poem/node_modules/orm');
var dbOrm = require('../mini_poem/db/mysql/mysql_connection').mysqlDB;
var logger = require('../mini_poem/logging/logger4js').helper;
var dateUtils = require('../mini_poem/utils/date_utils.js');

// local inclusion
var ErrorCode = require('../constants/error_code');
var Enums = require('../constants/enums');

var errorCode = new ErrorCode();
var enums = new Enums();

var RemoteIndex = dbOrm.define('remote_index',
    {
        id: Number,
        category_id: Number,
        category_name: String,
        brand_id: Number,
        brand_name: String,
        city_code: String,
        city_name: String,
        operator_id: String,
        operator_name: String,
        protocol: String,
        remote: String,
        remote_map: String,
        status: Number,
        sub_cate: Number,
        priority: Number,
        remote_number: String,
        operator_name_tw: String,
        category_name_tw: String,
        brand_name_tw: String,
        city_name_tw: String,
        binary_md5: String,
        input_source: String,
        update_time: String
    },
    {
        cache: false
    }
);

RemoteIndex.createRemoteIndex = function(remoteIndex, callback) {
    var date = dateUtils.formatDate(new Date(), "yyyy-MM-dd hh:mm:ss");
    var newRemoteIndex = new RemoteIndex({
        name: remoteIndex.name,
        category_id: remoteIndex.category_id,
        category_name: remoteIndex.category_name,
        brand_id: remoteIndex.brand_id,
        brand_name: remoteIndex.brand_name,
        city_code: remoteIndex.city_code,
        city_name: remoteIndex.city_name,
        operator_id: remoteIndex.operator_id,
        operator_name: remoteIndex.operator_name,
        // TODO: To form remoteMap sequence according to category and brand selected
        protocol: remoteIndex.protocol,
        remote: remoteIndex.remote,
        remote_map: remoteIndex.remote_map,
        priority: remoteIndex.priority,
        status: enums.ITEM_VERIFY,
        sub_cate: remoteIndex.sub_cate,
        remote_number: remoteIndex.remote_number,
        operator_name_tw: remoteIndex.operator_name_tw,
        category_name_tw: remoteIndex.category_name_tw,
        brand_name_tw: remoteIndex.brand_name_tw,
        city_name_tw: remoteIndex.city_name_tw,
        binary_md5: remoteIndex.binary_md5,
        input_source: remoteIndex.input_source,
        update_time: date
    });
    newRemoteIndex.save(function(error, createdRemoteIndex) {
        if(error) {
            logger.error('failed to create remoteIndex : ' + error);
            callback(errorCode.FAILED, null);
        } else {
            logger.info('succeeded to create remoteIndex');
            callback(errorCode.SUCCESS, createdRemoteIndex);
        }
    });
};

RemoteIndex.deleteRemoteIndex = function(remoteIndexID, callback) {
    RemoteIndex.get(remoteIndexID, function (err, remoteIndex) {
        if (null != remoteIndex) {
            remoteIndex.remove(function (err) {
                if(err) {
                    logger.error('failed to remove remote index ' + remoteIndexID);
                    callback(errorCode.FAILED);
                } else {
                    logger.error('remove remote index successfully ' + remoteIndexID);
                    callback(errorCode.SUCCESS);
                }
            });
        } else {
            logger.error('remove remote index successfully ' + remoteIndexID);
            callback(errorCode.SUCCESS);
        }
    });
};

RemoteIndex.findRemoteIndexByCondition = function(conditions, callback) {
    RemoteIndex.find(conditions)
    .run(function (error, remoteIndexes) {
        if (error) {
            logger.error("find remoteIndex error : " + error);
            callback(errorCode.FAILED, null);
        } else {
            logger.info("find remoteIndex successfully, length of remoteIndexes = " + remoteIndexes.length);
            callback(errorCode.SUCCESS, remoteIndexes);
        }
    });
};

RemoteIndex.listRemoteIndexes = function(conditions, from, count, sortField, callback) {
    if("id" == sortField && 0 != from) {
        conditions.id = orm.lt(from);
        RemoteIndex.find(conditions).limit(parseInt(count)).orderRaw("?? DESC", [sortField])
        .run(function (listRemoteIndexesErr, remoteIndexes) {
            if (listRemoteIndexesErr) {
                logger.error("list remoteIndexes error : " + listRemoteIndexesErr);
                callback(errorCode.FAILED, null);
            } else {
                logger.info("list remoteIndexes successfully");
                callback(errorCode.SUCCESS, remoteIndexes);
            }
        });
    } else {
        RemoteIndex.find(conditions).limit(parseInt(count)).offset(parseInt(from)).orderRaw("?? ASC", [sortField])
        .run(function (listRemoteIndexesErr, remoteIndexes) {
            if (listRemoteIndexesErr) {
                logger.error("list remoteIndexes error : " + listRemoteIndexesErr);
                callback(errorCode.FAILED, null);
            } else {
                logger.info("list remoteIndexes successfully");
                callback(errorCode.SUCCESS, remoteIndexes);
            }
        });
    }
};

RemoteIndex.getRemoteIndexByID = function(remoteIndexID, callback) {
    RemoteIndex.get(remoteIndexID, function(error, remoteIndex) {
        if (error) {
            logger.error("get remoteIndex by ID error : " + error);
            callback(errorCode.FAILED, null);
        } else {
            logger.info("get remoteIndex by ID successfully");
            callback(errorCode.SUCCESS, remoteIndex);
        }
    });
};

RemoteIndex.updateRemoteIndex = function(remoteIndexID, newRemoteIndex, callback) {
    RemoteIndex.get(remoteIndexID, function(error, remoteIndex) {
        if (error) {
            logger.error("get remoteIndex by ID error in update remote index : " + error);
            callback(errorCode.FAILED, null);
        } else {
            logger.info("get remoteIndex by ID successfully in update remote index");
            remoteIndex.name = newRemoteIndex.name;
            remoteIndex.category_id = newRemoteIndex.category_id;
            remoteIndex.category_name = newRemoteIndex.category_name;
            remoteIndex.brand_id = newRemoteIndex.brand_id;
            remoteIndex.brand_name = newRemoteIndex.brand_name;
            remoteIndex.city_code = newRemoteIndex.city_code;
            remoteIndex.city_name = newRemoteIndex.city_name;
            remoteIndex.operator_id = newRemoteIndex.operator_id;
            remoteIndex.operator_name = newRemoteIndex.operator_name;
            remoteIndex.protocol = newRemoteIndex.protocol;
            remoteIndex.remote = newRemoteIndex.remote;
            remoteIndex.remote_map = newRemoteIndex.remote_map;
            remoteIndex.priority = newRemoteIndex.priority;
            remoteIndex.status = enums.ITEM_VERIFY;
            remoteIndex.sub_cate = newRemoteIndex.sub_cate;
            remoteIndex.remote_number = newRemoteIndex.remote_number;
            remoteIndex.operator_name_tw = newRemoteIndex.operator_name_tw;
            remoteIndex.category_name_tw = newRemoteIndex.category_name_tw;
            remoteIndex.brand_name_tw = newRemoteIndex.brand_name_tw;
            remoteIndex.city_name_tw = newRemoteIndex.city_name_tw;
            remoteIndex.binary_md5 = newRemoteIndex.binary_md5;
            remoteIndex.input_source = newRemoteIndex.input_source;
            remoteIndex.update_time = newRemoteIndex.update_time;

            remoteIndex.save(function(error, updatedRemoteIndex) {
                if(error) {
                    logger.error('failed to update remoteIndex : ' + error);
                    callback(errorCode.FAILED, null);
                } else {
                    logger.info('succeeded to update remoteIndex');
                    callback(errorCode.SUCCESS, updatedRemoteIndex);
                }
            });
        }
    });
};

RemoteIndex.verifyRemoteIndex = function(remoteIndexID, status, callback) {
    RemoteIndex.get(remoteIndexID, function(error, remoteIndex) {
        if (error) {
            logger.error("get remoteIndex by ID error in verify remote index : " + error);
            callback(errorCode.FAILED, null);
        } else {
            logger.info("get remoteIndex by ID successfully in verify remote index");
            remoteIndex.status = status;

            remoteIndex.save(function(error, updatedRemoteIndex) {
                if(error) {
                    logger.error('failed to verify remoteIndex : ' + error);
                    callback(errorCode.FAILED, null);
                } else {
                    logger.info('succeeded to verify remoteIndex');
                    callback(errorCode.SUCCESS, updatedRemoteIndex);
                }
            });
        }
    });
};

RemoteIndex.fallbackRemoteIndex = function(remoteIndexID, status, callback) {
    RemoteIndex.get(remoteIndexID, function(error, remoteIndex) {
        if (error) {
            logger.error("get remoteIndex by ID error in fallback remote index : " + error);
            callback(errorCode.FAILED, null);
        } else {
            logger.info("get remoteIndex by ID successfully in fallback remote index");
            remoteIndex.status = status;

            remoteIndex.save(function(error, updatedRemoteIndex) {
                if(error) {
                    logger.error('failed to fallback remoteIndex : ' + error);
                    callback(errorCode.FAILED, null);
                } else {
                    logger.info('succeeded to fallback remoteIndex');
                    callback(errorCode.SUCCESS, updatedRemoteIndex);
                }
            });
        }
    });
};

RemoteIndex.publishRemoteIndex = function(remoteIndexID, status, callback) {
    RemoteIndex.get(remoteIndexID, function(error, remoteIndex) {
        if (error) {
            logger.error("get remoteIndex by ID error in verify remote index : " + error);
            callback(errorCode.FAILED, null);
        } else {
            logger.info("get remoteIndex by ID successfully in publish remote index");
            remoteIndex.status = status;

            remoteIndex.save(function(error, updatedRemoteIndex) {
                if(error) {
                    logger.error('failed to publish remoteIndex : ' + error);
                    callback(errorCode.FAILED, null);
                } else {
                    logger.info('succeeded to publish remoteIndex');
                    callback(errorCode.SUCCESS, updatedRemoteIndex);
                }
            });
        }
    });
};

module.exports = RemoteIndex;