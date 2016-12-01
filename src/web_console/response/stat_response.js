/**
 * Created by strawmanbobi
 * 2016-11-27
 */

ServiceResponse = require("./service_response");
function StatResponse(status, entity) {
    this.entity = entity;
    ServiceResponse.call(this, status);
}

module.exports = StatResponse;