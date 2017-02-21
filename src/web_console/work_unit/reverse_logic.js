/**
 * Created by Strawmanbobi
 * 2017-02-21
 */

// system inclusion
fs = require('fs');
var crypto = require('crypto');

// global inclusion
var orm = require('../../../Infrastructure/BackEnd/node_modules/orm');
var OSS = require('../../../Infrastructure/BackEnd/data_set/ali_oss.js');
var MD5 = require('../../../Infrastructure/BackEnd/security/md5.js');
var StringUtils = require('../../../Infrastructure/BackEnd/utils/string_utils.js');

// local inclusion
var RemoteIndex = require('../model/remote_index_dao.js');

var Enums = require('../constants/enums.js');
var ErrorCode = require('../constants/error_code.js');
var logger = require('../../../Infrastructure/BackEnd/logging/logger4js').helper;

var enums = new Enums();
var errorCode = new ErrorCode();

var async = require('async');

// relative XML file path
var DEBUG_BUCKET_NAME = "irext-debug";
var USER_DEBUG_BUCKET_NAME = "irext-userdebug";
var RELEASE_BUCKET_NAME = "irext-release";