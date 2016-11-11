/**
 * Created by strawmanbobi on 14-10-17.
 */

require('../mini-poem/configuration/constants');
var Enums = require('./enums');
var enums = new Enums();

exports.setupEnvironment = function () {
    var env = process.env.NODE_ENV || 'development';
    ENV = env;
    if (undefined == typeof env || null == env || "" == env || enums.APP_PRODUCTION_MODE == env) {
        console.log("production mode");
        console.log("configuring MySQL db connection ability...");
        MYSQL_DB_SERVER_ADDRESS = "rm-bp11c9w1bz8q47zzx.mysql.rds.aliyuncs.com";
        MYSQL_DB_NAME = "ucon_generic";
        MYSQL_DB_USER = "uconrds";
        MYSQL_DB_PASSWORD = "ucon923";

        console.log("configuring MongoDB kv connection ability...");
        MONGO_DB_SERVER_ADDRESS = "127.0.0.1";
        MONGO_DB_NAME = "yuekong_remote_code";
        MONGO_DB_USER = "yuekong";
        MONGO_DB_PASSWORD = "yuekong";

        console.log("configuring kv storage ability...");
        OSS_HOST = "oss-cn-hangzhou.aliyuncs.com";
        OSS_PORT = "80";
        OSS_APP_ID = "f6bWxSdkNyu9FlyC";
        OSS_APP_SECRET = "nO2bzv8yETA6TwPsYNFlYpWRT867Zg";

        console.log("configuring external PYTHON path");
        FILE_TEMP_PATH = "/root/rc_extension";
        PYTHON_PATH = "/usr/bin/python";

        console.log("configuring external server connection ability...");
        LISTEN_PORT = "8300";
        MAIN_SERVER_ADDRESS = "yuekongdev.wicp.net";
        MAIN_SERVER_PORT = LISTEN_PORT;

        console.log("configuring cache ability...");
        MEMCACHED_HOST = "127.0.0.1";
        MEMCACHED_PORT = "11211";
        MEMCACHED_SASL_USER = "";
        MEMCACHED_SASL_PASSWORD = "";

        console.log("configuring push credential");
        PUSH_APP_KEY = "b5e8e6123de67977dcb9813a";
        PUSH_APP_SECRET = "38c6aecde1c7f82c741b4a2a";
    } else if (enums.APP_DEVELOPMENT_MODE == env) {
        console.log("develop mode");
        console.log("configuring MySQL db connection ability...");
        MYSQL_DB_SERVER_ADDRESS = "127.0.0.1";
        MYSQL_DB_NAME = "ucon_generic";
        MYSQL_DB_USER = "root";
        MYSQL_DB_PASSWORD = "root";

        console.log("configuring MongoDB kv connection ability...");
        MONGO_DB_SERVER_ADDRESS = "127.0.0.1";
        MONGO_DB_NAME = "yuekong_remote_code";
        MONGO_DB_USER = "yuekong";
        MONGO_DB_PASSWORD = "yuekong";

        console.log("configuring kv storage ability...");
        OSS_HOST = "oss-cn-hangzhou.aliyuncs.com";
        OSS_PORT = "80";
        OSS_APP_ID = "f6bWxSdkNyu9FlyC";
        OSS_APP_SECRET = "nO2bzv8yETA6TwPsYNFlYpWRT867Zg";

        console.log("configuring external PYTHON path");
        FILE_TEMP_PATH = "D:/rc_extension";
        PYTHON_PATH = "C:/Python27/python.exe";

        console.log("configuring external server connection ability...");
        LISTEN_PORT = "8300";
        MAIN_SERVER_ADDRESS = "192.168.1.170";
        MAIN_SERVER_PORT = LISTEN_PORT;

        console.log("configuring cache ability...");
        MEMCACHED_HOST = "127.0.0.1";
        MEMCACHED_PORT = "11211";
        MEMCACHED_SASL_USER = "";
        MEMCACHED_SASL_PASSWORD = "";

        console.log("configuring push credential");
        PUSH_APP_KEY = "b5e8e6123de67977dcb9813a";
        PUSH_APP_SECRET = "38c6aecde1c7f82c741b4a2a";
    } else if (enums.APP_USERDEBUG_MODE == env) {
        console.log("user debug mode");
        console.log("configuring MySQL db connection ability...");
        MYSQL_DB_SERVER_ADDRESS = "127.0.0.1";
        MYSQL_DB_NAME = "ucon_generic";
        MYSQL_DB_USER = "root";
        MYSQL_DB_PASSWORD = "root";

        console.log("configuring MongoDB kv connection ability...");
        MONGO_DB_SERVER_ADDRESS = "127.0.0.1";
        MONGO_DB_NAME = "yuekong_remote_code";
        MONGO_DB_USER = "yuekong";
        MONGO_DB_PASSWORD = "yuekong";

        console.log("configuring kv storage ability...");
        OSS_HOST = "oss-cn-hangzhou.aliyuncs.com";
        OSS_PORT = "80";
        OSS_APP_ID = "f6bWxSdkNyu9FlyC";
        OSS_APP_SECRET = "nO2bzv8yETA6TwPsYNFlYpWRT867Zg";

        console.log("configuring external PYTHON path");
        FILE_TEMP_PATH = "/root/rc_extension";
        PYTHON_PATH = "/usr/bin/python";

        console.log("configuring external server connection ability...");
        LISTEN_PORT = "8300";
        MAIN_SERVER_ADDRESS = "yuekongdev.wicp.net";
        MAIN_SERVER_PORT = LISTEN_PORT;

        console.log("configuring cache ability...");
        MEMCACHED_HOST = "127.0.0.1";
        MEMCACHED_PORT = "11211";
        MEMCACHED_SASL_USER = "";
        MEMCACHED_SASL_PASSWORD = "";

        console.log("configuring push credential");
        PUSH_APP_KEY = "b5e8e6123de67977dcb9813a";
        PUSH_APP_SECRET = "38c6aecde1c7f82c741b4a2a";
    } else {
        console.log("runtime mode err : " + env);
    }
};