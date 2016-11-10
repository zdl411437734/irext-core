/**
 * Created by strawmanbobi on 15-06-26
 */

function ErrorCode() {
    this.SUCCESS = 0;
    this.FAILED = -1; // a general failure
    this.SERVER_ERROR = -2; // the indicates an exception thrown at server side
    this.PERMISSION_DENIED = -3;
    this.UPDATE_AVAILABLE = -4;
    this.REQUEST_CONTENT_TOO_LARGE = -5;
    this.STALE_VERSION = -6;
    this.VERIFICATIONCODE_FAILURE = -7;
    this.TIMEOUT = -8;
    this.ENV_PARAM_FAULT = -9;
    this.SCHEDULER_ERROR = -10;
}