/**
 * Created by strawmanbobi
 * 2015-11-12
 */

var app = require('../yk_console.js');
var certificateService = require('../services/certificate_service.js');

app.get('/yuekong/certificate/confirm_pw', certificateService.confirmPassword);

app.post('/yuekong/certificate/admin_login', certificateService.adminLogin);
app.post('/yuekong/certificate/token_verify', certificateService.verifyToken);
app.post('/yuekong/certificate/change_pw', certificateService.changePassword);