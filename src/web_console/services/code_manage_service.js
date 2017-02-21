/**
 * Created by strawmanbobi
 * 2016-11-27
 */

// system inclusion
var constants = require('../mini_poem/configuration/constants');
var logger = require('../mini_poem/logging/logger4js').helper;

var formidable = require('formidable');
var fs = require('fs');

// local inclusion
var ServiceResponse = require('../response/service_response.js');
var CategoryResponse = require('../response/category_response.js');
var BrandResponse = require('../response/brand_response.js');
var ProtocolResponse = require('../response/protocol_response.js');
var CityResponse = require('../response/city_response.js');
var OperatorResponse = require('../response/operator_response.js');
var RemoteIndexResponse = require('../response/remote_index_response.js');

var internalLogic = require('../work_unit/code_manage_logic.js');

var Enums = require('../constants/enums');
var ErrorCode = require('../constants/error_code');

var enums = new Enums();
var errorCode = new ErrorCode();

/*
 * function :   List Categories
 * parameter :  from
 *              count
 * return :     CategoryResponse
 */
exports.listCategories = function (req, res) {
    var from = req.body.from;
    var count = req.body.count;

    var categoryResponse = new CategoryResponse();
    internalLogic.listCategoriesWorkUnit(from, count, function (listCategoriesErr, categories) {
        categoryResponse.status = listCategoriesErr;
        categoryResponse.entity = categories;
        res.send(categoryResponse);
        res.end();
    });
};

/*
 * function :   List Brands
 * parameter :  from
 *              count
 *              categoryID
 * return :     BrandResponse
 */
exports.listBrands = function (req, res) {
    var categoryID = req.body.category_id;
    var from = req.body.from;
    var count = req.body.count;

    var brandResponse = new BrandResponse();
    internalLogic.listBrandsWorkUnit(categoryID, from, count, function (listBrandsErr, brands) {
        brandResponse.status = listBrandsErr;
        brandResponse.entity = brands;
        res.send(brandResponse);
        res.end();
    });
};

/*
 * function :   List Unpublished Brands
 * parameter :  from
 *              count
 *              categoryID
 * return :     BrandResponse
 */
exports.listUnpublishedBrands = function (req, res) {
    var brandResponse = new BrandResponse();
    internalLogic.listUnpublishedBrandsWorkUnit(function (listBrandsErr, brands) {
        brandResponse.status = listBrandsErr;
        brandResponse.entity = brands;
        res.send(brandResponse);
        res.end();
    });
};

/*
 * function :   List Protocols
 * parameter :  from
 *              countc
 * return :     ProtocolResponse
 */
exports.listIRProtocols = function (req, res) {
    var from = req.body.from;
    var count = req.body.count;

    var protocolResponse = new ProtocolResponse();
    internalLogic.listIRProtocolsWorkUnit(from, count, function (listProtocolsErr, protocols) {
        protocolResponse.status = listProtocolsErr;
        protocolResponse.entity = protocols;
        res.send(protocolResponse);
        res.end();
    });
};

/*
 * function :   List provinces
 * parameter :
 * return :     ProvinceResponse
 */
exports.listProvinces = function (req, res) {
    var cityResponse = new CityResponse();
    internalLogic.listProvincesWorkUnit(function (listProvincesErr, provinces) {
        cityResponse.status = listProvincesErr;
        cityResponse.entity = provinces;
        res.send(cityResponse);
        res.end();
    });
};

/*
 * function :   List Cities
 * parameter :  province code prefix
 * return :     CityResponse
 */
exports.listCities = function (req, res) {
    var provincePrefix = req.body.province_prefix;

    var cityResponse = new CityResponse();
    internalLogic.listCitiesWorkUnit(provincePrefix, function (listCitiesErr, cities) {
        cityResponse.status = listCitiesErr;
        cityResponse.entity = cities;
        res.send(cityResponse);
        res.end();
    });
};

/*
 * function :   List Cities are covered
 * parameter :  province code prefix
 * return :     CityResponse
 */
exports.listCoveredCities = function (req, res) {
    var from = req.body.from;
    var count = req.body.count;

    var cityResponse = new CityResponse();
    internalLogic.listCoveredCitiesWorkUnit(from, count, function (listCitiesErr, cities) {
        cityResponse.status = listCitiesErr;
        cityResponse.entity = cities;
        res.send(cityResponse);
        res.end();
    });
};

/*
 * function :   List operators
 * parameter :  city code
 * return :     OperatorResponse
 */
exports.listOperators = function (req, res) {
    var cityCode = req.body.city_code;
    var from = req.body.from;
    var count = req.body.count;

    var operatorResponse = new OperatorResponse();
    internalLogic.listOperatorsWorkUnit(cityCode, from, count, function (listOperatorsErr, operators) {
        operatorResponse.status = listOperatorsErr;
        operatorResponse.entity = operators;
        res.send(operatorResponse);
        res.end();
    });
};

