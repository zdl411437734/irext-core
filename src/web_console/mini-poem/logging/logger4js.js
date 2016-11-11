/**
 * Created by donna
 * 2014-08-30
 */

require('../configuration/constants');
var Enums = require('../configuration/enums');
var log4js = require('log4js');
var enums = new Enums();

var helper = helper || {};
exports.helper = helper;

var logRoot = "./logs/";
var userDebugLogFolder = "user_debug/";
var devLogFolder = "dev/";
var productionLogFolder = "production/";
var logFile = "common.log";

log4js.configure({
     "appenders": [
        {
            type: 'console',
            category: "console"
        },
        {
            type: "dateFile",
            filename: logRoot + productionLogFolder + logFile,
            pattern: "-yyyy-MM-dd",
            alwaysIncludePattern: false,
            maxLogSize: 1024,
            category: 'userProductionLog'
        },
        {
            type: "dateFile",
            filename: logRoot + userDebugLogFolder + logFile,
            pattern: "-yyyy-MM-dd",
            alwaysIncludePattern: false,
            maxLogSize: 1024,
            category: 'userDebugLog'
        },
        {
            type: "dateFile",
            filename: logRoot + devLogFolder + logFile,
            pattern: "-yyyy-MM-dd",
            alwaysIncludePattern: false,
            maxLogSize: 1024,
            category: 'userDevelopmentLog'
        }
    ],
    replaceConsole: true,
    levels: {
        userProductionLog: 'INFO',
        userDebugLog: 'INFO',
        userDevelopmentLog: 'INFO'
    }
});

var userProductionLog = log4js.getLogger('userProductionLog');
var userDebugLog = log4js.getLogger('userDebugLog');
var userDevelopmentLog = log4js.getLogger('userDevelopmentLog');

helper.info = function (msg) {
    if(enums.APP_DEVELOPMENT_MODE == ENV) {
        console.log(msg);
    } else if(enums.APP_PRODUCTION_MODE == ENV) {
        userProductionLog.info(msg);
    } else {
        userDebugLog.info(msg);
    }
};

helper.error = function (msg) {
    if(enums.APP_DEVELOPMENT_MODE == ENV) {
        console.log(msg);
    } else if(enums.APP_PRODUCTION_MODE == ENV) {
        userProductionLog.error(msg);
    } else {
        userDebugLog.error(msg);
    }
};

helper.warn = function (msg) {
    if(enums.APP_DEVELOPMENT_MODE == ENV) {
        console.log(msg);
    } else if(enums.APP_PRODUCTION_MODE == ENV) {
        userProductionLog.warn(msg);
    } else {
        userDebugLog.warn(msg);
    }
};

helper.debug = function (msg) {
    if(enums.APP_DEVELOPMENT_MODE == ENV) {
        console.log(msg);
    } else if(enums.APP_PRODUCTION_MODE == ENV) {
        userProductionLog.debug(msg);
    } else {
        userDebugLog.debug(msg);
    }
};

helper.trace = function (msg) {
    if(enums.APP_DEVELOPMENT_MODE == ENV) {
        console.log(msg);
    } else if(enums.APP_PRODUCTION_MODE == ENV) {
        userProductionLog.trace(msg);
    } else {
        userDebugLog.trace(msg);
    }
};

helper.fatal = function (msg) {
    if(enums.APP_DEVELOPMENT_MODE == ENV) {
        console.log(msg);
    } else if(enums.APP_PRODUCTION_MODE == ENV) {
        userProductionLog.fatal(msg);
    } else {
        userDebugLog.fatal(msg);
    }
};