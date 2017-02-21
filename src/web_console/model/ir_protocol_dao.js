/**
 * Created by strawmanbobi
 * 2016-11-27
 */

// global inclusion
var orm = require('orm');
var dbOrm = require('../mini_poem/db/mysql/mysql_connection').mysqlDB;
var logger = require('../mini_poem/logging/logger4js').helper;
var dateUtils = require('../mini_poem/utils/date_utils.js');

// local inclusion
var ErrorCode = require('../constants/error_code');
var errorCode = new ErrorCode();

var Enums = require('../constants/enums');
var enums = new Enums();

var IRProtocol = dbOrm.define('ir_protocol',
    {
        id: Number,
        name: String,
        type: Number,
        status: Number,
        update_time: String,
        contributor: String,
        boot_code: String
    },
    {
        cache: false
    }
);

IRProtocol.createIRProtocol = function(protocol, callback) {
    var date = dateUtils.formatDate(new Date(), "yyyy-MM-dd hh:mm:ss");
    var newProtocol = new IRProtocol({
        name: protocol.name,
        status: protocol.status,
        type: protocol.type,
        update_time: date,
        contributor: protocol.contributor,
        boot_code: protocol.boot_code
    });
    newProtocol.save(function(error, createdProtocol) {
        if(error) {
            logger.error('failed to create protocol : ' + error);
            callback(errorCode.FAILED, null);
        } else {
            callback(errorCode.SUCCESS, createdProtocol);
        }
    });
};

IRProtocol.updateProtocolByID = function(protocolID, newProtocol, callback) {
    IRProtocol.get(protocolID, function(error, protocol) {
        if (error) {
            logger.error("get protocol by ID error in update protocol : " + error);
            callback(errorCode.FAILED, null);
        } else {
            protocol.name = newProtocol.name;
            protocol.type = newProtocol.type;
            protocol.status = newProtocol.status;
            protocol.update_time = newProtocol.update_time;
            protocol.boot_code = null;
            protocol.contributor = newProtocol.contributor;
            protocol.save(function(error, createdProtocol) {
                if(error) {
                    logger.error('failed to create protocol in update protocol : ' + error);
                    callback(errorCode.FAILED, null);
                } else {
                    callback(errorCode.SUCCESS, createdProtocol);
                }
            });
        }
    });
};

IRProtocol.findIRProtocolByConditions = function(conditions, callback) {
    IRProtocol.find(conditions)
        .run(function (error, protocols) {
            if (error) {
                logger.error("find protocol error : " + error);
                callback(errorCode.FAILED, null);
            } else {
                callback(errorCode.SUCCESS, protocols);
            }
        });
};

IRProtocol.listIRProtocols = function(conditions, from, count, sortField, callback) {
    if("id" == sortField && 0 != from) {
        conditions.id = orm.gt(from);
        IRProtocol.find(conditions).limit(parseInt(count)).orderRaw("?? ASC", [sortField])
            .run(function (listProtocolsErr, protocols) {
                if (listProtocolsErr) {
                    logger.error("list protocols error : " + listProtocolsErr);
                    callback(errorCode.FAILED, null);
                } else {
                    callback(errorCode.SUCCESS, protocols);
                }
            });
    } else {
        IRProtocol.find(conditions).limit(parseInt(count)).offset(parseInt(from)).orderRaw("?? ASC", [sortField])
            .run(function (listProtocolsErr, protocols) {
                if (listProtocolsErr) {
                    logger.error("list protocols error : " + listProtocolsErr);
                    callback(errorCode.FAILED, null);
                } else {
                    callback(errorCode.SUCCESS, protocols);
                }
            });
    }
};

IRProtocol.getIRProtocolByID = function(protocolID, callback) {
    IRProtocol.get(protocolID, function(error, protocol) {
        if (error) {
            logger.error("get protocol by ID error : " + error);
            callback(errorCode.FAILED, null);
        } else {
            callback(errorCode.SUCCESS, protocol);
        }
    });
};

module.exports = IRProtocol;