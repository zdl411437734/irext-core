/**
 * Created by strawmanbobi
 * 2015-07-29
 */

// system inclusion
fs = require('fs');
var crypto = require('crypto');

// global inclusion
var orm = require('../../../Infrastructure/BackEnd/node_modules/orm');
var Constants = require('../../../Infrastructure/BackEnd/configuration/constants');
var PythonCaller = require('../../../Infrastructure/BackEnd/external/python_caller');
var OSS = require('../../../Infrastructure/BackEnd/data_set/ali_oss.js');

var Category = require('../model/category_dao.js');
var Brand = require('../model/brand_dao.js');
var IRProtocol = require('../model/ir_protocol_dao.js');
var City = require('../model/city_dao.js');
var RemoteIndex = require('../model/remote_index_dao.js');
var StbOperator = require('../model/stb_operator_dao.js');
var Admin = require('../model/admin_dao.js');

var RequestSender = require('../../../Infrastructure/BackEnd/http/request.js');
var Map = require('../../../Infrastructure/BackEnd/mem/map.js');

var Enums = require('../configuration/enums.js');
var ErrorCode = require('../configuration/error_code.js');
var logger = require('../../../Infrastructure/BackEnd/logging/logger4js').helper;

var enums = new Enums();
var errorCode = new ErrorCode();

var async = require('async');

// relative XML file path
var PROTOCOL_PATH = "protocol";
var TV_REMOTE_PATH = "remote_tv";
var STB_REMOTE_PATH = "remote_stb";
var AC_REMOTE_PATH = "remote_ac";
var NW_REMOTE_PATH = "remote_nw";
var IPTV_REMOTE_PATH = "remote_iptv";
var FAN_REMOTE_PATH = "remote_fan";
var DVD_REMOTE_PATH = "remote_dvd";
var PROJECTOR_REMOTE_PATH = "remote_projector";
var STEREO_REMOTE_PATH = "remote_stereo";
var BLE_CENTRAL_REMOTE_PATH = "remote_ble_central";

var BUCKET_NAME = "irext-code-ii-debug";
var RELEASE_RC_BUCKET_NAME = "irext-code-ii-rel";
var PROTOCOL_BUCKET_NAME = "irext-protocol";

// out going HTTP request parameters
var PRIMARY_SERVER_ADDRESS = "irext.net";
// var PRIMARY_SERVER_ADDRESS = "127.0.0.1";
var PRIMARY_SERVER_PORT = "8200";

var REQUEST_APP_KEY = "d6119900556c4c1e629fd92d";
var REQUEST_APP_TOKEN = "fcac5496cba7a12b3bae34abf061f526";

var PUBLISH_BRAND_SERVICE = "/irext/remote/publish_brands";
var PUBLISH_REMOTE_INDEX_SERVICE = "/irext/remote/publish_remote_indexes";
var DELETE_REMOTE_INDEX_SERVICE = "/irext/remote/delete_remote_index";
var PUBLISH_VERSION_SERVICE = "/irext/version/publish_version";
var DELETE_VERSION_SERVICE = "/irext/version/delete_version";

exports.listCategoriesWorkUnit = function (from, count, callback) {
    var conditions = {
        status: enums.ITEM_VALID
    };
    Category.listRemoteCategories(conditions, from, count, "id", function(getCategoryByIDErr, categories) {
        callback(getCategoryByIDErr, categories);
    });
};

exports.listBrandsWorkUnit = function (categoryID, from, count, callback) {
    var conditions = {
        status: orm.gt(parseInt(enums.ITEM_INVALID)),
        category_id: categoryID
    };
    Brand.listBrands(conditions, from, count, "priority", function(getBrandByIDErr, brands) {
        callback(getBrandByIDErr, brands);
    });
};

exports.listUnpublishedBrandsWorkUnit = function (callback) {
    var conditions = {
        status: enums.ITEM_VERIFY
    };
    Brand.listBrands(conditions, 0, 100, "priority", function(getBrandByIDErr, brands) {
        callback(getBrandByIDErr, brands);
    });
};

exports.listProvincesWorkUnit = function (callback) {
    City.listProvinces(function(listProvincesErr, provinces) {
        callback(listProvincesErr, provinces);
    });
};

exports.listCitiesWorkUnit = function (provincePrefix, callback) {
    City.listCities(provincePrefix, function(listCitiesErr, cities) {
        callback(listCitiesErr, cities);
    });
};

exports.listOperatorsWorkUnit = function (cityCode, from, count, callback) {
    var conditions = {
        city_code: cityCode,
        status: enums.ITEM_VALID
    };
    StbOperator.listStbOperators(conditions, from, count, "id", function(listOperatorsErr, operators) {
        callback(listOperatorsErr, operators);
    });
};

exports.listRemoteIndexesWorkUnit = function (categoryID, brandID, cityCode, from, count, callback) {
    var conditions;

    if (categoryID == enums.CATEGORY_STB) {
        var provinceSuffix = cityCode.substring(0, 2);
        var unspecifiedCityCode = provinceSuffix + '0000';
        conditions = {
            category_id: categoryID,
            city_code: cityCode,
            status: orm.gt(enums.ITEM_INVALID)
        };
    } else if (categoryID == enums.CATEGORY_AC ||
        categoryID == enums.CATEGORY_TV ||
        categoryID == enums.CATEGORY_NW ||
        categoryID == enums.CATEGORY_IPTV ||
        categoryID == enums.CATEGORY_DVD ||
        categoryID == enums.CATEGORY_FAN ||
        categoryID == enums.CATEGORY_PROJECTOR ||
        categoryID == enums.CATEGORY_STEREO ||
        categoryID == enums.CATEGORY_LIGHT_BULB ||
        categoryID == enums.CATEGORY_BSTB ||
        categoryID == enums.CATEGORY_CLEANING_ROBOT ||
        categoryID == enums.CATEGORY_AIR_CLEANER) {
        conditions = {
            category_id: categoryID,
            brand_id: brandID,
            status: orm.gt(enums.ITEM_INVALID)
        };
    } else {
        callback(errorCode.INVALID_CATEGORY, null);
        return;
    }

    // logger.info("remote index filter conditions = " + JSON.stringify(conditions));
    RemoteIndex.listRemoteIndexes(conditions, from, count, "priority", function(listRemoteIndexesErr, remoteIndexes) {
        callback(listRemoteIndexesErr, remoteIndexes);
    });
};

exports.searchRemoteIndexesWorkUnit = function (remoteMap, from, count, callback) {
    var conditions = {
        remote_map: orm.like("%" + remoteMap + "%")
    };

    RemoteIndex.listRemoteIndexes(conditions, from, count, "priority", function(listRemoteIndexesErr, remoteIndexes) {
        callback(listRemoteIndexesErr, remoteIndexes);
    });
};

exports.listUnpublishedRemoteIndexesWorkUnit = function (callback) {
    var conditions = {
        status: enums.ITEM_PASS
    };

    RemoteIndex.listRemoteIndexes(conditions, 0, 1000, "priority", function(listRemoteIndexesErr, remoteIndexes) {
        callback(listRemoteIndexesErr, remoteIndexes);
    });
};

exports.listVersionWorkUnit = function (versionType, uploadDate, purpose, callback) {
    var conditions = {
        status: orm.gt(enums.ITEM_INVALID)
    };

    if (null != versionType) {
        conditions.version_type = versionType;
    }
    if (null != uploadDate) {
        conditions.update_time = orm.gte(uploadDate);
    }
    if (null != purpose) {
        conditions.purpose = purpose;
    }

    Version.listVersions(conditions, 0, 1000, "id", function(listVersionErr, versions) {
        callback(listVersionErr, versions);
    });
};

exports.listIRProtocolsWorkUnit = function (from, count, callback) {
    var conditions = {
        status: orm.gt(enums.ITEM_INVALID)
    };
    IRProtocol.listIRProtocols(conditions, from, count, "name", function(listIRProtocolsErr, IRProtocols) {
        callback(listIRProtocolsErr, IRProtocols);
    });
};

