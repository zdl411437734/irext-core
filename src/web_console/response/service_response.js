/**
 * Created by Strawmanbobi
 * 2016-11-27
 */

function ServiceResponse(status, cause) {
    this.status = status;
    this.cause = cause;
}

module.exports = ServiceResponse;