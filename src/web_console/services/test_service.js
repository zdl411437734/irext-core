/**
 * Created by Strawmanbobi
 * 2016-12-18
 */

var ffi = require('ffi');

/*
 * function :   Test ffi
 * parameter :
 * return :
 */
exports.testFFI = function(req, res) {
    var libm = ffi.Library('./irda_decoder/libirda_decoder', {
        'irda_context_init': [ 'int', null ]
    });
    libm.irda_context_init();
    res.end();
};