exports.createRemoteIndexWorkUnit = function(remoteIndex, filePath, contentType, ip, adminID, callback) {
    //////////////////////////////////////
    // step 1, rename input remote xml file
    var find = '\\\\';
    var re = new RegExp(find, 'g');
    var unixFilePath = filePath.replace(re, '/');
    var lios = unixFilePath.lastIndexOf('/');
    var fileDir = unixFilePath.substring(0, lios);
    var radioType = remoteIndex.radio_type;
    var subCate = remoteIndex.sub_cate;
    var categoryID = remoteIndex.category_id;
    var remoteDir = "";
    var remoteXMLFilePath;
    var remoteBinFilePath;
    var protocolPath;
    var outputPath;
    var outputFilePath;
    var outputFileName;
    var newRemoteIndex;
    var newACRemoteNumber;
    var tagType;
    var inputSource = "";
    var protocolFileName = "";
    var localProtocolFileName = "";

    var pythonRuntimeDir = null,
        pythonFile = null,
        userArgs = [];

    // verify admin
    Admin.getAdminByID(adminID, function(getAdminErr, admin) {
        if (errorCode.SUCCESS.code == getAdminErr.code && null != admin) {
            inputSource = admin.user_name + "-" + ip;

            // begin creating remote index
            if (enums.RADIO_TYPE_IRDA == radioType) {
                switch(parseInt(categoryID)) {
                    case enums.CATEGORY_AC:
                        // remoteDir = AC_REMOTE_PATH;
                        // recalculate AC binary using irext protocol encoder - ii
                        pythonFile = "s_ac_ii.py";
                        // outputDir = "output_ac";
                        break;
                    case enums.CATEGORY_TV:
                        // remoteDir = TV_REMOTE_PATH;
                        pythonFile = "s_tv.py";
                        // outputDir = "output_tv";
                        break;
                    case enums.CATEGORY_STB:
                        // remoteDir = STB_REMOTE_PATH;
                        pythonFile = "s_stb.py";
                        // outputDir = "output_stb";
                        break;
                    case enums.CATEGORY_NW:
                        // remoteDir = NW_REMOTE_PATH;
                        pythonFile = "s_nw.py";
                        // outputDir = "output_nw";
                        break;
                    case enums.CATEGORY_IPTV:
                        // remoteDir = IPTV_REMOTE_PATH;
                        pythonFile = "s_iptv.py";
                        // outputDir = "output_iptv";
                        break;
                    case enums.CATEGORY_DVD:
                        // remoteDir = DVD_REMOTE_PATH;
                        pythonFile = "s_dvd.py";
                        // outputDir = "output_dvd";
                        break;
                    case enums.CATEGORY_FAN:
                        // remoteDir = FAN_REMOTE_PATH;
                        pythonFile = "s_fan.py";
                        // outputDir = "output_fan";
                        break;
                    case enums.CATEGORY_PROJECTOR:
                        // remoteDir = PROJECTOR_REMOTE_PATH;
                        pythonFile = "s_projector.py";
                        // outputDir = "output_projector";
                        break;
                    case enums.CATEGORY_STEREO:
                        // remoteDir = STEREO_REMOTE_PATH;
                        if (3 != subCate) {
                            pythonFile = "s_stereo.py";
                        } else {
                            pythonFile = "s_stereo_2.py";
                        }
                        // outputDir = "output_stereo";
                        break;
                    case enums.CATEGORY_LIGHT_BULB:
                        // remoteDir = LIGHT_BULB_REMOTE_PATH;
                        pythonFile = "s_light.py";
                        // outputDir = "output_light";
                        break;
                    case enums.CATEGORY_BSTB:
                        // remoteDir = BSTB_REMOTE_PATH;
                        pythonFile = "s_bstb.py";
                        // outputDir = "output_stb";
                        break;
                    case enums.CATEGORY_CLEANING_ROBOT:
                        // remoteDir = CLEANING_ROBOT_REMOTE_PATH;
                        pythonFile = "s_crobot.py";
                        // outputDir = "output_crobot";
                        break;
                    case enums.CATEGORY_AIR_CLEANER:
                        // remoteDir = AIR_CLEANER_REMOTE_PATH;
                        pythonFile = "s_acleaner.py";
                        // outputDir = "output_acleaner";
                        break;
                    default:
                        logger.error("no remote category found!!");
                        break;
                }

                logger.info("encoding python file = " +
                    pythonFile);

                // process xml source file and source remote indexes
                if (parseInt(categoryID) == enums.CATEGORY_AC) {
                    // TAG FORMAT encode
                    tagType = "new_ac";
                    remoteXMLFilePath = fileDir + "/" + remoteIndex.remote_name + ".xml";
                    // logger.info("remote XML file path = " + remoteXMLFilePath);
                    //////////////////////////////////////
                    // step 2, parse python run-time path, AC python file name and user arguments

                    pythonRuntimeDir = fileDir + "/" + remoteDir;
                    userArgs.length = 0;
                    // python s_$category.py [remote_xml_file_abs_file] [remote_xml_file_name] [remote_xml_dir_abs_path]
                    userArgs.push(remoteXMLFilePath);
                    // set the xml directory as output path
                    userArgs.push(fileDir + "/");
                    var pythonCaller = new PythonCaller();
                    try {
                        pythonCaller.call(pythonRuntimeDir, pythonFile, userArgs, function(remoteGenErr, genResult) {
                            if (errorCode.SUCCESS.code == remoteGenErr) {
                                //////////////////////////////////////
                                // step 3, if successfully created tag binary file, upload binary to OSS
                                logger.info("remote " + remoteIndex.remote_name + " has successfully been generated");
                                outputPath = fileDir;
                                newACRemoteNumber = remoteIndex.remote_name.substring(remoteIndex.remote_name.lastIndexOf('_') + 1);
                                outputFilePath = outputPath + "/ykir_" + tagType + "_" + newACRemoteNumber + ".bin";

                                logger.info("final tag binary output file = " + outputFilePath);

                                fs.readFile(outputFilePath, function(readFileErr, fileData) {
                                    if (readFileErr) {
                                        logger.error("read remote code binary file error : " + readFileErr);
                                        callback(errorCode.FAILED, null);
                                    } else {
                                        logger.info("read remote binary file successfully, file size = " + fileData.length);

                                        //////////////////////////////////////
                                        // step 3.5, check if this remote index is already contained in remote index list by binary
                                        var fileHash = checksum(fileData);
                                        logger.info("hash of binary file = " + fileHash);
                                        var conditions = {
                                            category_id: remoteIndex.category_id,
                                            brand_id: remoteIndex.brand_id,
                                            binary_md5: fileHash
                                        };

                                        RemoteIndex.findRemoteIndexByCondition(conditions,
                                            function(findRemoteIndexesErr, remoteIndexes) {
                                                if (errorCode.SUCCESS.code == findRemoteIndexesErr.code &&
                                                    null != remoteIndexes && remoteIndexes.length > 0) {
                                                    logger.info("this remote is duplicated by binary value");
                                                    callback(errorCode.DUPLICATED_REMOTE_CODE, null);
                                                } else {
                                                    var aliOss = new OSS(OSS_HOST, OSS_PORT, OSS_APP_ID, OSS_APP_SECRET);
                                                    // do not specify objectID for newly created media
                                                    outputFileName = "ykir_" + tagType + "_" + newACRemoteNumber + ".bin";
                                                    aliOss.saveObjectFromBinary(outputFileName, fileData, BUCKET_NAME, contentType,
                                                        function (createObjectErr, objectID) {
                                                            if (errorCode.SUCCESS.code == createObjectErr) {
                                                                // deprecated: do not delete the output binary file for future use
                                                                //////////////////////////////////////
                                                                // step 4, create remote index record in db
                                                                remoteIndex.remote_name = newACRemoteNumber + "";

                                                                newRemoteIndex = {
                                                                    category_id: remoteIndex.category_id,
                                                                    category_name: remoteIndex.category_name,
                                                                    brand_id: remoteIndex.brand_id,
                                                                    brand_name: remoteIndex.brand_name,
                                                                    protocol: tagType,
                                                                    remote: remoteIndex.remote_name,
                                                                    remote_map: tagType + "_" + newACRemoteNumber,
                                                                    radio_type: radioType,
                                                                    ble_mode: remoteIndex.ble_mode,
                                                                    priority: remoteIndex.priority,
                                                                    sub_cate: subCate,
                                                                    applied_remote_version: "V" + remoteIndex.remote_applied_version || 'V1.4.0',
                                                                    applied_device_version: "V" + remoteIndex.device_applied_version || 'V1.4.0',
                                                                    banned_remote_version: "V" + remoteIndex.remote_banned_version || 'V99.0.0',
                                                                    banned_device_version: "V" + remoteIndex.device_banned_version || 'V99.0.0',
                                                                    kk_remote_number: remoteIndex.kk_remote_number,
                                                                    category_name_tw: remoteIndex.category_name_tw,
                                                                    brand_name_tw: remoteIndex.brand_name_tw,
                                                                    binary_md5: fileHash,
                                                                    input_source: inputSource,
                                                                    protector: remoteIndex.protector
                                                                };

                                                                // see if this remote index is already in database
                                                                var conditions = {
                                                                    //category_id: remoteIndex.category_id,
                                                                    //brand_id: remoteIndex.brand_id,
                                                                    protocol: tagType,
                                                                    remote: remoteIndex.remote_name,
                                                                    status: orm.gt(enums.ITEM_INVALID)
                                                                };

                                                                RemoteIndex.findRemoteIndexByCondition(conditions,
                                                                    function(findRemoteIndexErr, remoteIndexes) {
                                                                        if(errorCode.SUCCESS.code == findRemoteIndexErr.code &&
                                                                            remoteIndexes &&
                                                                            remoteIndexes.length > 0) {
                                                                            logger.info("remote index already exists, failed this time");
                                                                            /*
                                                                            RemoteIndex.updateRemoteIndex(remoteIndexes[0].id,
                                                                                newRemoteIndex,
                                                                                function(updateRemoteIndexErr, updatedRemoteIndex) {
                                                                                    callback(updateRemoteIndexErr, updatedRemoteIndex);
                                                                                });
                                                                            */
                                                                            callback(errorCode.FAILED, null);
                                                                        } else {
                                                                            RemoteIndex.createRemoteIndex(newRemoteIndex,
                                                                                function(createRemoteIndexErr, createdRemoteIndex) {
                                                                                    callback(createRemoteIndexErr, createdRemoteIndex);
                                                                                });
                                                                        }
                                                                    });
                                                            } else {
                                                                logger.error("save file object to OSS failed : " + createObjectErr);
                                                                callback(errorCode.FAILED, null);
                                                            }
                                                        });
                                                }
                                            });
                                    }
                                });
                            } else {
                                logger.info("remote " + remoteIndex.remote_name + " generating failed");
                                callback(errorCode.FAILED, null);
                            }
                        });
                    } catch (exception) {
                        logger.error('failed to execute python script from application');
                        callback(errorCode.FAILED, null);
                    }
                } else {
                    // P-R FORMAT encode
                    //////////////////////////////////////
                    // step 1.5, download specified protocol binary from OSS
                    protocolPath = fileDir + "/" + PROTOCOL_PATH + "/";
                    protocolFileName = remoteIndex.protocol_name + ".bin";
                    localProtocolFileName = protocolPath + remoteIndex.protocol_name + ".bin";
                    var aliOss = new OSS(OSS_HOST, OSS_PORT, OSS_APP_ID, OSS_APP_SECRET);
                    aliOss.serveObjectByID(protocolFileName, PROTOCOL_BUCKET_NAME, localProtocolFileName,
                        function (serveObjectErr, response) {
                            if (errorCode.SUCCESS.code == serveObjectErr) {
                                logger.info("protocol binary fetched from OSS, continue processing with remote file");
                                remoteXMLFilePath = fileDir + "/" + remoteIndex.remote_name + ".xml";
                                logger.info("remote XML file path = " + remoteXMLFilePath);
                                //////////////////////////////////////
                                // step 2, parse python run-time path, python file name and user arguments
                                pythonRuntimeDir = fileDir + "/" + remoteDir;
                                userArgs.length = 0;
                                // python s_$category.py [remote_xml_file_abs_file] [remote_xml_file_name] [remote_xml_dir_abs_path]
                                userArgs.push(remoteXMLFilePath);
                                userArgs.push(remoteIndex.remote_name + ".xml");
                                userArgs.push(fileDir + "/");

                                //////////////////////////////////////
                                // step 3, try executing remote encoding script
                                var pythonCaller = new PythonCaller();
                                try {
                                    pythonCaller.call(pythonRuntimeDir, pythonFile, userArgs, function(remoteGenErr, genResult) {
                                        if(errorCode.SUCCESS.code == remoteGenErr) {

                                            //////////////////////////////////////
                                            // step 4, try executing merge script
                                            logger.info("remote " + remoteIndex.remote_name + " has successfully been generated." +
                                                " continue merging with protocol");
                                            pythonFile = "merge.py";
                                            outputPath = fileDir;
                                            remoteBinFilePath = fileDir + "/" + remoteDir + remoteIndex.protocol_name + "#" +
                                                remoteIndex.remote_name + ".bin";
                                            userArgs.length = 0;
                                            // python merge.py [protocol_dir_abs_path] [remote_bin_file_abs_path] [output_$category_dir_abs_path]
                                            logger.info("protocol path = " + protocolPath + ", remote bin path = " + remoteBinFilePath +
                                                ", output = " + outputPath);
                                            userArgs.push(protocolPath);
                                            userArgs.push(remoteBinFilePath);
                                            userArgs.push(outputPath);
                                            pythonCaller.call(pythonRuntimeDir, pythonFile, userArgs, function(remoteMergeErr, mergeResult) {
                                                logger.info("merge protocol error = " + remoteMergeErr);
                                                if(errorCode.SUCCESS.code == remoteMergeErr) {

                                                    //////////////////////////////////////
                                                    // step 5, upload file to aliyun OSS
                                                    outputFilePath = outputPath + "/ykir_" + remoteIndex.protocol_name + "_" +
                                                        remoteIndex.remote_name + ".bin";
                                                    logger.info("final output file = " + outputFilePath);

                                                    fs.readFile(outputFilePath, function(readFileErr, fileData) {
                                                        if (readFileErr) {
                                                            logger.error("read remote code binary file error : " + readFileErr);
                                                            callback(errorCode.FAILED, null);
                                                        } else {
                                                            logger.info("read remote binary file successfully, file size = " + fileData.length);

                                                            //////////////////////////////////////
                                                            // step 5.5, check if this remote index is already contained in remote index list by binary
                                                            var fileHash = checksum(fileData);
                                                            logger.info("hash of binary file = " + fileHash);
                                                            var conditions = null;

                                                            if (enums.CATEGORY_STB == remoteIndex.category_id) {
                                                                conditions = {
                                                                    category_id: remoteIndex.category_id,
                                                                    city_code: remoteIndex.city_code,
                                                                    binary_md5: fileHash
                                                                };
                                                            } else {
                                                                conditions = {
                                                                    category_id: remoteIndex.category_id,
                                                                    brand_id: remoteIndex.brand_id,
                                                                    binary_md5: fileHash
                                                                };
                                                            }

                                                            RemoteIndex.findRemoteIndexByCondition(conditions,
                                                                function(findRemoteIndexesErr, remoteIndexes) {
                                                                    if (errorCode.SUCCESS.code == findRemoteIndexesErr.code &&
                                                                        null != remoteIndexes && remoteIndexes.length > 0) {
                                                                        logger.info("this remote is duplicated by binary value");
                                                                        callback(errorCode.DUPLICATED_REMOTE_CODE, null);
                                                                    } else {
                                                                        // do not specify objectID for newly created media
                                                                        outputFileName = "ykir_" + remoteIndex.protocol_name + "_" +
                                                                            remoteIndex.remote_name + ".bin";
                                                                        aliOss.saveObjectFromBinary(outputFileName, fileData, BUCKET_NAME, contentType,
                                                                            function (createObjectErr, objectID) {
                                                                                if (errorCode.SUCCESS.code == createObjectErr) {
                                                                                    // deprecated: do not delete the output binary file for future use

                                                                                    //////////////////////////////////////
                                                                                    // step 6, create remote index record in db
                                                                                    if (remoteIndex.category_id == enums.CATEGORY_STB) {
                                                                                        newRemoteIndex = {
                                                                                            category_id: remoteIndex.category_id,
                                                                                            category_name: remoteIndex.category_name,
                                                                                            city_code: remoteIndex.city_code,
                                                                                            city_name: remoteIndex.city_name,
                                                                                            operator_id: remoteIndex.operator_id,
                                                                                            operator_name: remoteIndex.operator_name,
                                                                                            protocol: remoteIndex.protocol_name,
                                                                                            remote: remoteIndex.remote_name,
                                                                                            remote_map: remoteIndex.protocol_name +
                                                                                            '_' + remoteIndex.remote_name,
                                                                                            radio_type: radioType,
                                                                                            ble_mode: remoteIndex.ble_mode,
                                                                                            priority: remoteIndex.priority,
                                                                                            sub_cate: subCate,
                                                                                            applied_remote_version: "V" + remoteIndex.remote_applied_version || 'V1.4.0',
                                                                                            applied_device_version: "V" + remoteIndex.device_applied_version || 'V1.4.0',
                                                                                            banned_remote_version: "V" + remoteIndex.remote_banned_version || 'V99.0.0',
                                                                                            banned_device_version: "V" + remoteIndex.device_banned_version || 'V99.0.0',
                                                                                            kk_remote_number: remoteIndex.kk_remote_number,
                                                                                            city_name_tw: remoteIndex.city_name_tw,
                                                                                            operator_name_tw: remoteIndex.operator_name_tw,
                                                                                            binary_md5: fileHash,
                                                                                            input_source: inputSource,
                                                                                            protector: remoteIndex.protector
                                                                                        }
                                                                                    } else {
                                                                                        newRemoteIndex = {
                                                                                            category_id: remoteIndex.category_id,
                                                                                            category_name: remoteIndex.category_name,
                                                                                            brand_id: remoteIndex.brand_id,
                                                                                            brand_name: remoteIndex.brand_name,
                                                                                            protocol: remoteIndex.protocol_name,
                                                                                            remote: remoteIndex.remote_name,
                                                                                            remote_map: remoteIndex.protocol_name +
                                                                                            '_' + remoteIndex.remote_name,
                                                                                            radio_type: radioType,
                                                                                            ble_mode: remoteIndex.ble_mode,
                                                                                            priority: remoteIndex.priority,
                                                                                            sub_cate: subCate,
                                                                                            applied_remote_version: "V" + remoteIndex.remote_applied_version || 'V1.4.0',
                                                                                            applied_device_version: "V" + remoteIndex.device_applied_version || 'V1.4.0',
                                                                                            banned_remote_version: "V" + remoteIndex.remote_banned_version || 'V99.0.0',
                                                                                            banned_device_version: "V" + remoteIndex.device_banned_version || 'V99.0.0',
                                                                                            kk_remote_number: remoteIndex.kk_remote_number,
                                                                                            category_name_tw: remoteIndex.category_name_tw,
                                                                                            brand_name_tw: remoteIndex.brand_name_tw,
                                                                                            binary_md5: fileHash,
                                                                                            input_source: inputSource,
                                                                                            protector: remoteIndex.protector
                                                                                        }
                                                                                    }

                                                                                    // see if this remote index is already in database
                                                                                    var conditions = {
                                                                                        // category_id: remoteIndex.category_id,
                                                                                        // brand_id: remoteIndex.brand_id,
                                                                                        protocol: remoteIndex.protocol_name,
                                                                                        remote: remoteIndex.remote_name,
                                                                                        status: orm.gt(enums.ITEM_INVALID)
                                                                                    };

                                                                                    RemoteIndex.findRemoteIndexByCondition(conditions,
                                                                                        function(findRemoteIndexErr, remoteIndexes) {
                                                                                            if(errorCode.SUCCESS.code == findRemoteIndexErr.code &&
                                                                                                remoteIndexes &&
                                                                                                remoteIndexes.length > 0) {
                                                                                                logger.info("remote index already exists, failed this time");
                                                                                                /*
                                                                                                 RemoteIndex.updateRemoteIndex(remoteIndexes[0].id, newRemoteIndex,
                                                                                                 function(updateRemoteIndexErr, updatedRemoteIndex) {
                                                                                                 callback(updateRemoteIndexErr, updatedRemoteIndex);
                                                                                                 });
                                                                                                 */
                                                                                                callback(errorCode.FAILED, null);
                                                                                            } else {
                                                                                                RemoteIndex.createRemoteIndex(newRemoteIndex,
                                                                                                    function(createRemoteIndexErr, createdRemoteIndex) {
                                                                                                        callback(createRemoteIndexErr, createdRemoteIndex);
                                                                                                    });
                                                                                            }
                                                                                        });
                                                                                } else {
                                                                                    logger.error("save file object to OSS failed : " + createObjectErr);
                                                                                    callback(errorCode.FAILED, null);
                                                                                }
                                                                            });
                                                                    }
                                                                });
                                                        }
                                                    });
                                                } else {
                                                    callback(errorCode.FAILED, null);
                                                }
                                            });
                                        } else {
                                            callback(errorCode.FAILED, null);
                                        }
                                    });
                                } catch (exception) {
                                    logger.error('failed to execute python script from application');
                                    callback(errorCode.FAILED, null);
                                }
                            } else {
                                logger.info("failed to fetch protocol binary file, return with failure");
                                callback(errorCode.FAILED, null);
                            }
                        });
                }
            } else if (enums.RADIO_TYPE_BLE_CENTRAL == radioType) {
                pythonFile = "s_bc.py";
                // TAG FORMAT encode
                tagType = "bc";
                remoteXMLFilePath = fileDir + "/" + remoteIndex.remote_name + ".xml";
                // logger.info("remote XML file path = " + remoteXMLFilePath);
                //////////////////////////////////////
                // step 2, parse python run-time path, BC python file name and user arguments
                pythonRuntimeDir = fileDir + "/" + remoteDir;
                userArgs.length = 0;
                // python s_$category.py [remote_xml_file_abs_file] [remote_xml_file_name] [remote_xml_dir_abs_path]
                userArgs.push(remoteXMLFilePath);
                // set the xml directory as output path
                userArgs.push(fileDir + "/");
                var pythonCaller = new PythonCaller();
                try {
                    pythonCaller.call(pythonRuntimeDir, pythonFile, userArgs, function(remoteGenErr, genResult) {
                        if (errorCode.SUCCESS.code == remoteGenErr) {
                            //////////////////////////////////////
                            // step 3, if successfully created tag binary file, upload binary to OSS
                            logger.info("remote " + remoteIndex.remote_name + " has successfully been generated");
                            outputPath = fileDir;
                            newACRemoteNumber = remoteIndex.remote_name.substring(remoteIndex.remote_name.lastIndexOf('_') + 1);
                            outputFilePath = outputPath + "/ykir_" + tagType + "_" + newACRemoteNumber + ".bin";

                            logger.info("final tag binary output file = " + outputFilePath);

                            fs.readFile(outputFilePath, function(readFileErr, fileData) {
                                if (readFileErr) {
                                    logger.error("read remote code binary file error : " + readFileErr);
                                    callback(errorCode.FAILED, null);
                                } else {
                                    logger.info("read remote binary file successfully, file size = " + fileData.length);

                                    //////////////////////////////////////
                                    // step 3.5, check if this remote index is already contained in remote index list by binary
                                    var fileHash = checksum(fileData);
                                    logger.info("hash of binary file = " + fileHash);
                                    var conditions = {
                                        category_id: remoteIndex.category_id,
                                        brand_id: remoteIndex.brand_id,
                                        binary_md5: fileHash
                                    };

                                    RemoteIndex.findRemoteIndexByCondition(conditions,
                                        function(findRemoteIndexesErr, remoteIndexes) {
                                            if (errorCode.SUCCESS.code == findRemoteIndexesErr.code &&
                                                null != remoteIndexes && remoteIndexes.length > 0) {
                                                logger.info("this remote is duplicated by binary value");
                                                callback(errorCode.DUPLICATED_REMOTE_CODE, null);
                                            } else {
                                                var aliOss = new OSS(OSS_HOST, OSS_PORT, OSS_APP_ID, OSS_APP_SECRET);
                                                // do not specify objectID for newly created media
                                                outputFileName = "ykir_" + tagType + "_" + newACRemoteNumber + ".bin";
                                                aliOss.saveObjectFromBinary(outputFileName, fileData, BUCKET_NAME, contentType,
                                                    function (createObjectErr, objectID) {
                                                        if (errorCode.SUCCESS.code == createObjectErr) {
                                                            // deprecated: do not delete the output binary file for future use
                                                            //////////////////////////////////////
                                                            // step 4, create remote index record in db
                                                            remoteIndex.remote_name = newACRemoteNumber + "";

                                                            newRemoteIndex = {
                                                                category_id: remoteIndex.category_id,
                                                                category_name: remoteIndex.category_name,
                                                                brand_id: remoteIndex.brand_id,
                                                                brand_name: remoteIndex.brand_name,
                                                                protocol: tagType,
                                                                remote: remoteIndex.remote_name,
                                                                remote_map: tagType + "_" + newACRemoteNumber,
                                                                radio_type: radioType,
                                                                ble_mode: remoteIndex.ble_mode,
                                                                priority: remoteIndex.priority,
                                                                sub_cate: subCate,
                                                                applied_remote_version: "V" + remoteIndex.remote_applied_version || 'V1.4.0',
                                                                applied_device_version: "V" + remoteIndex.device_applied_version || 'V1.4.0',
                                                                banned_remote_version: "V" + remoteIndex.remote_banned_version || 'V99.0.0',
                                                                banned_device_version: "V" + remoteIndex.device_banned_version || 'V99.0.0',
                                                                kk_remote_number: remoteIndex.kk_remote_number,
                                                                category_name_tw: remoteIndex.category_name_tw,
                                                                brand_name_tw: remoteIndex.brand_name_tw,
                                                                binary_md5: fileHash,
                                                                ble_remote_index: remoteIndex.ble_remote_index,
                                                                input_source: inputSource,
                                                                protector: remoteIndex.protector
                                                            };

                                                            // see if this remote index is already in database
                                                            var conditions = {
                                                                // category_id: remoteIndex.category_id,
                                                                // brand_id: remoteIndex.brand_id,
                                                                protocol: tagType,
                                                                remote: remoteIndex.remote_name,
                                                                status: orm.gt(enums.ITEM_INVALID)
                                                            };

                                                            RemoteIndex.findRemoteIndexByCondition(conditions,
                                                                function(findRemoteIndexErr, remoteIndexes) {
                                                                    if(errorCode.SUCCESS.code == findRemoteIndexErr.code &&
                                                                        remoteIndexes &&
                                                                        remoteIndexes.length > 0) {
                                                                        logger.info("remote index already exists, failed this time");
                                                                        /*
                                                                        RemoteIndex.updateRemoteIndex(remoteIndexes[0].id,
                                                                            newRemoteIndex,
                                                                            function(updateRemoteIndexErr, updatedRemoteIndex) {
                                                                                callback(updateRemoteIndexErr, updatedRemoteIndex);
                                                                            });
                                                                        */
                                                                        callback(errorCode.FAILED, null);
                                                                    } else {
                                                                        RemoteIndex.createRemoteIndex(newRemoteIndex,
                                                                            function(createRemoteIndexErr, createdRemoteIndex) {
                                                                                callback(createRemoteIndexErr, createdRemoteIndex);
                                                                            });
                                                                    }
                                                                });
                                                        } else {
                                                            logger.error("save file object to OSS failed : " + createObjectErr);
                                                            callback(errorCode.FAILED, null);
                                                        }
                                                    });
                                            }
                                        });
                                }
                            });
                        } else {
                            logger.info("remote " + remoteIndex.remote_name + " generating failed");
                            callback(errorCode.FAILED, null);
                        }
                    });
                } catch (exception) {
                    logger.error('failed to execute python script from application');
                    callback(errorCode.FAILED, null);
                }
            }
        } else {
            logger.info("invalid admin ID, return directly");
            callback(errorCode.FAILED, null);
        }
    });
};

