/**
 * Created by strawmanbobi
 * 16-01-05
 */

ServiceResponse = require("./service_response");
function StatResponse(status, entity) {
    this.entity = entity;
    ServiceResponse.call(this, status);
}

module.exports = StatResponse;