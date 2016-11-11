/*
 * Created by Strawmanbobi
 * 2014-08-30
 */

function Enums() {
    this.APP_PRODUCTION_MODE = "production";
    this.APP_DEVELOPMENT_MODE = "development";
    this.APP_USERDEBUG_MODE = "userdebug";

    this.SERVER_MAIN = 0;

    this.SCHEDULER_PERIODICAL = 0;
    this.SCHEDULER_ONCE = 1;

    this.JPUSH_DEVICE_TYPE_IOS = 0;
    this.JPUSH_DEVICE_TYPE_ANDROID = 1;
    this.JPUSH_DEVICE_TYPE_BOTH = 2;

    this.JPUSH_DEST_TYPE_BROADCAST = 0;
    this.JPUSH_DEST_TYPE_PEER = 1;
    this.JPUSH_DEST_TYPE_GROUP = 2;

    this.JPUSH_PUSH_TYPE_MESSAGE = 0;
    this.JPUSH_PUSH_TYPE_NOTIFICATION = 1;

    this.BC_API_MESSAGE_TYPE_MESSAGE = 0;
    this.BC_API_MESSAGE_TYPE_NOTIFICATION = 1;

    this.BC_API_PUSH_TYPE_PEER = 0;
    this.BC_API_PUSH_TYPE_BROADCAST = 1;

    this.ANDROID_STYPE_0 = 1;
}

module.exports = Enums;