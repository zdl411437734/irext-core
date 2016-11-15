/**
 * Created by Strawmanbobi
 * 2014-08-30
 */

function Enums() {
    this.APP_PRODUCTION_MODE = "production";
    this.APP_DEVELOPMENT_MODE = "development";
    this.APP_USERDEBUG_MODE = "userdebug";
    this.APP_SPECIAL_MODE = "special";

    this.SERVER_MAIN = 0;

    // TODO: BAAS, share enums between backend and front end
    this.ITEM_INVALID = 0;
    this.ITEM_VALID = 1;
    this.ITEM_VERIFY = 2;
    this.ITEM_PASS = 3;
    this.ITEM_FAILED = 4;
    this.ITEM_UNDETERMINED = 5;

    this.CITY_NORMAL = 0;
    this.CITY_COVERED = 1;

    this.RADIO_TYPE_IRDA = 0;
    this.RADIO_TYPE_BLE_CENTRAL = 1;
    this.RADIO_TYPE_BLE_HID = 2;
    this.RADIO_TYPE_WLAN = 3;
    this.RADIO_TYPE_ZIGBEE = 4;
    this.RAIDO_TYPE_433M = 5;
    this.RADIO_TYPE_GENERIC_API = 6;

    this.CATEGORY_AC = 1;
    this.CATEGORY_TV = 2;
    this.CATEGORY_STB = 3;
    this.CATEGORY_NW = 4;
    this.CATEGORY_IPTV = 5;
    this.CATEGORY_DVD = 6;
    this.CATEGORY_FAN = 7;
    this.CATEGORY_PROJECTOR = 8;
    this.CATEGORY_STEREO = 9;
    this.CATEGORY_LIGHT_BULB = 10;
    this.CATEGORY_BSTB = 11;
    this.CATEGORY_CLEANING_ROBOT = 12;
    this.CATEGORY_AIR_CLEANER = 13;

    this.STAT_TYPE_REMOTE_INSTANCE_ACTIVE = 0;
    this.STAT_TYPE_DEVICE_ACTIVE = 1;
    this.STAT_TYPE_REMOTE_ACTIVE = 2;
    this.STAT_TYPE_REMOTE_BY_CATEGORY = 3;
    this.STAT_TYPE_REMOTE_BY_CITY = 4;
    this.STAT_TYPE_UPDATE_RECORD = 5;

    this.BLE_REMOTE_INDEX_KEY_MAP_POWER_OFF = 0;
    this.BLE_REMOTE_INDEX_KEY_MAP_POWER_ON = 1;

    this.JPUSH_DEVICE_TYPE_IOS = 0;
    this.JPUSH_DEVICE_TYPE_ANDROID = 1;
    this.JPUSH_DEVICE_TYPE_BOTH = 2;

    this.JPUSH_DEST_TYPE_BROADCAST = 0;
    this.JPUSH_DEST_TYPE_PEER = 1;
    this.JPUSH_DEST_TYPE_GROUP = 2;

    this.JPUSH_PUSH_TYPE_MESSAGE = 0;
    this.JPUSH_PUSH_TYPE_NOTIFICATION = 1;

    this.JPUSH_FROM_PEER_CONSOLE = 0;
    this.JPUSH_FROM_PEER_DEVICE = 1;

    this.PROTOCOL_TYPE_G1 = 0;
    this.PROTOCOL_TYPE_G2_QUATERNARY = 1;
    this.PROTOCOL_TYPE_G2_HEXDECIMAL = 2;

    this.ADMIN_TYPE_UCON = 1;
    this.ADMIN_TYPE_EXTERNAL = 2;
}

module.exports = Enums;