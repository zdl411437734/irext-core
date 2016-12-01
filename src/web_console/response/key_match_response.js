/**
 * Created by strawmanbobi
 * 2016-11-27
 */

ServiceResponse = require("./service_response");
function KeyMatchResponse(status, matchCount, remoteFile) {
    this.matchCount = matchCount;
    this.remoteFile = remoteFile;
    ServiceResponse.call(this, status);
}

module.exports = KeyMatchResponse;