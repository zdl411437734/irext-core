/**
 * Created by Strawmanbobi
 * 2014-08-30
 */

function Enums() {
    this.APP_PRODUCTION_MODE = "production";
    this.APP_DEVELOPMENT_MODE = "development";
    this.APP_USERDEBUG_MODE = "userdebug";

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

    this.PROTOCOL_TYPE_G1 = 0;
    this.PROTOCOL_TYPE_G2_QUATERNARY = 1;
    this.PROTOCOL_TYPE_G2_HEXDECIMAL = 2;

    this.ADMIN_TYPE_IREXT = 1;
    this.ADMIN_TYPE_EXTERNAL = 2;
}

module.exports = Enums;