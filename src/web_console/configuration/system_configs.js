/**
 * Created by strawmanbobi
 * 2014-10-17
 */

require('../mini_poem/configuration/constants');
var Enums = require('./../constants/enums');
var enums = new Enums();

exports.setupEnvironment = function () {
    var env = process.env.NODE_ENV || 'development';
    ENV = env;
    if (undefined == typeof env || null == env || "" == env || enums.APP_PRODUCTION_MODE == env) {
        MYSQL_DB_SERVER_ADDRESS = "root";
        MYSQL_DB_NAME = "irext";
        MYSQL_DB_USER = "root";
        MYSQL_DB_PASSWORD = "root";
        FILE_TEMP_PATH = "~/home/strawmanbobi/rc_extension";
        PYTHON_PATH = "/usr/bin/python";
        LISTEN_PORT = "8300";
        MAIN_SERVER_ADDRESS = "localhost";
        MAIN_SERVER_PORT = 80;
        REDIS_HOST = "localhost";
        REDIS_PORT = "6379";
        REDIS_PASSWORD = "";
        PRIMARY_SERVER_ADDRESS = "irext.net"
        PRIMARY_SERVER_PORT = "80"
    } else if (enums.APP_DEVELOPMENT_MODE == env) {
        MYSQL_DB_SERVER_ADDRESS = "localhost";
        MYSQL_DB_NAME = "irext";
        MYSQL_DB_USER = "root";
        MYSQL_DB_PASSWORD = "root";
        FILE_TEMP_PATH = "D:/rc_extension";
        PYTHON_PATH = "C:/Python27/python.exe";
        LISTEN_PORT = "8300";
        MAIN_SERVER_ADDRESS = "localhost";
        MAIN_SERVER_PORT = 80;
        REDIS_HOST = "localhost";
        REDIS_PORT = "6379";
        REDIS_PASSWORD = "";
        PRIMARY_SERVER_ADDRESS = "irext.net"
        PRIMARY_SERVER_PORT = "80"
    } else if (enums.APP_USERDEBUG_MODE == env) {
        MYSQL_DB_SERVER_ADDRESS = "localhost";
        MYSQL_DB_NAME = "irext";
        MYSQL_DB_USER = "root";
        MYSQL_DB_PASSWORD = "root";
        FILE_TEMP_PATH = "D:/rc_extension";
        PYTHON_PATH = "/usr/bin/python";
        LISTEN_PORT = "8300";
        MAIN_SERVER_ADDRESS = "localhost";
        MAIN_SERVER_PORT = 80;
        REDIS_HOST = "localhost";
        REDIS_PORT = "6379";
        REDIS_PASSWORD = "";
        PRIMARY_SERVER_ADDRESS = "irext.net"
        PRIMARY_SERVER_PORT = "80"
    }
};