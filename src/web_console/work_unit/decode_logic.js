/**
 * Created by strawmanbobi
 * 2016-11-27
 */

// system inclusion
fs = require('fs');
var crypto = require('crypto');
var ffi = require("ffi");
var ref = require("ref");
var ArrayType = require('ref-array');
var StructType = require('ref-struct');
var IntArrType = ArrayType('uint16');

// global inclusion
var orm = require('orm');
var MD5 = ('../mini_poem/crypto/md5.js');
var StringUtils = require('../mini_poem/utils/string_utils.js');

// local inclusion
var RemoteIndex = require('../model/remote_index_dao.js');
var TicketPair = require('../authority/ticket_pair.js');

var TicketResponse = require('../response/ticket_response.js');

var Enums = require('../constants/enums.js');
var ErrorCode = require('../constants/error_code.js');
var logger = require('../mini_poem//logging/logger4js').helper;

var enums = new Enums();
var errorCode = new ErrorCode();

var async = require('async');

// relative XML file path
var DEBUG_BUCKET_NAME = "irext-debug";
var USER_DEBUG_BUCKET_NAME = "irext-userdebug";
var RELEASE_BUCKET_NAME = "irext-release";

var ticketPair = new TicketPair(REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, null);

// decode caller
var ACStatus = StructType({
    "acPower": "int",
    "acTemp": "int",
    "acMode": "int",
    "acWindDir": "int",
    "acWindSpeed": "int",
    "acDisplay": "int",
    "acSleep": "int",
    "acTimer": "int"
});

var libDecoder = ffi.Library("./irda_decoder/libirda_decoder", {
    "ir_ac_file_open": [ "int", [ "string" ] ],
    "ir_ac_lib_open": [ "int", [ "pointer", "int" ] ],
    "ir_ac_lib_parse": [ "int", [] ],
    "ir_ac_lib_control": [ "int", [ ACStatus, IntArrType, "int", "int" ] ],
    "ir_ac_lib_close": [ "void", [] ],

    "ir_tv_file_open": [ "int", [ "string" ] ],
    "ir_tv_lib_open": [ "int", [ "pointer", "int" ] ],
    "ir_tv_lib_parse": [ "int", [ "int" ] ],
    "ir_tv_lib_control": [ "int", [ "int", IntArrType ] ],
    "ir_tv_lib_close": [ "void", [] ]
});

// static remote control key mapping
exports.prepareDecodingWorkUnit = function (remoteIndexID, callback) {
    var conditions = {
        id: remoteIndexID,
        status: enums.ITEM_VALID
    };
    RemoteIndex.findRemoteIndexByCondition(conditions, function(findRemoteIndexesErr, remoteIndexes) {
        if (errorCode.SUCCESS.code == findRemoteIndexesErr.code && null != remoteIndexes && remoteIndexes.length > 0) {
            var remoteIndex = remoteIndexes[0];
            // prepare decoding remote index
            var categoryID = remoteIndex.category_id;
            var subCategoryID = remoteIndex.sub_cate;
            var fileName = "irda_" + remoteIndex.protocol + "_" + remoteIndex.remote + ".bin";
            var remoteBinaryPath = FILE_TEMP_PATH;
            var localBinFileName = remoteBinaryPath + "/cache/" + fileName;
            var error = errorCode.SUCCESS;
            var bucketName = "";
            fs.exists(localBinFileName, function(exists) {
                if (exists) {
                    prepareDecoding(remoteIndexID, localBinFileName, categoryID, subCategoryID, callback);
                } else {
                    if (remoteIndex.status == enums.ITEM_VALID) {
                        bucketName = RELEASE_BUCKET_NAME;
                    } else {
                        bucketName = DEBUG_BUCKET_NAME;
                    }
                    logger.info("bucket name = " + bucketName);
                    var aliOss = new OSS(OSS_HOST, bucketName, OSS_APP_ID, OSS_APP_SECRET);
                    aliOss.serveObjectByID(fileName, localBinFileName,
                        function (serveObjectErr, response) {
                            if (errorCode.SUCCESS.code == serveObjectErr) {
                                logger.info("serve remote binary object and cached successfully");
                                prepareDecoding(remoteIndexID, localBinFileName, categoryID, subCategoryID, callback);
                            } else {
                                logger.info("serve remote binary object and cached failed");
                                error = errorCode.FAILED;
                                callback(error, null);
                            }
                        });
                }
            });
        } else {
            logger.error("remoteIndex does not exist : " + remoteIndexID);
            callback(errorCode.FAILED, null);
        }
    });
};

exports.decodeSocketConnectedWorkUnit = function (client) {
    logger.info("decode socket has been connected");
    client.on('disconnect', function() {
        onDisconnected(client);
    });
    client.on('init', function(ticketKey) {
        onInit(ticketKey, client);
    });
    client.on('control', function(id) {
        onControl(id, client);
    })
};

