/**
 * Created by Strawmanbobi
 * 2016-11-27
 */
var app = require('../irext_console.js');
var statService = require('../services/stat_service.js');

app.post('/irext/stat/generic_count', statService.genericCount);

app.post('/irext/stat/stat_categories', statService.statCategories);
app.post('/irext/stat/stat_brands', statService.statBrands);
app.post('/irext/stat/stat_cities', statService.statCities);