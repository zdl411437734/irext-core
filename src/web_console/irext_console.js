/**
 * Created by Strawmanbobi
 * 2016-11-27
 */

// system inclusion
var express= require('express');
var app = module.exports = express();
var http = require('http').Server(app);
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

// global inclusion
require('./mini_poem/configuration/constants');
var System = require('./mini_poem/utils/system_utils');
var dbConn = require('./mini_poem/db/mysql/mysql_connection');

// local inclusion
var systemConfig = require('./configuration/system_configs');
var Enums = require('./constants/enums');
var ErrorCode = require('./constants/error_code');
var enums = new Enums();
var errorCode = new ErrorCode();

SERVER = enums.SERVER_MAIN;

console.log('Configuring Infrastructure...');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride());
// authentication middleware
app.use(tokenValidation);
app.use("/", express.static(__dirname + '/web/'));
systemConfig.setupEnvironment();
var serverListenPort = LISTEN_PORT;

console.log("initializing MySQL connection to : " + MYSQL_DB_SERVER_ADDRESS + ":" + MYSQL_DB_NAME);
dbConn.setMySQLParameter(MYSQL_DB_SERVER_ADDRESS, MYSQL_DB_NAME, MYSQL_DB_USER, MYSQL_DB_PASSWORD);

require('./routes');

var certificateLogic = require('./work_unit/certificate_logic.js');

// kick start the engine
System.startupHttp(http, serverListenPort, "irext Console V0.0.4");

////////////////// authentication middleware //////////////////
function tokenValidation (req, res, next) {
    var bodyParam;
    var adminID = null;
    var token = null;
    bodyParam = req.body;

    if (null != bodyParam) {
        adminID = bodyParam.admin_id;
        token = bodyParam.token;
    }

    if (req.url.indexOf("/irext/int/list_remote_indexes") != -1) {
        // override for get method
        adminID = req.query.admin_id;
        token = req.query.token;
    }
    if (req.url.indexOf("/irext/int/search_remote_indexes") != -1) {
        // override for get method
        adminID = req.query.admin_id;
        token = req.query.token;
    }
    if (req.url.indexOf("/irext/int/download_remote_index") != -1) {
        // override for get method
        adminID = req.query.admin_id;
        token = req.query.token;
    }
    if (req.url.indexOf("/irext/int") != -1) {
        var contentType = req.get("content-type");
        if (null != contentType && contentType.indexOf("multipart/form-data") != -1) {
            // request of content type of multipart/form-data would be validated inside each service
            next();
        } else {
            certificateLogic.verifyTokenWorkUnit(adminID, token, function(validateTokenErr) {
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
    } else if (req.url.indexOf("/irext/nav/nav_to_url") != -1) {
        var page = bodyParam.page;
        var pageCode = page.indexOf("code");
        var pageDoc = page.indexOf("doc");
        var pageStat = page.indexOf("stat");

        var permissions = "";

        if (-1 != pageCode) {
            permissions = ",0";
        } else if (-1 != pageDoc) {
            permissions = ",1";
        } else if (-1 != pageStat) {
            permissions = ",2";
        }

        certificateLogic.verifyTokenWithPermissionWorkUnit(adminID, token, permissions, function(validateTokenErr) {
            if(errorCode.SUCCESS.code != validateTokenErr.code) {
                res.redirect("/error/auth_error.html");
            } else {
                next();
            }
        });
    } else {
        next();
    }
}