/**
 * Created by strawmanbobi
 * 2016-12-24 (Xmax eve)
 */

require('../mini_poem//configuration/constants');
var Cache = require('../mini_poem//cache/redis.js');
var logger = require('../mini_poem//logging/logger4js').helper;
var Enums = require('../constants/enums');
var ErrorCode = require('../constants/error_code');

var enums = new Enums();
var errorCode = new ErrorCode();


var TicketPair = function(_cacheHost, _cachePort, _cacheAdmin, _cachePassword) {
    this.cache = new Cache(_cacheHost, _cachePort, _cacheAdmin, _cachePassword);
};

TicketPair.prototype.setTicketPair = function(id, ticket, ttl, callback) {
    this.cache.set(id, ticket, ttl, function(setTicketPairErr, data) {
        var error = errorCode.SUCCESS;
        if(setTicketPairErr != errorCode.SUCCESS.code) {
            error = errorCode.FAILED;
        }
        callback(error, data);
    });
};


TicketPair.prototype.getTicketPair = function(id, callback) {
    var error = errorCode.SUCCESS;
    this.cache.get(id, false, function(getTicketPairErr, result) {
        if(errorCode.SUCCESS.code != getTicketPairErr) {
            error = errorCode.FAILED;
        }
        callback(error, result);
    });
};

TicketPair.prototype.deleteTicketPair = function(id, callback) {
    var error = errorCode.SUCCESS;
    this.cache.delete(id, function(deleteTicketPairErr) {
        if(deleteTicketPairErr != errorCode.SUCCESS.code) {
            error = errorCode.FAILED;
        }
        callback(error);
    });
};

module.exports = TicketPair;