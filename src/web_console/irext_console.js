/**
 * Created by Strawmanbobi
 * 2015-01-22
 */

// system inclusion
var express= require('express');
var app = module.exports = express();
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

// global inclusion
require('../../Infrastructure/BackEnd/configuration/constants');
var System = require('../../Infrastructure/BackEnd/utils/system_utils');
var systemConfig = require('./configuration/system_configs');

// local inclusion
var Enums = require('./configuration/enums');
var ErrorCode = require('./configuration/error_code');
var enums = new Enums();
var errorCode = new ErrorCode();

SERVER = enums.SERVER_MAIN;

var serverListenPort = enums.APP_PRODUCTION_MODE;

console.log('Configuring Infrastructure...');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride());
// authentication middleware
app.use(tokenValidation);
app.use("/", express.static(__dirname + '/web/'));
systemConfig.setupEnvironment();
serverListenPort = LISTEN_PORT;

var dbConn = require('../../Infrastructure/BackEnd/db/mysql/mysql_connection');

console.log("initializing MySQL connection to : " + MYSQL_DB_SERVER_ADDRESS + ":" + MYSQL_DB_NAME);
dbConn.setMySQLParameter(MYSQL_DB_SERVER_ADDRESS, MYSQL_DB_NAME, MYSQL_DB_USER, MYSQL_DB_PASSWORD);

require('./routes');

var certificateLogic = require('./work_unit/certificate_logic.js');

// kick start the engine
System.startup(app, serverListenPort, "irext Console V0.0.1");

////////////////// middleware //////////////////
function tokenValidation (req, res, next) {
    var menu0 = req.url.indexOf("code/index.html");
    var menu1 = req.url.indexOf("doc/index.html");
    var menu2 = req.url.indexOf("version/index.html");
    var menu3 = req.url.indexOf("stat/index.html");
    var menu4 = req.url.indexOf("push/index.html");

    if (req.url.indexOf("/irext/int") != -1) {
        var contentType = req.get("content-type");
        if (null != contentType && contentType.indexOf("multipart/form-data") != -1) {
            next();
        } else {
            var id = req.query.id;
            var token = req.query.token;
            certificateLogic.verifyTokenWorkUnit(id, token, function(validateTokenErr) {
                if(errorCode.SUCCESS.code != validateTokenErr.code) {
                    var fakeResponse = {
                        status: validateTokenErr,
                        entity: null
                    };
                    res.send(fakeResponse);
                    res.end();
                } else {
                    next();
                }
            });
        }
    } else if (menu0 != -1 || menu1 != -1 || menu2 != -1 || menu3 != -1 || menu4 != -1) {
        var id = req.query.id;
        var token = req.query.token;
        var permissions = "";

        if (-1 != menu0) {
            permissions = ",0";
        } else if (-1 != menu1) {
            permissions = ",1";
        } else if (-1 != menu2) {
            permissions = ",2";
        } else if (-1 != menu3) {
            permissions = ",3";
        } else if (-1 != menu4) {
            permissions = ",4";
        }

        certificateLogic.verifyTokenWithPermissionWorkUnit(id, token, permissions, function(validateTokenErr) {
            if(errorCode.SUCCESS.code != validateTokenErr.code) {
                var fakeResponse = {
                    status: validateTokenErr,
                    entity: null
                };
                res.redirect("/error/auth_error.html");
            } else {
                next();
            }
        });
    } else {
        next();
    }
}