exports.deleteRemoteIndexWorkUnit = function (remoteIndex, adminID, callback) {
    // delete remote information from release server first
    var queryParams = new Map();
    queryParams.put("app_key", REQUEST_APP_KEY);
    queryParams.put("app_token", REQUEST_APP_TOKEN);

    Admin.getAdminByID(adminID, function(getAdminErr, admin) {
        if (errorCode.SUCCESS.code == getAdminErr.code && null != admin) {
            if (admin.admin_type == enums.ADMIN_TYPE_EXTERNAL) {
                if(remoteIndex.input_source.indexOf(admin.user_name) == -1) {
                    logger.info("this admin " + admin.user_name + " could not change this remote index");
                    callback(errorCode.FAILED);
                    return;
                }
            }
            var requestSender =
                new RequestSender(PRIMARY_SERVER_ADDRESS, PRIMARY_SERVER_PORT, DELETE_REMOTE_INDEX_SERVICE, queryParams);

            requestSender.sendPostRequest(remoteIndex, function(deleteRemoteIndexesRequestErr, deleteRemoteIndexesResponse) {
                /*
                 if(errorCode.SUCCESS.code == deleteRemoteIndexesRequestErr &&
                 JSON.parse(deleteRemoteIndexesResponse).status.code == errorCode.SUCCESS.code) {
                 RemoteIndex.deleteRemoteIndex(remoteIndex.id, function(deleteRemoteIndexErr) {
                 callback(deleteRemoteIndexErr);
                 });
                 } else {
                 logger.error("failed to delete remote index from main server");
                 callback(errorCode.FAILED);
                 }
                 */
                // perform delete action accordingly despite the result of remote deletion
                RemoteIndex.deleteRemoteIndex(remoteIndex.id, function(deleteRemoteIndexErr) {
                    callback(deleteRemoteIndexErr);
                });
            });
        } else {
            callback(errorCode.FAILED);
        }
    });
};

