/*
 * Created by Strawmanbobi
 * 2014-08-30
 */

'use strict';

require('../configuration/constants');
var ErrorCode = require('../configuration/error_code');
var Enums = require('../configuration/enums');

var stringUtils = require('../utils/string_utils');
var AliOSS = require('oss-client');
var logger = require('../logging/logger4js').helper;

var errorCode = new ErrorCode();
var enums = new Enums();

var OSS = function(_host, _port, _accessKey, _accessSecret) {
    this.option = {
        accessKeyId: _accessKey || OSS_APP_ID,
        accessKeySecret: _accessSecret || OSS_APP_SECRET,
        host: _host,
        port: _port
    };
    this.ossClient = new AliOSS.OssClient(this.option);
};

OSS.prototype.saveObjectFromBinary = function(objectID, bufferContent, bucketName, contentType, callback) {
    var randomID = stringUtils.randomChar(16);
    console.log("object ID = " + objectID);
    if(null == objectID || undefined == objectID) {
        objectID = objectID || (null != contentType &&
        '' != contentType &&
        contentType.indexOf("/") >= 0) ?
        randomID + '.' + contentType.substr(contentType.lastIndexOf('/') + 1) :
            randomID;
    }
    logger.debug("save object " + objectID + " to bucket " + bucketName);
    this.ossClient.putObject({
        bucket: bucketName,
        object: objectID,
        srcFile: bufferContent,
        contentType: contentType
    }, function (saveObjectErr, result) {
        if(saveObjectErr) {
            logger.debug("save object error : " + saveObjectErr);
            callback(errorCode.FAILED, null);
        } else {
            logger.debug("save object successfully, result = " + JSON.stringify(result));
            logger.debug(objectID);
            callback(errorCode.SUCCESS, objectID);
        }
    });
};

OSS.prototype.getObjectByID = function(objectID, bucketName, callback) {
    this.ossClient.listObject({
        bucket: bucketName,
        prefix: '',
        marker: objectID,
        delimiter: '/',
        maxKeys: 1
    }, function (getObjectErr, result) {
        if(getObjectErr) {
            logger.debug("get object error : " + getObjectErr);
            callback(errorCode.FAILED, null);
        } else {
            logger.debug("list object successfully, result = " + JSON.stringify(result));
            callback(errorCode.SUCCESS, result);
        }
    });
};

OSS.prototype.serveObjectByID = function(objectID, bucketName, res, callback) {
    // pipe the binary stream to res
    this.ossClient.getObject({
        bucket: bucketName,
        object: objectID,
        dstFile: res,
        userHeaders: ''
    }, function (getObjectErr, result) {
        if(getObjectErr) {
            callback(errorCode.FAILED, null);
        } else {
            callback(errorCode.SUCCESS, res);
        }
    });
};

OSS.prototype.listObjects = function(from, count, bucketName, callback) {
    this.ossClient.listObject({
        bucket: bucketName,
        prefix: '',
        marker: from,
        delimiter: '/',
        maxKeys: count
    }, function (getObjectErr, result) {
        if(getObjectErr) {
            logger.debug("list object error : " + getObjectErr);
            callback(errorCode.FAILED, null);
        } else {
            callback(errorCode.SUCCESS, result);
        }
    });
};

module.exports = OSS;