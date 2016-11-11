/**
 * Created by Strawmanbobi
 * 2016-05-29.
 */
var app = require('../irext_console.js');
var statService = require('../services/stat_service.js');

app.get('/yuekong/stat/generic_count', statService.genericCount);
app.get('/yuekong/stat/stat_categories', statService.statCategories);
app.get('/yuekong/stat/stat_brands', statService.statBrands);
app.get('/yuekong/stat/stat_cities', statService.statCities);