exports.verifyRemoteIndexWorkUnit = function (remoteIndex, pass, adminID, callback) {
    Admin.getAdminByID(adminID, function(getAdminErr, admin) {
        if (errorCode.SUCCESS.code == getAdminErr.code && null != admin) {
            if (admin.admin_type == enums.ADMIN_TYPE_EXTERNAL) {
                if (remoteIndex.input_source.indexOf(admin.user_name) == -1) {
                    logger.info("this admin " + admin.user_name + " could not change this remote index");
                    callback(errorCode.FAILED);
                    return;
                }
            }
            var status = 0 == pass ? enums.ITEM_PASS : enums.ITEM_FAILED;

            RemoteIndex.verifyRemoteIndex(remoteIndex.id, status, function(updateRemoteIndexErr) {
                callback(updateRemoteIndexErr);
            });
        } else {
            callback(errorCode.FAILED);
        }
    });
};

exports.fallbackRemoteIndexWorkUnit = function (remoteIndex, adminID, callback) {
    Admin.getAdminByID(adminID, function(getAdminErr, admin) {
        if (errorCode.SUCCESS.code == getAdminErr.code && null != admin) {
            if (admin.admin_type == enums.ADMIN_TYPE_EXTERNAL) {
                if (remoteIndex.input_source.indexOf(admin.user_name) == -1) {
                    logger.info("this admin " + admin.user_name + " could not change this remote index");
                    callback(errorCode.FAILED);
                    return;
                }
            }
            var status = enums.ITEM_VERIFY;

            RemoteIndex.fallbackRemoteIndex(remoteIndex.id, status, function(updateRemoteIndexErr) {
                callback(updateRemoteIndexErr);
            });
        } else {
            callback(errorCode.FAILED);
        }
    });
};

