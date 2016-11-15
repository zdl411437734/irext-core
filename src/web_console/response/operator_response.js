/**
 * Created by strawmanbobi
 * 15-03-02
 */

ServiceResponse = require("./service_response");
function OperatorResponse(status, entity) {
    this.entity = entity;
    ServiceResponse.call(this, status);
}

module.exports = OperatorResponse;