function prepareDecoding(remoteID, binaryFilePath, category, subCategory, callback) {
    fs.exists(binaryFilePath, function(exists) {
        if (false == exists) {
            logger.error("file existence detecting failed");
            callback(errorCode.FAILED, null);
        } else {
            var token = remoteID;
            var timeStamp = new Date().getTime();
            var rand = StringUtils.randomNumber(12);
            var key = MD5.MD5(rand  + timeStamp);
            var ttl = 60 * 60;
            ticketPair.setTicketPair(key, token, ttl, function(setTicketPairErr) {
                if (errorCode.SUCCESS.code == setTicketPairErr.code) {
                    var ticket = {
                        id: key,
                        ticket: token
                    };
                    callback(setTicketPairErr, key);
                } else {
                    callback(errorCode.FAILED, null);
                }
            });
        }
    });
}

function onDisconnected() {
    logger.info("client disconnected");
    libDecoder.ir_ac_lib_close();
    libDecoder.ir_tv_lib_close();
}

function onInit(ticketKey, client) {
    var ticketResponse = new TicketResponse();
    ticketResponse.status = errorCode.FAILED;
    ticketResponse.entity = new Object();

    logger.info('on init, pair decoding ticket');
    ticketPair.getTicketPair(ticketKey, function(getTicketErr, ticket) {
        if (getTicketErr.code == errorCode.SUCCESS.code) {
            var remoteIndexID = ticket;
            // double-check the validation of remote index binary
            var conditions = {
                id: remoteIndexID,
                status: enums.ITEM_VALID
            };
            RemoteIndex.findRemoteIndexByCondition(conditions, function(findRemoteIndexesErr, remoteIndexes) {
                if (errorCode.SUCCESS.code == findRemoteIndexesErr.code && null != remoteIndexes &&
                        remoteIndexes.length > 0) {
                    var remoteIndex = remoteIndexes[0];
                    // prepare decoding remote index
                    var categoryID = remoteIndex.category_id;
                    var subCategoryID = remoteIndex.sub_cate;
                    var fileName = "irda_" + remoteIndex.protocol + "_" + remoteIndex.remote + ".bin";
                    var remoteBinaryPath = FILE_TEMP_PATH;
                    var binFilePath = remoteBinaryPath + "/cache/" + fileName;
                    var ret = 0;
                    if (enums.CATEGORY_AC == categoryID) {
                        /** not enabled for AC
                        ret = libDecoder.ir_ac_file_open(binFilePath);
                        if (0 == ret) {
                            ret = libDecoder.ir_ac_lib_parse();
                            if (0 == ret) {
                                ticketResponse.status = errorCode.SUCCESS;
                                ticketResponse.entity = {
                                    category_id: categoryID,
                                    sub_category_id: 0
                                };
                                logger.info("AC lib opened successfully");
                            } else {
                                libDecoder.ir_ac_lib_close();
                            }
                        } else {
                            libDecoder.ir_ac_lib_close();
                        }
                        **/
                        client.emit('init', ticketResponse);
                    } else {
                        logger.info('open tv binary file ' + binFilePath);
                        ret = libDecoder.ir_tv_file_open(binFilePath);
                        if (0 == ret) {
                            logger.info("TV lib opened successfully");
                            ret = libDecoder.ir_tv_lib_parse(subCategoryID - 1);
                            if (0 == ret) {
                                ticketResponse.status = errorCode.SUCCESS;
                                ticketResponse.entity = {
                                    category_id: categoryID,
                                    sub_category_id: subCategoryID
                                };
                                logger.info("TV lib parsed successfully");
                            } else {
                                logger.error('tv binary parse failed');
                                libDecoder.ir_tv_lib_close();
                            }
                        } else {
                            logger.error('tv binary open failed');
                            libDecoder.ir_tv_lib_close();
                        }
                    }
                }
                client.emit('init', ticketResponse);
            });
        } else {
            client.emit('init', ticketResponse);
        }
    });
}

function onControl(control, client) {
    logger.info("category = " + control.category_id + ", subCategory = " + control.sub_category_id + ", " +
        "buttonID = " + control.key_id);
    var categoryID = control.category_id;
    var subCategoryID = control.sub_category_id;
    var keyID = control.key_id;
    var output = IntArrType(2048);
    if (enums.CATEGORY_AC == categoryID) {
        /** not enabled for AC
        var acStatus = new ACStatus({
            acPower: control.ac_status.power,
            acTemp: control.ac_status.temp,
            acMode: control.ac_status.mode,
            acWindDir: control.ac_status.wind_dir,
            acWindSpeed: control.ac_status.wind_speed,
            acDisplay: 0,
            acSleep: 0,
            acTimer: 0
        });
        var len = libDecoder.ir_ac_lib_control(acStatus, output, keyID, 0);
        **/
    } else {
        var len = libDecoder.ir_tv_lib_control(keyID, output);
        client.emit('decode', { code: output, len: len});
    }
}