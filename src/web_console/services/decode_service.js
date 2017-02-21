/**
 * Created by Strawmanbobi
 * 2016-12-24 (Xmas eve)
 */

// system inclusion
var constants = require('../mini_poem/configuration/constants');
var logger = require('../mini_poem/logging/logger4js').helper;

// local inclusion
var ServiceResponse = require('../response/service_response.js');
var StringResponse = require('../response/string_response.js');

var decodeLogic = require('../work_unit/decode_logic.js');

var Enums = require('../constants/enums');
var ErrorCode = require('../constants/error_code');

var enums = new Enums();
var errorCode = new ErrorCode();

/*
 * function :   Start decoding remote binary
 * parameter :  remote_id
 * return :     StringResponse
 */
exports.prepareDecodingRemoteIndex = function (req, res) {
    var remoteIndexID = req.body.id;

    var stringResponse = new StringResponse();
    decodeLogic.prepareDecodingWorkUnit(remoteIndexID, function (prepareDecodeErr, ticketKey) {
        stringResponse.status = prepareDecodeErr;
        stringResponse.entity = ticketKey;
        res.send(stringResponse);
        res.end();
    });
};

/*
 * function :   decode socket connected
 * parameter :  client sock
 * return :     none
 */
exports.decodeSocketConnected = function (client) {
    decodeLogic.decodeSocketConnectedWorkUnit(client);
};