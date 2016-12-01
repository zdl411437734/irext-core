/**
 * Created by Strawmanbobi
 * 2016-11-27
 */

// system inclusion
var constants = require('../../../Infrastructure/BackEnd/configuration/constants');
var formidable = require('formidable');
var fs = require('fs');

// local inclusion
var ServiceResponse = require('../response/service_response.js');
var StatResponse = require('../response/stat_response.js');
var IntegerResponse = require('../response/integer_response');

var logger = require('../../../Infrastructure/BackEnd/logging/logger4js').helper;

var statLogic = require('../work_unit/stat_logic.js');

var Enums = require('../constants/enums');
var ErrorCode = require('../constants/error_code');

var enums = new Enums();
var errorCode = new ErrorCode();

/*
 * function :   Count remote of irext remote and device
 * parameter :  stat_type
 * return :     Customized statistics response
 */
exports.genericCount = function(req, res) {
    var statType = req.query.stat_type;

    var statResponse = new StatResponse();
    statLogic.countRemoteWorkUnit(statType, function(countRemoteErr, statContent) {
        statResponse.status = countRemoteErr;
        statResponse.entity = statContent;
        res.send(statResponse);
        res.end();
    });
};

/*
 * function :   Stat categories
 * parameter :
 * return :     Customized statistics response
 */
exports.statCategories = function(req, res) {
    var statResponse = new StatResponse();
    statLogic.statCategoriesWorkUnit(function(statCategoriesErr, statCategories) {
        statResponse.status = statCategoriesErr;
        statResponse.entity = statCategories;
        res.send(statResponse);
        res.end();
    });
};

/*
 * function :   Stat brands
 * parameter :
 * return :     Customized statistics response
 */
exports.statBrands = function(req, res) {
    var categoryID = req.query.category_id;

    var statResponse = new StatResponse();
    statLogic.statBrandsWorkUnit(categoryID, function(statBrandsErr, statBrands) {
        statResponse.status = statBrandsErr;
        statResponse.entity = statBrands;
        res.send(statResponse);
        res.end();
    });
};

/*
 * function :   Stat cities
 * parameter :
 * return :     Customized statistics response
 */
exports.statCities = function(req, res) {
    var statResponse = new StatResponse();
    statLogic.statCitiesWorkUnit(function(statCitiesErr, statCities) {
        statResponse.status = statCitiesErr;
        statResponse.entity = statCities;
        res.send(statResponse);
        res.end();
    });
};