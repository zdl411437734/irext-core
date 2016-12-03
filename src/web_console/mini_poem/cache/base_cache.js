/**
 * Created by strawmanbobi
 * 2014-12-01.
 */

var BaseCache = function(_cacheType, _host, _port, _user, _password) {
    throw new Error("Abstract class");
};

BaseCache.prototype.set = function(key, value, ttl, callback) {
    throw new Error("Could not implemented");
};

BaseCache.prototype.get = function(key, callback) {
    throw new Error("Could not implemented");
};

BaseCache.prototype.delete = function(key, callback) {
    throw new Error("Could not implemented");
};

module.exports = BaseCache;