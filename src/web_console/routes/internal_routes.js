/**
 * Created by strawmanbobi
 * 2015-01-22.
 */

var app = require('../irext_console.js');
var intService = require('../services/internal_service.js');

app.get('/yuekong/int/list_provinces', intService.listProvinces);
app.get('/yuekong/int/list_cities', intService.listCities);
app.get('/yuekong/int/list_operators', intService.listOperators);
app.get('/yuekong/int/list_categories', intService.listCategories);
app.get('/yuekong/int/list_brands', intService.listBrands);
app.get('/yuekong/int/list_ir_protocols', intService.listIRProtocols);
app.get('/yuekong/int/list_remote_indexes', intService.listRemoteIndexes);
app.get('/yuekong/int/search_remote_indexes', intService.searchRemoteIndexes);

app.get('/yuekong/int/list_unpublished_brands', intService.listUnpublishedBrands);
app.get('/yuekong/int/list_unpublished_remote_indexes', intService.listUnpublishedRemoteIndexes);

app.get('/yuekong/int/list_versions', intService.listVersions);

app.post('/yuekong/int/create_remote_index', intService.createRemoteIndex);
app.post('/yuekong/int/delete_remote_index', intService.deleteRemoteIndex);
app.post('/yuekong/int/verify_remote_index', intService.verifyRemoteIndex);
app.post('/yuekong/int/fallback_remote_index', intService.fallbackRemoteIndex);
app.post('/yuekong/int/publish_remote_index', intService.publishRemoteIndex);

app.post('/yuekong/int/create_brand', intService.createBrand);
app.post('/yuekong/int/publish_brands', intService.publishBrands);

app.post('/yuekong/int/create_protocol', intService.createProtocol);

app.post('/yuekong/int/create_version', intService.createVersion);
app.post('/yuekong/int/delete_version', intService.deleteVersion);
app.post('/yuekong/int/verify_version', intService.verifyVersion);
app.post('/yuekong/int/fallback_version', intService.fallbackVersion);
app.post('/yuekong/int/publish_version', intService.publishVersion);