exports.publishRemoteIndexWorkUnit = function (callback) {
    var find = '\\\\';
    var re = new RegExp(find, 'g');
    var unixFilePath = (FILE_TEMP_PATH + "/").replace(re, '/');
    var lios = unixFilePath.lastIndexOf('/');
    var fileDir = unixFilePath.substring(0, lios);
    var outputFileName = '';
    var uploadedRIIds = [];
    var downloadOssFilePath = '';
    var localFilePath = '';

    var conditions = null;
    conditions = {
        status: enums.ITEM_PASS
    };

    logger.info("publish remote indexes");

    //////////////////////////////////////
    // step 1, find remote indexes whose status is PASSED
    RemoteIndex.findRemoteIndexByCondition(conditions, function(findRemoteIndexErr, remoteIndexes) {
        if(errorCode.SUCCESS.code == findRemoteIndexErr.code) {
            logger.info("find remote indexes successfully, size of remote index list : " + remoteIndexes.length);
            //////////////////////////////////////
            // step 2, download binaries from debug bucket and upload them to release bucket
            var aliOss = new OSS(OSS_HOST, OSS_PORT, OSS_APP_ID, OSS_APP_SECRET);

            async.eachSeries(remoteIndexes, function (remoteIndex, innerCallback) {
                var remoteName = remoteIndex.remote;
                var protocolName = remoteIndex.protocol;
                var binFileName = fileDir + "/ykir_" + protocolName + "_" + remoteName + ".bin";
                logger.info("binary file name = " + binFileName);

                downloadOssFilePath = "ykir_" + protocolName + "_" +
                    remoteName + ".bin";
                localFilePath = FILE_TEMP_PATH + "/binary_transfer/" + downloadOssFilePath;
                logger.info("local file path = " + localFilePath);
                aliOss.serveObjectByID(downloadOssFilePath, BUCKET_NAME, localFilePath,
                    function (serveObjectErr, response) {
                        if (errorCode.SUCCESS.code == serveObjectErr) {
                            logger.info("serve remote binary object successfully : " + downloadOssFilePath);

                            fs.readFile(localFilePath, function(readFileErr, fileData) {
                                if (readFileErr) {
                                    logger.error("read remote code binary file error : " + readFileErr);
                                    innerCallback();
                                } else {
                                    logger.info("read remote binary file successfully, file size = " + fileData.length);
                                    
                                    // do not specify objectID for newly created media
                                    outputFileName = "ykir_" + protocolName + "_" +
                                        remoteName + ".bin";
                                    aliOss.saveObjectFromBinary(outputFileName, fileData, RELEASE_RC_BUCKET_NAME, "application/octet-stream",
                                        function (createObjectErr, objectID) {
                                            if (errorCode.SUCCESS.code == createObjectErr) {
                                                logger.info("successfully uploaded file " + binFileName);
                                                // do not update status for unpublished remote indexes here since we need do more things
                                                /*
                                                 RemoteIndex.publishRemoteIndex(remoteIndex.id, enums.ITEM_VALID, function(publishRemoteIndexErr) {
                                                 // process next anyway
                                                 innerCallback();
                                                 });
                                                 */
                                                uploadedRIIds.push(remoteIndex.id);
                                                innerCallback();
                                            } else {
                                                logger.error("upload file " + binFileName + " failed");
                                                innerCallback();
                                            }
                                        });
                                }
                            });
                        } else {
                            logger.error("failed to download remote binary from bucket");
                            innerCallback();
                        }
                    });
            }, function(err) {
                if (err) {
                    logger.warn("failed to upload some item of remote indexes");
                } else {
                    logger.info("successfully uploaded all the binary files associated with passed remote indexes");
                }
                //////////////////////////////////////
                // step 3, find remote index items whose status is PASSED from DB
                logger.info(JSON.stringify(uploadedRIIds));
                conditions = {
                    id: uploadedRIIds
                };
                RemoteIndex.findRemoteIndexByCondition(conditions, function(findRemoteIndexesErr, remoteIndexes) {
                    logger.info(JSON.stringify(remoteIndexes));
                    //////////////////////////////////////
                    // step 4, send request to primary server with found remote indexes
                    if (errorCode.SUCCESS.code == findRemoteIndexesErr.code &&
                        undefined != remoteIndexes && null != remoteIndexes && remoteIndexes.length > 0) {
                        // send out going HTTP request to primary server

                        var queryParams = new Map();
                        queryParams.put("app_key", REQUEST_APP_KEY);
                        queryParams.put("app_token", REQUEST_APP_TOKEN);

                        var requestSender =
                            new RequestSender(PRIMARY_SERVER_ADDRESS, PRIMARY_SERVER_PORT, PUBLISH_REMOTE_INDEX_SERVICE, queryParams);

                        requestSender.sendPostRequest(remoteIndexes,
                            function(publishRemoteIndexesRequestErr, publishRemoteIndexesResponse) {
                                if(errorCode.SUCCESS.code == publishRemoteIndexesRequestErr &&
                                    JSON.parse(publishRemoteIndexesResponse).status.code == errorCode.SUCCESS.code) {
                                    logger.info("send remote indexes publish request successfully");
                                    // continue updating the status of brand in local server
                                    async.eachSeries(remoteIndexes, function (remoteIndex, innerCallback) {
                                        RemoteIndex.publishRemoteIndex(remoteIndex.id, enums.ITEM_VALID,
                                            function(publishRemoteIndexErr) {
                                                innerCallback();
                                            });
                                    }, function (err) {
                                        callback(errorCode.SUCCESS);
                                    });
                                } else {
                                    logger.info("send remote publish request failed");
                                    callback(errorCode.FAILED);
                                }
                            });
                    } else {
                        callback(findRemoteIndexesErr);
                    }
                });
            });
        } else {
            logger.warn("remote indexes list is empty");
            callback(errorCode.FAILED);
        }
    });
};

