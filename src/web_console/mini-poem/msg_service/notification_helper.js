/**
 * Created by Strawmanbobi
 * 2014-08-31
 */

require('../configuration/constants');
var ErrorCode = require('../configuration/error_code');
var Enums = require('../configuration/enums');

var ciphering = require('../security/md5');
var stringUtils = require('../utils/string_utils');
var Map = require('../mem/map');
var querystring = require('querystring');
var apn = require('apn');
var http = require('http');

var logger = require('../logging/logger4js').helper;

var errorCode = new ErrorCode();
var enums = new Enums();

var JPush = require("../libs/JPush/JPush.js");
/**
 *
 * @param _appKey : APP KEY for push server
 * @param _port : APP SECRET for push server
 * @constructor
 */
var PushClient = function(_appKey, _appMasterSecret) {
    this.appKey = _appKey;
    this.appMasterSecret = _appMasterSecret;
    this.client = JPush.buildClient(this.appKey, this.appMasterSecret);
};

// global parameters
var gMessageTTL = 60 * 10;

/**
 * Push message via JPUSH
 * @param conversationID
 * @param pushType
 * @param deviceTypes
 * @param message
 * @param sound
 * @param badge
 * @param silent
 * @param title
 * @param custom
 * @param callback
 */
PushClient.prototype.pushMessageViaJPush = function (conversationID, destType, pushType, deviceTypes,
                                 message, sound, badge, silent, title, custom, callback) {
    logger.debug("conversationID = " + conversationID + ", destType = " + destType + ", deviceType = " + deviceTypes +
        ", message = " + message);

    var devices = null;
    var audience = null;

    // set target platform
    if(enums.JPUSH_DEVICE_TYPE_IOS == deviceTypes) {
        devices = 'ios';
    } else if(enums.JPUSH_DEVICE_TYPE_ANDROID == deviceTypes) {
        devices = 'android';
    } else if(enums.JPUSH_DEVICE_TYPE_BOTH == deviceTypes) {
        devices = JPush.ALL;
    } else {
        logger.error("Wrong push device types required");
        callback(errorCode.WRONG_PUSH_DEVICE);
    }

    // set audience
    if(enums.JPUSH_DEST_TYPE_BROADCAST == destType) {
        audience = JPush.ALL;
    } else if(enums.JPUSH_DEST_TYPE_PEER == destType) {
        audience = JPush.registration_id(conversationID);
    } else if(enums.JPUSH_DEST_TYPE_GROUP == destType) {
        audience = JPush.tag(conversationID);
    } else {
        logger.error("Wrong push audience required");
        callback(errorCode.WRONG_PUSH_DESTINATION);
    }

    logger.debug("devices: " + devices + ", audience: " + audience);

    if (enums.JPUSH_PUSH_TYPE_MESSAGE == pushType) {
        this.client.push().setPlatform(devices)
            .setAudience(audience)
            .setMessage(message)
            .setOptions(null, gMessageTTL, null, true, null)
            .send(function(err, res) {
                if (err) {
                    logger.error("failed to send message via JPush, error = " + err.message);
                    callback(errorCode.FAILED);
                } else {
                    logger.info("succeeded to send message via JPush, sendNo = " + res.sendno +
                        ", messageID = " + res.msg_id);
                    callback(errorCode.SUCCESS);
                }
            });
    } else if (enums.JPUSH_PUSH_TYPE_NOTIFICATION == pushType) {
        this.client.push().setPlatform(devices)
            .setAudience(audience)
            .setNotification(
                JPush.android(message, title, enums.ANDROID_STYPE_0, custom),
                JPush.ios(message, sound, badge, silent, custom)
            )
            .setOptions(null, gMessageTTL, null, true, null)
            .send(function(err, res) {
                if (err) {
                    logger.error("failed to send message via JPush, error = " + err.message);
                    callback(errorCode.FAILED);
                } else {
                    logger.info("succeeded to send message via JPush, sendNo = " + res.sendno +
                        ", messageID = " + res.msg_id);
                    callback(errorCode.SUCCESS);
                }
            });
    } else {
        logger.error("invalid push type : " + pushType);
        callback(errorCode.WRONG_PUSH_TYPE);
    }
};

/**
 * Push message via Baidu Channel API
 * @param conversationID
 * @param conversationChannel
 * @param deviceType
 * @param messageType
 * @param pushType
 * @param messageTitle
 * @param messageDescription
 * @param callback
 * spec: exception handler needed
 */
