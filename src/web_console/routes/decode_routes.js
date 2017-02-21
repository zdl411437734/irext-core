/**
 * Created by Strawmanbobi
 * 2016-12-24 (Xmas eve)
 */
var app = require('../irext_console.js');
var decodeService = require('../services/decode_service.js');

app.post('/irext/decode/prepare_decoding_remote_index', decodeService.prepareDecodingRemoteIndex);
