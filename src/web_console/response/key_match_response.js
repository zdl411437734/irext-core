/**
 * Created by strawmanbobi
 * 14-09-15
 */

ServiceResponse = require("./service_response");
function KeyMatchResponse(status, matchCount, remoteFile) {
    this.matchCount = matchCount;
    this.remoteFile = remoteFile;
    ServiceResponse.call(this, status);
}

module.exports = KeyMatchResponse;