/**
 * Created by Strawmanbobi
 * 2016-12-18
 */

var app = require('../irext_console.js');
var testService = require('../services/test_service.js');

app.get('/irext/test/test_ffi', testService.testFFI);