exports.createBrandWorkUnit = function (brand, ip, adminID, callback) {
    var conditions = {
        category_id: brand.category_id,
        name: brand.name,
        status: enums.ITEM_VERIFY
    };

    Admin.getAdminByID(adminID, function(getAdminErr, admin) {
        if (errorCode.SUCCESS.code == getAdminErr.code && null != admin) {
            if (admin.admin_type == enums.ADMIN_TYPE_EXTERNAL) {
                logger.info("this admin " + admin.user_name + " could not change this remote index");
                callback(errorCode.FAILED);
                return;
            }

            brand.input_source = admin.user_name + "-" + ip;
            Brand.findBrandByConditions(conditions, function(findBrandErr, brands) {
                if(errorCode.SUCCESS.code == findBrandErr.code && null != brands && brands.length > 0) {
                    logger.info("brand already exists");
                    callback(errorCode.SUCCESS);
                } else {
                    Brand.createBrand(brand, function(createBrandErr, createdBrand) {
                        callback(createBrandErr, createdBrand);
                    });
                }
            });
        } else {
            logger.info("invalid admin ID, return directly");
            callback(errorCode.FAILED, null);
        }
    });
};

exports.publishBrandsWorkUnit = function (callback) {
    var conditions = {
        status: enums.ITEM_VERIFY
    };
    Brand.findBrandByConditions(conditions, function(findBrandErr, brands) {
        if(errorCode.SUCCESS.code == findBrandErr.code && null != brands && brands.length > 0) {
            logger.info("unpublished brand list has been found");
            // send out going HTTP request to primary server

            var queryParams = new Map();
            queryParams.put("app_key", REQUEST_APP_KEY);
            queryParams.put("app_token", REQUEST_APP_TOKEN);

            var requestSender =
                new RequestSender(PRIMARY_SERVER_ADDRESS, PRIMARY_SERVER_PORT, PUBLISH_BRAND_SERVICE, queryParams);

            requestSender.sendPostRequest(brands, function(publishBrandRequestErr, publishBrandsResponse) {
                if(errorCode.SUCCESS.code == publishBrandRequestErr &&
                    JSON.parse(publishBrandsResponse).status.code == errorCode.SUCCESS.code) {
                    logger.info("send brand publish request successfully");
                    // continue updating the status of brand in local server
                    async.eachSeries(brands, function (brand, innerCallback) {
                        brand.status = enums.ITEM_VALID;
                        Brand.updateBrandByID(brand.id, brand, function(updateBrandErr, updatedBrand) {
                            innerCallback();
                        });
                    }, function (err) {
                        callback(errorCode.SUCCESS);
                    });
                } else {
                    logger.info("send brand publish request failed");
                    callback(errorCode.FAILED);
                }
            });
        } else {
            logger.info("there is no brand need to be published");
            callback(errorCode.SUCCESS);
        }
    });
};

exports.createProtocolWorkUnit = function(protocol, filePath, contentType, adminID, callback) {
    //////////////////////////////////////
    // step 1, rename input remote xml file
    var find = '\\\\';
    var re = new RegExp(find, 'g');
    var unixFilePath = filePath.replace(re, '/');
    var lios = unixFilePath.lastIndexOf('/');
    var fileDir = unixFilePath.substring(0, lios);

    var protocolName = protocol.protocol_name_b;
    var srcFile = fileDir + "/" + protocolName + ".xml";
    var destFile = fileDir + "/" + protocolName + ".bin";
    var protocolType = protocol.protocol_type;
    var localProtocolFile = "";
    var remoteProtocolFile = "";

    var pythonRuntimeDir = fileDir,
        pythonFile = "s_pro.py",
        userArgs = [];
    
    if (enums.PROTOCOL_TYPE_G2_QUATERNARY == protocolType) {
        pythonFile = "s_pro.py";
    } else if (enums.PROTOCOL_TYPE_G2_HEXDECIMAL == protocolType) {
        pythonFile = "s_pro_hex.py";
    }

    Admin.getAdminByID(adminID, function(getAdminErr, admin) {
        if (errorCode.SUCCESS.code == getAdminErr.code && null != admin) {

            logger.info("get admin error code = " + JSON.stringify(getAdminErr) + ", admin = " + JSON.stringify(admin));

            if (admin.admin_type == enums.ADMIN_TYPE_EXTERNAL) {
                logger.info("this admin " + admin.user_name + " could not create protocol");
                callback(errorCode.FAILED);
                return;
            }
            //////////////////////////////////////
            // step 2, parse python run-time path, python file name and user arguments
            logger.info("prepare to parse protocol");
            userArgs.length = 0;
            // python s_$category.py [remote_xml_file_abs_file] [remote_xml_file_name] [remote_xml_dir_abs_path]
            userArgs.push(srcFile);
            userArgs.push(destFile);

            //////////////////////////////////////
            // step 3, try executing remote encoding script
            var pythonCaller = new PythonCaller();
            try {
                logger.info("prepare to call python script");
                pythonCaller.call(pythonRuntimeDir, pythonFile, userArgs, function(protocolGenErr, genResult) {
                    if(errorCode.SUCCESS.code == protocolGenErr) {
                        //////////////////////////////////////
                        // step 3.5, upload protocol binary file to OSS
                        localProtocolFile = destFile;
                        fs.readFile(localProtocolFile, function(readFileErr, fileData) {
                            if (readFileErr) {
                                logger.error("read protocol binary file error : " + readFileErr);
                                callback(errorCode.FAILED);
                            } else {
                                logger.info("read protocol binary successfully, file size = " + fileData.length);

                                var aliOss = new OSS(OSS_HOST, OSS_PORT, OSS_APP_ID, OSS_APP_SECRET);
                                remoteProtocolFile = protocolName + ".bin";
                                aliOss.saveObjectFromBinary(remoteProtocolFile, fileData, PROTOCOL_BUCKET_NAME,
                                    "application/octet-stream",
                                    function (createObjectErr, objectID) {
                                        if (errorCode.SUCCESS.code == createObjectErr) {
                                            //////////////////////////////////////
                                            // step 4, try register protocol to db
                                            var newProtocol = {
                                                name: protocolName,
                                                status: enums.ITEM_VALID,
                                                type: protocolType
                                            };

                                            var conditions = {
                                                name: protocolName
                                            };

                                            logger.info("pro.py called successfully, create protocol in DB");
                                            IRProtocol.findIRProtocolByConditions(conditions, function(findIRProtocolErr, IRProtocols) {
                                                if(errorCode.SUCCESS.code == findIRProtocolErr.code &&
                                                    null != IRProtocols &&
                                                    IRProtocols.length > 0) {
                                                    logger.info("protocol " + protocolName + " already exists, nothing to be updated");
                                                    callback(errorCode.SUCCESS);
                                                } else {
                                                    IRProtocol.createIRProtocol(newProtocol, function(createIRProtocolErr, createdIRProtocol) {
                                                        callback(createIRProtocolErr);
                                                    });
                                                }
                                            });
                                        } else {
                                            logger.error("upload protocol binary file failed");
                                            callback(errorCode.FAILED);
                                        }
                                    });
                            }
                        });
                    } else {
                        logger.error("pro.py called failed : " + protocolGenErr);
                        callback(errorCode.FAILED);
                    }
                });
            } catch (exception) {
                logger.error('failed to execute python script from application');
                callback(errorCode.FAILED);
            }
        } else {
            logger.error('failed to check admin type');
            callback(errorCode.FAILED);
        }
    });
};

