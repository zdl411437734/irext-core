/**
 * Created by strawmanbobi on 14-10-17.
 */

require('../../../Infrastructure/BackEnd/configuration/constants');
var Enums = require('./enums');
var enums = new Enums();

exports.setupEnvironment = function () {
    var env = process.env.NODE_ENV || 'development';
    ENV = env;
    if (undefined == typeof env || null == env || "" == env || enums.APP_PRODUCTION_MODE == env) {
        MYSQL_DB_SERVER_ADDRESS = "localhost";
        MYSQL_DB_NAME = "irext";
        MYSQL_DB_USER = "root";
        MYSQL_DB_PASSWORD = "root";
        OSS_HOST = "";
        OSS_PORT = "80";
        OSS_APP_ID = "";
        OSS_APP_SECRET = "";
        FILE_TEMP_PATH = "~/home/strawmanbobi/rc_extension";
        PYTHON_PATH = "/usr/bin/python";
        LISTEN_PORT = "8300";
        MAIN_SERVER_ADDRESS = "localhost";
        MAIN_SERVER_PORT = 80;
        REDIS_HOST = "localhost";
        REDIS_PORT = "6379";
        REDIS_PASSWORD = "";
    } else if (enums.APP_DEVELOPMENT_MODE == env) {
        MYSQL_DB_SERVER_ADDRESS = "localhost";
        MYSQL_DB_NAME = "irext";
        MYSQL_DB_USER = "root";
        MYSQL_DB_PASSWORD = "root";
        OSS_HOST = "";
        OSS_PORT = "80";
        OSS_APP_ID = "";
        OSS_APP_SECRET = "";
        FILE_TEMP_PATH = "D:/rc_extension";
        PYTHON_PATH = "C:/Python27/python.exe";
        LISTEN_PORT = "8300";
        MAIN_SERVER_ADDRESS = "localhost";
        MAIN_SERVER_PORT = 80;
        REDIS_HOST = "localhost";
        REDIS_PORT = "6379";
        REDIS_PASSWORD = "";
    } else if (enums.APP_USERDEBUG_MODE == env) {
        MYSQL_DB_SERVER_ADDRESS = "localhost";
        MYSQL_DB_NAME = "irext";
        MYSQL_DB_USER = "root";
        MYSQL_DB_PASSWORD = "root";
        OSS_HOST = "";
        OSS_PORT = "80";
        OSS_APP_ID = "";
        OSS_APP_SECRET = "";
        FILE_TEMP_PATH = "D:/rc_extension";
        PYTHON_PATH = "C:/Python27/python.exe";
        LISTEN_PORT = "8300";
        MAIN_SERVER_ADDRESS = "localhost";
        MAIN_SERVER_PORT = 80;
        REDIS_HOST = "localhost";
        REDIS_PORT = "6379";
        REDIS_PASSWORD = "";
    }
};