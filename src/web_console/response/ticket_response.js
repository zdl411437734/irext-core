/**
 * Created by strawmanbobi
 * 2016-12-24 (Xmas eve)
 */

ServiceResponse = require("./service_response");
function TicketResponse(status, entity) {
    this.entity = entity;
    ServiceResponse.call(this, status);
}

module.exports = TicketResponse;