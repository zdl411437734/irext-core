/**
 * Created by Strawmanbobi
 * 2015-11-04
 */

var later = require("later");
var logger = require('../logging/logger4js').helper;
var Enums = require("../configuration/enums");
var ErrorCode = require("../configuration/error_code");

var enums = new Enums();
var errorCode = new ErrorCode();

var Scheduler = function() {
};

Scheduler.prototype.startTimer = function(timing, callback) {
    setTimeout(callback, timing);
};

Scheduler.prototype.startPeriodicalTask = function(timing, callback) {
    setInterval(callback, timing);
};

module.exports = Scheduler;