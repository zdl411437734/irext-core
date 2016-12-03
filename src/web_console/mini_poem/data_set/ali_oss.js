/*
 * Created by Strawmanbobi
 * 2014-08-30
 */

// 'use strict';

require('../configuration/constants');
var ErrorCode = require('../configuration/error_code');
var Enums = require('../configuration/enums');

var stringUtils = require('../utils/string_utils');
// deprecated
// var AliOSS = require('oss-client');
var AliOSS = require('ali-oss');
var OssWrapper = require('ali-oss').Wrapper;
var logger = require('../logging/logger4js').helper;

var errorCode = new ErrorCode();
var enums = new Enums();

var OSS = function(_region, _bucket, _accessKey, _accessSecret) {
    this.option = {
        region: _region,
        bucket: _bucket,
        accessKeyId: _accessKey || OSS_APP_ID,
        accessKeySecret: _accessSecret,
    };
    this.client = new OssWrapper(this.option);
}

OSS.prototype.saveObjectFromBinary = function(objectID, bufferContent, contentType, callback) {
    var randomID = stringUtils.randomChar(16);
    console.log("object ID = " + objectID);
    if(null == objectID) {
        objectID = objectID || (null != contentType &&
        '' != contentType &&
        contentType.indexOf("/") >= 0) ?
        randomID + '.' + contentType.substr(contentType.lastIndexOf('/') + 1) :
            randomID;
    }
    this.client.put(objectID, bufferContent).then(function (val) {
        console.log('result: %j', val);
        callback(errorCode.SUCCESS, objectID);
    }).catch (function (err) {
        console.log('error: %j', err);
        callback(errorCode.FAILED, null);
    });
};

OSS.prototype.getObjectByID = function(objectID, filePath, callback) {
    this.client.get(objectID, filePath).then(function (val) {
        console.log('result: %j', val);
        callback(errorCode.SUCCESS, filePath);
    }).catch (function (err) {
        console.log('error: %j', err);
        callback(errorCode.FAILED, null);
    });
};

OSS.prototype.serveObjectByID = function(objectID, filePath, callback) {
    this.client.get(objectID, filePath).then(function (val) {
        console.log('result: %j', val);
        callback(errorCode.SUCCESS, filePath);
    }).catch (function (err) {
        console.log('error: %j', err);
        callback(errorCode.FAILED, null);
    });
};

module.exports = OSS;