exports.createVersionWorkUnit = function(adminID, version, devWlanFile, devBleFile, remBleFile, ipaFile, apkFile,
                                         contentType, callback) {
    var sourcePath = "";
    var binFileName = "";
    var binFilePath = "";
    var find = "\\\\";
    var re = new RegExp(find, 'g');
    var lios = 0;
    var baseDir = "";
    var uploadSuccess = 1;

    var devWlanHash,
        devBleHash,
        remBleHash,
        ipaHash,
        apkHash;

    var outputFileName = "irext/";

    var fileArray = [];
    if (null != devWlanFile && "" != devWlanFile && version.version_type == "0") {
        logger.info("found dev wlan file, added into array" + devWlanFile);
        fileArray.push({
            path: devWlanFile,
            type: 0
        });
    }
    if (null != devBleFile && "" != devBleFile && version.version_type == "0") {
        logger.info("found dev ble file, added into array" + devBleFile);
        fileArray.push({
            path: devBleFile,
            type: 1
        });
    }
    if (null != remBleFile && "" != remBleFile && version.version_type == "1") {
        logger.info("found rem ble file, added into array : " + remBleFile);
        if (version.sub_type == '0') {
            // singular remote binary
            fileArray.push({
                path: remBleFile,
                type: 2
            });
        } else {
            // remote binary
            fileArray.push({
                path: remBleFile,
                type: 3
            });
        }
    }
    if (null != ipaFile && "" != ipaFile && version.version_type == "2") {
        logger.info("found ipa file, added into array" + ipaFile);
        fileArray.push({
            path: ipaFile,
            type: 4
        });
    }
    if (null != apkFile && "" != apkFile && version.version_type == "3") {
        logger.info("found apk file, added into array" + apkFile);
        fileArray.push({
            path: apkFile,
            type: 5
        });
    }

    logger.info("count of file filled = " + fileArray.length);

    async.eachSeries(fileArray, function (binFile, innerCallback) {
        sourcePath = binFile.path.replace(re, '/');
        lios = sourcePath.lastIndexOf('/');
        baseDir = sourcePath.substring(0, lios);

        switch(parseInt(binFile.type)) {
            case 0:
                // file template:
                // dev_wlan_V1.7.0.bin
                binFilePath = baseDir + "/" + "dev_wlan_" + version.dev_wlan_ver + ".bin";
                binFileName = "dev_wlan_" + version.dev_wlan_ver + ".bin";
                outputFileName = "irext/";
                break;
            case 1:
                // file template:
                // dev_ble_V1.7.0.bin
                // dev_ble_V1.7.0.hex
                if ("0" == version.purpose || "1" == version.purpose) {
                    binFilePath = baseDir + "/" + "dev_ble_" + version.dev_ble_ver + ".bin";
                    binFileName = "dev_ble_" + version.dev_ble_ver + ".bin";
                } else {
                    binFilePath = baseDir + "/" + "dev_ble_" + version.dev_ble_ver + ".hex";
                    binFileName = "dev_ble_" + version.dev_ble_ver + ".hex";
                }
                outputFileName = "irext/";
                break;
            case 2:
                // file template:
                // ucon_ble_V1.7.0.bin
                // ucon_ble_V1.7.0.hex
                if ("0" == version.purpose || "1" == version.purpose) {
                    binFilePath = baseDir + "/" + "ucon_ble_" + version.rem_ble_ver + ".bin";
                    binFileName = "ucon_ble_" + version.rem_ble_ver + ".bin";
                } else {
                    binFilePath = baseDir + "/" + "ucon_ble_" + version.rem_ble_ver + ".hex";
                    binFileName = "ucon_ble_" + version.rem_ble_ver + ".hex";
                }
                outputFileName = "irext/";
                break;
            case 3:
                // file template:
                // rem_ble_V1.7.0.bin
                // rem_ble_V1.7.0.hex
                if ("0" == version.purpose || "1" == version.purpose) {
                    binFilePath = baseDir + "/" + "rem_ble_" + version.rem_ble_ver + ".bin";
                    binFileName = "rem_ble_" + version.rem_ble_ver + ".bin";
                } else {
                    binFilePath = baseDir + "/" + "rem_ble_" + version.rem_ble_ver + ".hex";
                    binFileName = "rem_ble_" + version.rem_ble_ver + ".hex";
                }
                outputFileName = "irext/";
                break;
            case 4:
                binFilePath = baseDir + "/" + "UCON_iOS_" + version.ipa_ver + ".ipa";
                binFileName = "UCON_iOS_" + version.ipa_ver + ".ipa";
                outputFileName = "iOS/";
                break;
            case 5:
                binFilePath = baseDir + "/" + "UCON_Android_" + version.apk_ver + ".apk";
                binFileName = "UCON_Android_" + version.apk_ver + ".apk";
                outputFileName = "Android/";
                break;
            default:
                logger.error("fault version file or name!");
                break;
        }

        fs.readFile(binFilePath, function(readFileErr, fileData) {
            if (readFileErr) {
                logger.error("read remote code binary file error : " + readFileErr);
                uploadSuccess = 0;
                innerCallback();
            } else {
                var hash = checksum(fileData);
                switch(parseInt(binFile.type)) {
                    case 0:
                        devWlanHash = hash;
                        break;
                    case 1:
                        devBleHash = hash;
                        break;
                    case 2:
                    case 3:
                        remBleHash = hash;
                        break;
                    case 4:
                        devWlanHash = hash;
                        break;
                    case 5:
                        devWlanHash = hash;
                        break;
                    default:
                        break;
                }
                // logger.info("read version binary file successfully, file size = " + hash);
                var aliOss = new OSS(OSS_HOST, OSS_PORT, OSS_APP_ID, OSS_APP_SECRET);
                outputFileName += binFileName;
                logger.info("read version binary file successfully,oss path = " + outputFileName);

                aliOss.saveObjectFromBinary(outputFileName, fileData, RELEASE_BUCKET_NAME, "application/octet-stream",
                    function (createObjectErr, objectID) {
                        if (errorCode.SUCCESS.code == createObjectErr) {
                            logger.info("successfully uploaded file " + outputFileName);
                            innerCallback();
                        } else {
                            logger.error("upload file " + outputFileName + " failed");
                            uploadSuccess = 0;
                            innerCallback();
                        }
                    });
            }
        });
    }, function (err) {
        if (0 == uploadSuccess) {
            logger.error("file upload failed due to some reason");
            callback(errorCode.FAILED);
        } else {
            // create version in database
            Admin.getAdminByID(adminID, function(getAdminErr, admin) {
                if (errorCode.SUCCESS.code == getAdminErr.code && null != admin) {

                    var findVersionConditions = {
                        version_type: version.version_type,
                        sub_type: version.sub_type,
                        remote_type: version.remote_type,
                        purpose: version.purpose,
                        dev_wlan_ver: version.dev_wlan_ver,
                        dev_ble_ver: version.dev_ble_ver,
                        rem_ble_ver: version.rem_ble_ver,
                        status: enums.ITEM_VERIFY
                    };
                    Version.findVersionByConditions(findVersionConditions, function(findVersionErr, versions) {
                        var newVersion = {
                            version_type: version.version_type,
                            // dev_wlan_ver: version.dev_wlan_ver,
                            dev_ble_ver: version.dev_ble_ver,
                            rem_ble_ver: version.rem_ble_ver,
                            dev_wlan_hash: devWlanHash,
                            dev_ble_hash: devBleHash,
                            rem_ble_hash: remBleHash,
                            uploader: admin.user_name,
                            comment: version.description,
                            purpose: version.purpose,
                            sub_type: version.sub_type,
                            remote_type: version.remote_type
                        };
                        if (version.version_type == "0") {
                            newVersion.dev_wlan_ver = version.dev_wlan_ver;
                        } else if (version.version_type == "2") {
                            newVersion.dev_wlan_ver = version.ipa_ver;
                        } else if (version.version_type == "3") {
                            newVersion.dev_wlan_ver = version.apk_ver;
                        }

                        if (errorCode.SUCCESS.code == findVersionErr.code &&
                            null != versions &&
                            versions.length > 0) {
                            logger.info("there is an exactly same version, update it");

                            var id = versions[0].id;
                            Version.updateVersionByID(id, newVersion, function(updateVersionErr, updatedVersion) {
                                logger.info("update version done, result = " + updateVersionErr.code);
                                callback(updateVersionErr);
                            });
                        } else {
                            logger.info("version does not exist, create a new one");

                            Version.createVersion(newVersion, function(createVersionErr, createdVersion) {
                                logger.info("create version done, result = " + createVersionErr.code);
                                callback(createVersionErr);
                            });
                        }
                    });
                } else {
                    callback(errorCode.FAILED);
                }
            });
        }
    });
};

exports.deleteVersionWorkUnit = function (versionID, callback) {
    Version.deleteVersion(versionID, function(deleteVersionErr) {
        callback(deleteVersionErr);
    });
};

exports.verifyVersionWorkUnit = function (versionID, pass, callback) {
    var status = 0 == pass ? enums.ITEM_PASS : enums.ITEM_FAILED;

    Version.verifyVersion(versionID, status, function(updateVersionIndexErr) {
        callback(updateVersionIndexErr);
    });
};

exports.fallbackVersionWorkUnit = function (version, adminID, callback) {
    Admin.getAdminByID(adminID, function(getAdminErr, admin) {
        if (errorCode.SUCCESS.code == getAdminErr.code && null != admin) {
            if (admin.admin_type == enums.ADMIN_TYPE_EXTERNAL) {
                if (version.uploader.indexOf(admin.user_name) == -1) {
                    logger.info("this admin " + admin.user_name + " could not change this version status");
                    callback(errorCode.FAILED);
                    return;
                }
            }
            var status = enums.ITEM_VERIFY;

            Version.fallbackVersion(version.id, status, function(updateVersionErr) {
                callback(updateVersionErr);
            });
        } else {
            callback(errorCode.FAILED);
        }
    });
};