PushClient.prototype.pushViaBaiduChannelAPI = function (conversationID, conversationChannel, deviceType, messageType, pushType,
                                           messageTitle, messageDescription, callback) {
    var messageBody = "";

    // adjust parameters
    // TODO: to fix the URIEncode issue
    if(enums.BC_API_MESSAGE_TYPE_MESSAGE == messageType) {
        messageBody = encodeURI(messageDescription);
    } else if(enums.BC_API_MESSAGE_TYPE_NOTIFICATION == messageType) {
        messageBody = "{\"title\":\"" + messageTitle + "\",\"description\":\"" + messageDescription + "\"}";
    } else {
        throw "Wrong Message Type";
    }

    if(enums.BC_API_PUSH_TYPE_PEER && (null == conversationID || null == conversationChannel)) {
        throw "Wrong Conversation ID or Channel";
    }

    // prepare parameter map and base URL
    var parameterMap = new Map();
    var baiduChannelAPIPushMsgURL = "https://api.tuisong.baidu.com/rest/3.0/";

    // fill parameters according to BAIDU CHANNEL API Spec
    parameterMap.put("apikey", this.appKey);
    parameterMap.put("method", "push_msg");
    parameterMap.put("channel_id", conversationChannel);
    parameterMap.put("user_id", conversationID);
    parameterMap.put("device_type", deviceType);
    var timeStamp = Math.round(new Date().getTime() / 1000);
    parameterMap.put("timestamp", timeStamp);
    parameterMap.put("messages", messageBody);
    parameterMap.put("message_type", messageType);
    parameterMap.put("push_type", pushType);
    parameterMap.put("msg_keys", utils.randomChar(16));

    // sort parameters and sign
    parameterMap.sortByKey('A');
    var signPlainText = "POSThttp://" + "api.tuisong.baidu.com" + "/rest/3.0/";
    var parameterArray = parameterMap.getArray();
    for (var i = 0; i < parameterArray.length; i++) {
        signPlainText += parameterArray[i].key + "=" + parameterArray[i].value;
    }
    signPlainText += this.appMasterSecret;
    // logger.debug("plain text of sign string = " + signPlainText);

    var signText = ciphering.MD5(encodeURIComponent(signPlainText));
    // logger.debug(signText);

    // construct final URL string
    for (var i = 0; i < parameterArray.length; i++) {
        if (0 == i) {
            baiduChannelAPIPushMsgURL += "?";
        } else {
            baiduChannelAPIPushMsgURL += "&";
        }
        baiduChannelAPIPushMsgURL += parameterArray[i].key + "=" + parameterArray[i].value;
    }

    baiduChannelAPIPushMsgURL += "&sign=" + signText;
    // logger.debug("baidu push url = " + baiduChannelAPIPushMsgURL);

    var postData = querystring.stringify({
    });

    var androidPushOptions = {
        host: "api.tuisong.baidu.com",
        port: "433",
        path: baiduChannelAPIPushMsgURL,
        method: 'POST',
        headers: {
            'Content-Length': postData.length
        }
    };

    var req = http.request(androidPushOptions, function (res) {
        var data = '';
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            data += chunk;
        });
        res.on('end', function () {
            if ('200' == res.statusCode) {
                logger.debug("baidu push request successfully made");
                callback(errorCode.SUCCESS);
            } else {
                logger.debug('baidu push request failed, status code = ' + res.statusCode + " error detail = " + data);
                callback(errorCode.FAILED);
            }
        });
    });

    try {
        req.write(postData);
        req.end();
    } catch(e) {
        logger.error("exception occurred while making HTTP request : " + e);
        req.end();
        callback(errorCode.FAILED);
    }
};

/**
 * Push message to IOS devices via Apple official APN
 * @param deviceToken
 * @param expiry
 * @param alert
 * @param sound
 * @param payload
 * @param callback
 * spec: exception handler needed
 */
PushClient.prototype.pushViaAppleAPN = function(deviceToken, expiry, alert, sound, payload, callback) {
    var options = null;
    if(enums.APP_PRODUCTION_MODE == ENV) {
        option = {
            "cert": "./certs/push_cert_production.pem",
            "key": "./certs/push_key_production.pem",
            "gateway": "gateway.sandbox.push.apple.com",
            "port": "2195"
        };
    } else if(enums.APP_DEVELOPMENT_MODE == ENV) {
        options = {
            "cert": "./certs/push_cert_dev.pem",
            "key": "./certs/push_key_dev.pem",
            "gateway": "gateway.sandbox.push.apple.com",
            "port": "2195"
        };
    } else {
        throw "Wrong ENV";
    }
    var apnConnection = new apn.Connection(options),
        device = new apn.Device(deviceToken),
        note = new apn.Notification();
    note.expiry = Math.floor(Date.now() / 1000) + (3600 | expiry);
    note.badge = 3;
    note.alert = alert;
    note.sound = 'default' | sound;
    note.payload = payload;
    note.device = device;

    apnConnection.pushNotification(note, device);

    if(callback) {
        callback(option, note, device);
    }
};

module.exports = PushClient;