/**
 * Created by Strawmanbobi
 * 2014-09-01
 */

function ServiceResponse(status, cause) {
    this.status = status;
    this.cause = cause;
}

module.exports = ServiceResponse;