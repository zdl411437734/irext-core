/**
 * Created by strawmanbobi
 * 2015-02-04
 */

// global inclusion
var kvConn = require('../mini-poem/db/mongodb/mongodb_connection');
var logger = require('../mini-poem/logging/logger4js').helper;
var Map = require('../mini-poem/mem/map');

// local inclusion
var ErrorCode = require('../configuration/error_code');
var errorCode = new ErrorCode();

var VirtualRemote = function() {
};

var remoteMap = new Map();

VirtualRemote.prototype.findRemoteByKey = function(protocol, remote, remoteKey, code, callback) {
    // traverse all collections per remote
    var collectionName = remote + "_" + protocol;
    var vRemote = remoteMap.get(collectionName);
    if(null == vRemote) {
        try {
            vRemote = kvConn.defineByCollection(collectionName, {
                    key_name: String,
                    key_value: String,
                    key_codes: String
                },
                collectionName);
            logger.info("this is a new remote collection, add it to remote map");
            remoteMap.set(collectionName, vRemote);
        } catch(e) {
            logger.error(e);
        }
    }

    vRemote.findOne({
            $or:[ {key_name : remoteKey}, {key_name : remoteKey.toUpperCase()} ]
        }, function(findOneRemoteByKeyErr, remote) {
            if(findOneRemoteByKeyErr) {
                logger.error("find one remote by key error : " + findOneRemoteByKeyErr);
                callback(errorCode.FAILED, null);
            } else {
                callback(errorCode.SUCCESS, remote);
            }
        }
    );
};

module.exports = VirtualRemote;