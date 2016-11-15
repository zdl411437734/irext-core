/**
 * Created by strawmanbobi
 * 2015-07-29
 */

ServiceResponse = require("./service_response");
function ProtocolResponse(status, entity) {
    this.entity = entity;
    ServiceResponse.call(this, status);
}

module.exports = ProtocolResponse;