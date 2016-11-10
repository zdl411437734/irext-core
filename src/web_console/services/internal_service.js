/**
 * Created by strawmanbobi
 * 2015-07-29
 */

// system inclusion
var constants = require('../../../Infrastructure/BackEnd/configuration/constants');
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
var VersionResponse = require('../response/version_response.js');
var StatResponse = require('../response/stat_response.js');

var logger = require('../../../Infrastructure/BackEnd/logging/logger4js').helper;

var internalLogic = require('../work_unit/internal_logic.js');

var Enums = require('../configuration/enums');
var ErrorCode = require('../configuration/error_code');

var enums = new Enums();
var errorCode = new ErrorCode();

/*
 * function :   List Categories
 * parameter :  from
 *              count
 * return :     CategoryResponse
 */
exports.listCategories = function (req, res) {
    var from = req.query.from;
    var count = req.query.count;

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
    var categoryID = req.query.category_id;
    var from = req.query.from;
    var count = req.query.count;

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
    var from = req.query.from;
    var count = req.query.count;

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
    var provincePrefix = req.query.province_prefix;

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
    var from = req.query.from;
    var count = req.query.count;

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
    var cityCode = req.query.city_code;
    var from = req.query.from;
    var count = req.query.count;

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
            // remoteIndexResponse.status = listRemoteIndexesErr;
            //remoteIndexResponse = remoteIndexes;
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
 * function :   List published version of UCON
 * parameter :  version_type
 *              upload date
 *              purpose
 * return :     Version List
 */
exports.listVersions = function (req, res) {
    var versionType = req.query.version_type;
    var purpose = req.query.purpose;
    var uploadDate = req.query.upload_date;

    var versionResponse = new VersionResponse();
    internalLogic.listVersionWorkUnit(versionType, purpose, uploadDate, function (listVersionErr, versions) {
        // versionResponse.status = listVersionErr;
        // versionResponse.entity = versions;
        res.send(versions);
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

    var adminID = req.query.id;
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

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
            filePath = files.remote_file.path;
            // set MIME to octet-stream as there might not be any contentType passed from the front-end form
            contentType = files.type || "application/octet-stream";
            logger.info("remoteIndex.kk_remote_number = " + remoteIndex.kk_remote_number);
            internalLogic.createRemoteIndexWorkUnit(remoteIndex, filePath, contentType, ip, adminID,
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
    var adminID = req.query.id;

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
    var pass = req.query.pass;
    var adminID = req.query.id;

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
    var adminID = req.query.id;

    var serviceResponse = new ServiceResponse();
    internalLogic.fallbackRemoteIndexWorkUnit(remoteIndex, adminID, function (fallbackRemoteErr) {
        serviceResponse.status = fallbackRemoteErr;
        res.send(serviceResponse);
        res.end();
    });
};

/*
 * function :   Publish remote index accordingly
 * parameter :  none
 * return :     ServiceResponse
 */
exports.publishRemoteIndex = function (req, res) {
    var serviceResponse = new ServiceResponse();
    internalLogic.publishRemoteIndexWorkUnit(function (publishRemoteErr) {
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
    var adminID = req.query.id;

    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    var serviceResponse = new ServiceResponse();
    internalLogic.createBrandWorkUnit(brand, ip, adminID, function (createBrandErr) {
        serviceResponse.status = createBrandErr;
        res.send(serviceResponse);
        res.end();
    });
};

/*
 * function :   Publish created brand to primary server
 * parameter :  none
 * return :     Service response
 */
exports.publishBrands = function (req, res) {
    var serviceResponse = new ServiceResponse();
    internalLogic.publishBrandsWorkUnit(function (publishBrandsErr) {
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
    var adminID = req.query.id;

    form.on('file', function(field, file) {
        fs.rename(file.path, form.uploadDir + "/" + file.name);
    }).on('error', function(err) {
        logger.error("formidable parse form error : " + err);
        res.send("<html>" +
            "<body> " +
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
            filePath = files.protocol_file.path;
            // set MIME to octet-stream as there might not be any contentType passed from the front-end form
            contentType = files.type || "application/octet-stream";
            console.log("filePath = " + filePath + ", contentType = " + contentType);
            internalLogic.createProtocolWorkUnit(protocol, filePath, contentType, adminID, function (createProtocolErr) {
                if(errorCode.SUCCESS.code == createProtocolErr.code) {
                    res.send("<html>" +
                        "<body> " +
                        "<div style='width: 100%; text-align: center;'>协议文件提交成功</div>" +
                        "</body>" +
                        "</html>");
                } else {
                    res.send("<html>" +
                        "<body> " +
                        "<div style='width: 100%; text-align: center; color: #FF0000'>协议文件提交失败</div>" +
                        "</body>" +
                        "</html>");
                }
                res.end();
            });
        }
    });
};

/*
 * function :   Create version
 * parameter :  version body parameter
 * return :     None
 */
exports.createVersion = function (req, res) {
    var adminID = req.query.id;
    var token = req.query.token;

    var form = new formidable.IncomingForm({
        uploadDir: FILE_TEMP_PATH + "/version"
    });
    var version;
    var contentType;
    var devWlanFile;
    var devBleFile;
    var remBleFile;
    var ipaFile;
    var apkFile;

    var error = 0;

    form.on('file', function(field, file) {
        if (0 == file.size) {
            fs.unlink(file.path);
        } else if (null != file.name && "" != file.name) {
            fs.rename(file.path, form.uploadDir + "/" + file.name);
        }
    }).on('error', function(err) {
        logger.error("formidable parse form error : " + err);
        res.send("<html>" +
            "<body>" +
            "<div style='width: 100%; text-align: center; color: #FF0000'>版本提交失败</div>" +
            "</body>" +
            "</html>");
        res.end();
    });

    form.parse(req, function(err, fields, files) {
        if(err) {
            logger.error("failed to submit version form");
            res.send("<html>" +
                "<body>" +
                "<div style='width: 100%; text-align: center; color: #FF0000'>版本提交失败</div>" +
                "</body>" +
                "</html>");
            res.end();
        } else {
            logger.info("version form submitted successfully");
            version = fields;
            // set MIME to octet-stream as there might not be any contentType passed from the front-end form
            contentType = files.type || "application/octet-stream";

            logger.info("version fields = " + JSON.stringify(version));
            devWlanFile = files.dev_wlan_file.path;
            devBleFile = files.dev_ble_file.path;
            remBleFile = files.rem_ble_file.path;
            ipaFile = files.ipa_file.path;
            apkFile = files.apk_file.path;

            internalLogic.createVersionWorkUnit(adminID, version, devWlanFile, devBleFile, remBleFile, ipaFile, apkFile,
                    contentType,
                function (createVersionErr) {
                    if(errorCode.SUCCESS.code == createVersionErr.code) {
                    res.send("<html>" +
                        "<body>" +
                        "<div style='width: 100%; text-align: center;'>版本提交成功</div>" +
                        "</body>" +
                        "</html>");
                } else {
                    res.send("<html>" +
                        "<body>" +
                        "<div style='width: 100%; text-align: center; color: #FF0000'>版本提交失败</div>" +
                        "</body>" +
                        "</html>");
                }
                res.end();
            });
        }
    });
};

/*
 * function :   Delete version accordingly
 * parameter :  version_id
 * return :     ServiceResponse
 */
exports.deleteVersion = function (req, res) {
    var versionID = req.query.version_id;

    var serviceResponse = new ServiceResponse();
    internalLogic.deleteVersionWorkUnit(versionID, function (deleteVersionErr) {
        serviceResponse.status = deleteVersionErr;
        res.send(serviceResponse);
        res.end();
    });
};

/*
 * function :   Verify version image file accordingly
 * parameter :  version_id
 *              is_pass
 * return :     ServiceResponse
 */
exports.verifyVersion = function (req, res) {
    var versionID = req.query.version_id;
    var pass = req.query.pass;

    var serviceResponse = new ServiceResponse();
    internalLogic.verifyVersionWorkUnit(versionID, pass, function (verifyVersionErr) {
        serviceResponse.status = verifyVersionErr;
        res.send(serviceResponse);
        res.end();
    });
};

/*
 * function :   Fallback version image file accordingly
 * parameter :  version info to fallback
 * return :     ServiceResponse
 */
exports.fallbackVersion = function (req, res) {
    var version = req.body;
    var adminID = req.query.id;

    var serviceResponse = new ServiceResponse();
    internalLogic.fallbackVersionWorkUnit(version, adminID, function (fallbackVersionErr) {
        serviceResponse.status = fallbackVersionErr;
        res.send(serviceResponse);
        res.end();
    });
};

/*
 * function :   Publish version image file accordingly
 * parameter :  version_id
 * return :     ServiceResponse
 */
exports.publishVersion = function (req, res) {
    var versionID = req.query.version_id;

    var serviceResponse = new ServiceResponse();
    internalLogic.publishVersionWorkUnit(versionID, function (publishVersionErr) {
        serviceResponse.status = publishVersionErr;
        res.send(serviceResponse);
        res.end();
    });
};