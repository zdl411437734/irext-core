/**
 * Created by Strawmanbobi
 * 2016-12-05
 */

var app = require('../irext_console.js');
var navigationService = require('../services/navigation_service.js');

app.post('/irext/nav/nav_to_url', navigationService.navToURL);