exports.publishVersionWorkUnit = function (versionID, callback) {
    var ossFilePath = "irext/";
    var unpublishFileArray = [];
    var unpublishedFile = "";
    var downloadOssFilePath = "";
    var localFilePath = "";
    var publishSuccess = 1;
    var outputFilePath = "";

    Version.getVersion(versionID, function(getVersionErr, version) {
        if (errorCode.SUCCESS.code == getVersionErr.code) {
            if (null != version && version.status == enums.ITEM_PASS) {
                //////////////////////////////////////
                // step 1, construct download file array according to version type
                if ("0" == version.version_type) {
                    // version group of irext Kits
                    ossFilePath = "irext/";
                    unpublishedFile = {
                        path: "dev_wlan_" + version.dev_wlan_ver + ".bin",
                        hash: version.dev_wlan_hash
                    };
                    unpublishFileArray.push(unpublishedFile);

                    if("0" == version.purpose || "1" == version.purpose) {
                        unpublishedFile = {
                            path: "dev_ble_" + version.dev_ble_ver + ".bin",
                            hash: version.dev_ble_hash
                        };
                    } else if ("2" == version.purpose) {
                        unpublishedFile = {
                            path: "dev_ble_" + version.dev_ble_ver + ".hex",
                            hash: version.dev_ble_hash
                        };
                    } else {
                        logger.error("purpose of version error");
                        callback (errorCode.FAILED);
                    }

                    unpublishFileArray.push(unpublishedFile);
                } else if ("1" == version.version_type) {
                    // version group of irext remote
                    ossFilePath = "irext/";
                    var prefix,
                        suffix;
                    if ("0" == version.sub_type) {
                        prefix = "ucon_ble_";
                    } else if ("1" == version.sub_type) {
                        prefix = "rem_ble_";
                    } else {
                        logger.error("sub type of version error");
                        callback (errorCode.FAILED);
                    }

                    if("0" == version.purpose || "1" == version.purpose) {
                        suffix = ".bin";
                    } else if ("2" == version.purpose) {
                        suffix = ".hex";
                    } else {
                        logger.error("purpose of version error");
                        callback (errorCode.FAILED);
                    }

                    unpublishedFile = {
                        path: prefix + version.rem_ble_ver + suffix,
                        hash: version.rem_ble_hash
                    };
                    unpublishFileArray.push(unpublishedFile);
                } else if ("2" == version.version_type) {
                    // version group of iOS Client
                    // actually, since we publish iOS client via App Store
                    // here we need do nothing, but indicate user
                    var queryParams = new Map();
                    queryParams.put("app_key", REQUEST_APP_KEY);
                    queryParams.put("app_token", REQUEST_APP_TOKEN);

                    var requestSender =
                        new RequestSender(PRIMARY_SERVER_ADDRESS, PRIMARY_SERVER_PORT, PUBLISH_VERSION_SERVICE, queryParams);

                    requestSender.sendPostRequest(version, function(publishVersionRequestErr, publishVersionResponse) {
                        if(errorCode.SUCCESS.code == publishVersionRequestErr &&
                            JSON.parse(publishVersionResponse).status.code == errorCode.SUCCESS.code) {
                            logger.info("send version publish request successfully");
                            // step 6, update local information of published version in order to
                            // sync up with release server
                            Version.publishVersion(version.id, function(publishVersionErr, publishedVersion) {
                                callback(publishVersionErr);
                            });
                        } else {
                            logger.info("send version publish request failed");
                            callback(errorCode.FAILED);
                        }
                    });
                    return;
                } else if ("3" == version.version_type) {
                    // version group of Android Client
                    ossFilePath = "Android/";
                    unpublishedFile = {
                        path: "UCON_Android_" + version.dev_wlan_ver + ".apk",
                        hash: version.dev_wlan_hash
                    };
                    unpublishFileArray.push(unpublishedFile);
                } else {
                    logger.error("invalid version type");
                    callback(errorCode.FAILED);
                }
                var aliOss = new OSS(OSS_HOST, OSS_PORT, OSS_APP_ID, OSS_APP_SECRET);

                // walk into async loop
                async.eachSeries(unpublishFileArray, function (unpublishedFile, innerCallback) {
                    var downloadFile = unpublishedFile.path;
                    logger.info("downloadFile = " + downloadFile);

                    downloadOssFilePath = ossFilePath + downloadFile;
                    localFilePath = FILE_TEMP_PATH + "/version_published/" + downloadFile;
                    logger.info("local file path = " + localFilePath);

                    // step 2, download version from debug bucket and upload it to release bucket, while doing MD5 checksum
                    aliOss.serveObjectByID(downloadOssFilePath, RELEASE_BUCKET_NAME, localFilePath,
                    function (serveObjectErr, response) {
                        if (errorCode.SUCCESS.code == serveObjectErr) {
                            logger.info("serve remote binary object successfully : " + downloadOssFilePath);

                            // step 3, read temp file and verify MD5 checksum
                            fs.readFile(localFilePath, function(readFileErr, fileData) {
                                if (readFileErr) {
                                    logger.error("read remote code binary file error : " + readFileErr);
                                    publishSuccess = 0;
                                    innerCallback();
                                } else {
                                    var hash = checksum(fileData);
                                    if (hash == unpublishedFile.hash) {
                                        outputFilePath = ossFilePath + downloadFile;
                                        logger.info("read version binary file successfully,oss path = " + outputFilePath);

                                        // step 4, upload specific file to published OSS bucket
                                        aliOss.saveObjectFromBinary(outputFilePath, fileData, PUBLISHED_RELEASE_BUCKET_NAME, "application/octet-stream",
                                            function (createObjectErr, objectID) {
                                                if (errorCode.SUCCESS.code == createObjectErr) {
                                                    logger.info("successfully uploaded file " + outputFilePath);
                                                    innerCallback();
                                                } else {
                                                    logger.error("upload file " + outputFilePath + " failed");
                                                    publishSuccess = 0;
                                                    innerCallback();
                                                }
                                            });
                                    } else {
                                        logger.error("hash not matched for unpublished file");
                                        publishSuccess = 0;
                                        innerCallback();
                                    }
                                }
                            });
                        } else {
                            logger.info("failed to serve binary object : " + downloadOssFilePath);
                            publishSuccess = 0;
                            innerCallback();
                        }
                    });
                }, function (err) {
                    if (0 == publishSuccess) {
                        logger.error("download/verify/upload version failed");
                        callback(errorCode.FAILED);
                    } else {
                        logger.info("it indicates download file completed");

                        // step 5, request for version registration, and update console data
                        var queryParams = new Map();
                        queryParams.put("app_key", REQUEST_APP_KEY);
                        queryParams.put("app_token", REQUEST_APP_TOKEN);

                        var requestSender =
                            new RequestSender(PRIMARY_SERVER_ADDRESS, PRIMARY_SERVER_PORT, PUBLISH_VERSION_SERVICE, queryParams);

                        requestSender.sendPostRequest(version, function(publishVersionRequestErr, publishVersionResponse) {
                            if(errorCode.SUCCESS.code == publishVersionRequestErr &&
                                JSON.parse(publishVersionResponse).status.code == errorCode.SUCCESS.code) {
                                logger.info("send version publish request successfully");
                                // step 6, update local information of published version in order to
                                // sync up with release server
                                Version.publishVersion(version.id, function(publishVersionErr, publishedVersion) {
                                    callback(publishVersionErr);
                                });
                            } else {
                                logger.info("send version publish request failed");
                                callback(errorCode.FAILED);
                            }
                        });
                    }
                });
            } else {
                logger.error("version is null or not validated, return failure");
                callback (errorCode.FAILED);
            }
        } else {
            callback (getVersionErr);
        }
    });
};

// Ultilities
function checksum(str, algorithm, encoding) {
    return crypto
        .createHash(algorithm || 'md5')
        .update(str, 'utf8')
        .digest(encoding || 'hex')
}

function createBleRemoteIndex(newBleRemoteIndex, callback) {
    var conditions = {
        remote_index_id: newBleRemoteIndex.remote_index_id,
        status: enums.ITEM_VALID
    };
    logger.info("create ble remote index work unit, find ble remote index by remote_index_id : " +
        newBleRemoteIndex.remote_index_id);
    VirtualBleRemoteIndex.prototype.findBleRemoteIndexByCondition(conditions,
        function(findBleRemoteIndexErr, bleRemoteIndex) {
            if (errorCode.SUCCESS.code == findBleRemoteIndexErr.code &&
                null != bleRemoteIndex) {
                logger.info("successfully found ble_remote_indexes, update it");
                VirtualBleRemoteIndex.prototype.updateBleRemoteIndexByID(bleRemoteIndex._id, newBleRemoteIndex,
                    function(updateBleRemoteIndexErr, updatedBleRemoteIndex) {
                        callback(updateBleRemoteIndexErr, updatedBleRemoteIndex);
                    });
            } else {
                logger.info("failed to find ble_remote_indexes, create it");
                VirtualBleRemoteIndex.prototype.createBleRemoteIndex(newBleRemoteIndex,
                    function(createBleRemoteIndexErr, createdBleRemoteIndex) {
                        callback(createBleRemoteIndexErr, createdBleRemoteIndex);
                    });
            }
        });
}
