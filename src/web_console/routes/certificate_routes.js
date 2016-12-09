/**
 * Created by strawmanbobi
 * 2016-11-27
 */

var app = require('../irext_console.js');
var certificateService = require('../services/certificate_service.js');

app.post('/irext/certificate/admin_login', certificateService.adminLogin);
app.post('/irext/certificate/token_verify', certificateService.verifyToken);
app.post('/irext/certificate/change_pw', certificateService.changePassword);