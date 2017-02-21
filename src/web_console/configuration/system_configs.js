//noinspection JSUnresolvedFunction
/**
 * Created by strawmanbobi
 * 2014-10-17
 */

//noinspection JSUnresolvedFunction
require('../mini_poem/configuration/constants');
//noinspection JSUnresolvedFunction
var Enums = require('./../constants/enums');
var enums = new Enums();

//noinspection JSUnresolvedVariable
exports.setupEnvironment = function () {
    MYSQL_DB_SERVER_ADDRESS = "localhost";
    MYSQL_DB_NAME = "irext";
    MYSQL_DB_USER = "root";
    MYSQL_DB_PASSWORD = "root";
    FILE_TEMP_PATH = "~/home/your_name/rc_extension";
    PYTHON_PATH = "/usr/bin/python";
    LISTEN_PORT = "8300";
    SERVER_ADDRESS = "localhost";
    REDIS_HOST = "localhost";
    REDIS_PORT = "6379";
    REDIS_PASSWORD = "";
    EXTERNAL_SERVER_ADDRESS = "irext.net";
    EXTERNAL_SERVER_PORT = "80"
    SOCKET_0_ADDRESS = "http://localhost:8300";
};