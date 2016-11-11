/**
 * Created by strawmanbobi
 * 2015-08-03.
 */

var pythonShell = require('python-shell');

var constants = require('../configuration/constants.js');
var logger = require('../logging/logger4js').helper;

var ErrorCode = require('../configuration/error_code.js');

var errorCode = new ErrorCode();

var PythonCaller = function() {

};

/*
 * Call python script from application
 *
 * input parameters :   Script run-time base dir
 *                      Script script filename
 *                      User determined arguments ...
 *                      Call back function
 *
 * return :             Error code of python caller
 */
PythonCaller.prototype.call = function() {
    var userArgIndex = 0;
    var numArgs = arguments.length;
    var callback = null;
    var scriptPath = null;
    var scriptName = null;
    var userArguments = [];
    if(numArgs < 3) {
        logger.error("internal error while calling python script from application : no script specified");
        // TODO: specify the error code for this type of error
        throw errorCode.PYTHON_ARGUMENTS_ERROR;
    } else {
        callback = arguments[numArgs - 1];
        if((typeof callback != 'function')) {
            logger.error('internal error while calling python script from application : no callback specified');
            throw errorCode.PYTHON_CALLBACK_NOT_SPECIFIED;
        } else {
            scriptPath = arguments[0];
            scriptName = arguments[1];
            if(null == scriptPath || 'undefined' == scriptPath || null == scriptName || 'undefined' == scriptName) {
                logger.error('internal error while calling python script from application : no script path specified');
                // TODO: specify the error code for this type of error
                throw errorCode.PYTHON_SCRIPT_PATH_NOT_SPECIFIED;
            } else {
                // parse user arguments from python caller
                var args = arguments[2];
                for(userArgIndex = 0; userArgIndex < args.length; userArgIndex++) {
                    userArguments.push(args[userArgIndex]);
                }
                // logger.info("user arguments = " + userArguments);
                var options = {
                    mode: 'text',
                    pythonPath: PYTHON_PATH,
                    pythonOptions: ['-u'],
                    scriptPath: scriptPath, // the base path of python run-time
                    args: userArguments
                };

                pythonShell.run(scriptName, options, function (err, results) {
                    if (err) {
                        logger.error('python executing with error : ' + err);
                        callback(errorCode.FAILED, null);
                    } else {
                        // results is an array consisting of messages collected during execution
                        logger.info('python executed successfully, results = %j', results);
                        callback(errorCode.SUCCESS, results);
                    }
                });
                return errorCode.PYTHON_SCRIPT_SUCCESS;
            }
        }
    }
};

module.exports = PythonCaller;