/*
 * function :   List remotes
 * parameter :  category_id
 *              brand_id/city_code
 *              from
 *              count
 * return :     Remote Index List
 */
exports.listRemoteIndexes = function (req, res) {
    var categoryID = req.query.category_id;
    var brandID = req.query.brand_id;
    var cityCode = req.query.city_code;
    var from = req.query.from;
    var count = req.query.count;

    internalLogic.listRemoteIndexesWorkUnit(categoryID, brandID, cityCode, from, count,
        function (listRemoteIndexesErr, remoteIndexes) {
            res.send(remoteIndexes);
            res.end();
    });
};

/*
 * function :   Search remotes
 * parameter :  remoteMap
 *              from
 *              count
 * return :     Remote Index List
 */
exports.searchRemoteIndexes = function (req, res) {
    var remoteMap = req.query.remote_map;
    var from = req.query.from;
    var count = req.query.count;

    internalLogic.searchRemoteIndexesWorkUnit(remoteMap, from, count,
        function (listRemoteIndexesErr, remoteIndexes) {
            // remoteIndexResponse.status = listRemoteIndexesErr;
            //remoteIndexResponse = remoteIndexes;
            res.send(remoteIndexes);
            res.end();
        });
};

/*
 * function :   Download remote binary
 * parameter :  remote index ID
 * return :     Redirect to binary download
 */
exports.downloadRemoteIndex = function (req, res) {
    var remoteIndexID = req.query.remote_index_id;

    internalLogic.downloadRemoteBinCachedWorkUnit(remoteIndexID, function (serveBinErr, filePath) {
        if (errorCode.SUCCESS.code == serveBinErr.code) {
            logger.info("download file located at " + filePath);
            res.download(filePath, "");
        } else {
            logger.info("download file failed");
            res.write('');
            res.end();
        }
    });
};

/*
 * function :   List unpublished remote indexes
 * parameter :  category_id
 *              brand_id/city_code
 *              from
 *              count
 * return :     Remote Index List
 */
exports.listUnpublishedRemoteIndexes = function (req, res) {
    var remoteIndexResponse = new RemoteIndexResponse();
    internalLogic.listUnpublishedRemoteIndexesWorkUnit(function (listRemoteIndexesErr, remoteIndexes) {
            remoteIndexResponse.status = listRemoteIndexesErr;
            remoteIndexResponse.entity = remoteIndexes;
            res.send(remoteIndexResponse);
            res.end();
        });
};

/*
 * function :   Create remote index accordingly
 * parameter :  remote body parameter
 * return :     None
 */
exports.createRemoteIndex = function (req, res) {
    var form = new formidable.IncomingForm({
        uploadDir: FILE_TEMP_PATH
    });
    var remoteIndex;
    var filePath;
    var contentType;
    var adminID;

    form.on('file', function(field, file) {
        // rename the incoming file to the file's name
        logger.info("on file in formidable, change file name according to remote name");

        fs.rename(file.path, form.uploadDir + "/" + file.name);
    }).on('error', function(err) {
        logger.error("formidable parse form error : " + err);
        res.send("<html>" +
            "<body> " +
            "<div style='width: 100%; text-align: center; color: #FF0000'>码表文件提交失败</div>" +
            "</body>" +
            "</html>");
        res.end();
    });

    form.parse(req, function(err, fields, files) {
        if(err) {
            logger.error("failed to submit remote index form");
        } else {
            logger.info("remote index form submitted successfully");
            remoteIndex = fields;
            adminID = remoteIndex.admin_id;
            filePath = files.remote_file.path;
            // set MIME to octet-stream as there might not be any contentType passed from the front-end form
            contentType = files.type || "application/octet-stream";
            logger.info("remoteIndex.kk_remote_number = " + remoteIndex.kk_remote_number);
            internalLogic.createRemoteIndexWorkUnit(remoteIndex, filePath, contentType, adminID,
                function (createRemoteIndexErr) {
                if(errorCode.SUCCESS.code == createRemoteIndexErr.code) {
                    res.send("<html>" +
                        "<body> " +
                        "<div style='width: 100%; text-align: center;'>码表文件提交成功</div>" +
                        "</body>" +
                        "</html>");
                } else if (errorCode.DUPLICATED_REMOTE_CODE.code == createRemoteIndexErr.code) {
                    res.send("<html>" +
                        "<body> " +
                        "<div style='width: 100%; text-align: center; color: #FF7777'>码表重复，无需新增</div>" +
                        "</body>" +
                        "</html>");
                } else {
                    res.send("<html>" +
                        "<body> " +
                        "<div style='width: 100%; text-align: center; color: #FF0000'>码表文件提交失败</div>" +
                        "</body>" +
                        "</html>");
                }
                res.end();
            });
        }
    });
};

