/*
 * Created by Strawmanbobi
 * 2015-03-02
 */

var dateUtils = require('./date_utils');
var platform = require('platform');
var UAParser = require('ua-parser-js');

function startup(expressApp, port, serverName) {
    if(expressApp && expressApp.listen && typeof(expressApp.listen) == "function") {
        expressApp.listen(port);

        console.log(serverName +' restful webservice server is listening at port : ' +
        port + " //" +  dateUtils.formatDate(new Date(), "yyyy-MM-dd hh:mm:ss"));
        console.log("driven by " + ICODE);
    }
}

function getOS() {
    return platform.os;
}

function getUAInfo(ua) {
    var parser = new UAParser();
    var result = parser.setUA(ua).getResult();
    return result;
}

exports.startup = startup;
exports.getOS = getOS;
exports.getUAInfo = getUAInfo;