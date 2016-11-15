/**
 * Created by strawmanbobi
 * 14-09-15
 */

ServiceResponse = require("./service_response");
function LoginResponse(status, entity) {
    this.entity = entity;
    ServiceResponse.call(this, status);
}

module.exports = LoginResponse;