/*
 * function :   Delete remote index accordingly
 * parameter :  remote_id
 * return :     ServiceResponse
 */
exports.deleteRemoteIndex = function (req, res) {
    var remoteIndex = req.body;
    var adminID = req.body.admin_id;

    var serviceResponse = new ServiceResponse();
    internalLogic.deleteRemoteIndexWorkUnit(remoteIndex, adminID, function (deleteRemoteErr) {
        serviceResponse.status = deleteRemoteErr;
        res.send(serviceResponse);
        res.end();
    });
};

/*
 * function :   Verify remote index accordingly
 * parameter :  remote_id
 *              is_pass
 * return :     ServiceResponse
 */
exports.verifyRemoteIndex = function (req, res) {
    var remoteIndex = req.body;
    var pass = req.body.pass;
    var adminID = req.body.admin_id;

    var serviceResponse = new ServiceResponse();
    internalLogic.verifyRemoteIndexWorkUnit(remoteIndex, pass, adminID, function (verifyRemoteErr) {
        serviceResponse.status = verifyRemoteErr;
        res.send(serviceResponse);
        res.end();
    });
};

/*
 * function :   Fallback remote index accordingly
 * parameter :  remote_id
 * return :     ServiceResponse
 */
exports.fallbackRemoteIndex = function (req, res) {
    var remoteIndex = req.body;
    var adminID = req.body.admin_id;

    var serviceResponse = new ServiceResponse();
    internalLogic.fallbackRemoteIndexWorkUnit(remoteIndex, adminID, function (fallbackRemoteErr) {
        serviceResponse.status = fallbackRemoteErr;
        res.send(serviceResponse);
        res.end();
    });
};

/*
 * function :   Publish remote index
 * parameter :  none
 * return :     ServiceResponse
 */
exports.publishRemoteIndex = function (req, res) {
    var adminID = req.body.admin_id;

    var serviceResponse = new ServiceResponse();
    internalLogic.publishRemoteIndexWorkUnit(adminID, function (publishRemoteErr) {
        serviceResponse.status = publishRemoteErr;
        res.send(serviceResponse);
        res.end();
    });
};

/*
 * function :   Create new brand
 * parameter :  brand body parameter
 * return :     Service response
 */
exports.createBrand = function (req, res) {
    var brand = req.body;
    var adminID = req.body.admin_id;

    var serviceResponse = new ServiceResponse();
    internalLogic.createBrandWorkUnit(brand, adminID, function (createBrandErr) {
        serviceResponse.status = createBrandErr;
        res.send(serviceResponse);
        res.end();
    });
};

/*
 * function :   Publish brand
 * parameter :  Brand body parameter
 * return :     Service response
 */
exports.publishBrands = function (req, res) {
    var adminID = req.body.admin_id;

    var serviceResponse = new ServiceResponse();
    internalLogic.publishBrandsWorkUnit(adminID, function (publishBrandsErr) {
        serviceResponse.status = publishBrandsErr;
        res.send(serviceResponse);
        res.end();
    });
};

/*
 * function :   Create protocol accordingly
 * parameter :  protocol body parameter
 * return :     None
 */
exports.createProtocol = function (req, res) {
    var form = new formidable.IncomingForm({
        uploadDir: FILE_TEMP_PATH + "/protocol"
    });
    var protocol;
    var filePath;
    var contentType;
    var adminID;

    form.on('file', function(field, file) {
        fs.rename(file.path, form.uploadDir + "/" + file.name);
    }).on('error', function(err) {
        logger.error("formidable parse form error : " + err);
        res.send("<html>" +
            "<body>" +
            "<div style='width: 100%; text-align: center; color: #FF0000'>协议文件提交失败</div>" +
            "</body>" +
            "</html>");
        res.end();
    });

    form.parse(req, function(err, fields, files) {
        if(err) {
            logger.error("failed to submit protocol form");
        } else {
            logger.info("protocol form submitted successfully");
            protocol = fields;
            adminID = protocol.admin_id;
            filePath = files.protocol_file.path;
            // set MIME to octet-stream as there might not be any contentType passed from the front-end form
            contentType = files.type || "application/octet-stream";
            console.log("filePath = " + filePath + ", contentType = " + contentType);
            internalLogic.createProtocolWorkUnit(protocol, filePath, contentType, adminID, function (createProtocolErr) {
                if(errorCode.SUCCESS.code == createProtocolErr.code) {
                    res.send("<html>" +
                        "<body>" +
                        "<div style='width: 100%; text-align: center;'>协议文件提交成功</div>" +
                        "</body>" +
                        "</html>");
                    res.end();
                } else {
                    res.send("<html>" +
                        "<body>" +
                        "<div style='width: 100%; text-align: center; color: #FF0000'>协议文件提交失败</div>" +
                        "</body>" +
                        "</html>");
                    res.end();
                }
            });
        }
    });
};