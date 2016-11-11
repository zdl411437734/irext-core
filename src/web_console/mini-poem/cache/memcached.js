/**
 * Created by strawmanbobi
 * 2014-12-02.
 */

require('../configuration/constants');
var ErrorCode = require('../configuration/error_code');
var Enums = require('../configuration/enums');
var BaseCache = require('./base_cache.js');

var AliOCS = require('aliyun-sdk').MEMCACHED;
var logger = require('../logging/logger4js').helper;

var errorCode = new ErrorCode();
var enums = new Enums();

var Cache = function(_host, _port, _user, _password) {
    this.memcached = AliOCS.createClient(_port, _host, {
        username: _user,
        password: _password
    });

    this.memcached.on('error', function(err) {
        logger.error("OCS connection error : " + err);
    });
};

Cache.prototype = Object.create(BaseCache.prototype);

Cache.prototype.set = function(key, value, ttl, callback) {
    this.memcached.set(key, value, ttl, function(err, data) {
        var error = errorCode.SUCCESS;
        if(err) {
            logger.error("error occurred when setting " + value + " for " + key);
            error = errorCode.FAILED;
        }
        callback(error, data);
    });
};

Cache.prototype.get = function(key, callback) {
    this.memcached.get(key, function(err, result) {
        var error = errorCode.SUCCESS;
        if(err) {
            logger.error("error occurred when getting value for " + key);
            error = errorCode.FAILED;
        }
        if(result && result.val) {
            callback(error, result.val.toString());
        } else {
            callback(error, null);
        }
    });
};

Cache.prototype.delete = function(key, callback) {
    this.memcached.delete(key, function(err) {
        var error = errorCode.SUCCESS;
        if(err) {
            logger.error("error occurred when deleting value for " + key);
            error = errorCode.FAILED;
        }
        callback(error);
    });
};

module.exports = Cache;