/**
 * Created by strawmanbobi
 * 2016-11-27
 */

ServiceResponse = require("./service_response");
function SingleCategoryResponse(status, entity) {
    this.entity = entity;
    ServiceResponse.call(this, status);
}

module.exports = SingleCategoryResponse;