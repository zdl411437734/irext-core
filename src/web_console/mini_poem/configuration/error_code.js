/*
 * Created by Strawmanbobi
 * 2014-08-30
 */

function ErrorCode() {
    this.SUCCESS = 0;
    this.FAILED = -1;

    this.PYTHON_SCRIPT_SUCCESS = 0;
    this.PYTHON_ARGUMENTS_ERROR = -1;
    this.PYTHON_SCRIPT_PATH_NOT_SPECIFIED = -2;
    this.PYTHON_CALLBACK_NOT_SPECIFIED = -3;

    this.WRONG_PUSH_DEVICE = -50;
    this.WRONG_PUSH_TYPE = -51;
    this.WRONG_PUSH_DESTINATION = -52;

    this.SNS_WEIXIN_VALIDATION_SUCCESS = 0;
    this.SNS_WEIXIN_VALIDATION_FAILED = 1;

}

module.exports = ErrorCode;