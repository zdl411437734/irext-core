/**
 * Created by strawmanbobi
 * 2016-11-27
 */

var app = require('../irext_console.js');
var intService = require('../services/internal_service.js');

app.get('/irext/int/list_provinces', intService.listProvinces);
app.get('/irext/int/list_cities', intService.listCities);
app.get('/irext/int/list_operators', intService.listOperators);
app.get('/irext/int/list_categories', intService.listCategories);
app.get('/irext/int/list_brands', intService.listBrands);
app.get('/irext/int/list_ir_protocols', intService.listIRProtocols);
app.get('/irext/int/list_remote_indexes', intService.listRemoteIndexes);
app.get('/irext/int/search_remote_indexes', intService.searchRemoteIndexes);
app.get('/irext/int/download_remote_index', intService.downloadRemoteIndex);

app.get('/irext/int/list_unpublished_brands', intService.listUnpublishedBrands);
app.get('/irext/int/list_unpublished_remote_indexes', intService.listUnpublishedRemoteIndexes);

app.post('/irext/int/create_remote_index', intService.createRemoteIndex);
app.post('/irext/int/delete_remote_index', intService.deleteRemoteIndex);
app.post('/irext/int/verify_remote_index', intService.verifyRemoteIndex);
app.post('/irext/int/fallback_remote_index', intService.fallbackRemoteIndex);
app.post('/irext/int/publish_remote_index', intService.publishRemoteIndex);

app.post('/irext/int/create_brand', intService.createBrand);
app.post('/irext/int/publish_brands', intService.publishBrands);

app.post('/irext/int/create_protocol', intService.createProtocol);

