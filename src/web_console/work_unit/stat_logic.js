/**
 * Created by strawmanbobi
 * 2016-11-27
 */

// global inclusion
require('../mini_poem/configuration/constants');
var logger = require('../mini_poem/logging/logger4js').helper;

// local inclusion
var Category = require('../model/category_dao.js');
var Brand = require('../model/brand_dao.js');
var City = require('../model/city_dao.js');
var RemoteIndex = require('../model/remote_index_dao.js');

var Enums = require('../constants/enums.js');
var ErrorCode = require('../constants/error_code.js');

var enums = new Enums();
var errorCode = new ErrorCode();

var async = require('async');

exports.countRemoteWorkUnit = function(callback) {
    var conditions = {
        status: enums.ITEM_VALID
    };

    Category.countCategories(conditions, function(countCategoriesErr, categoriesCount) {
        Brand.countBrands(conditions, function(countBrandsErr, brandsCount) {
            RemoteIndex.countRemoteIndexes(conditions, function(countRemoteIndexesErr, remoteIndexesCount) {
                var statInfo = new Object();
                statInfo.categories_count = categoriesCount;
                statInfo.brands_count = brandsCount;
                statInfo.remote_indexes_count = remoteIndexesCount;
                callback(errorCode.SUCCESS, statInfo);
            });
        });
    });
};

exports.statCategoriesWorkUnit = function(callback) {
    var conditions = {
        status: enums.ITEM_VALID
    };

    var retCategoriesCount = [];

    Category.listCategories(conditions, 0, 200, "id", function(findCategoriesErr, categories) {
        if (errorCode.FAILED.code == findCategoriesErr.code) {
            logger.error("failed to find categories");
            callback(findCategoriesErr, null);
        } else {
            async.eachSeries(categories, function (category, innerCallback) {
                var categoryName = category.name;
                var categoryID = category.id;
                if (enums.CATEGORY_STB != categoryID) {
                    var countConditions = {
                        category_id: categoryID,
                        status: enums.ITEM_VALID
                    };
                    Brand.countBrands(countConditions,
                        function(countBrandsErr, brandsCount) {
                            if (errorCode.SUCCESS.code == countBrandsErr.code) {
                                var categoryStat = new Object();
                                categoryStat.id = categoryID;
                                categoryStat.name = categoryName;
                                categoryStat.brands_count = brandsCount;
                                retCategoriesCount.push(categoryStat);
                            } else {
                                logger.error("failed to count categories");
                            }
                            innerCallback();
                        });
                } else {
                    var countConditions = "code LIKE '__0000';";
                    City.countCities(countConditions,
                        function(countCitiesErr, citiesCount) {
                            if (errorCode.SUCCESS.code == countCitiesErr.code) {
                                var categoryStat = new Object();
                                categoryStat.id = categoryID;
                                categoryStat.name = categoryName;
                                categoryStat.brands_count = citiesCount[0].number;
                                retCategoriesCount.push(categoryStat);
                            } else {
                                logger.error("failed to count categories");
                            }
                            innerCallback();
                        });
                }

            }, function (err) {
                callback(errorCode.SUCCESS, retCategoriesCount);
            });
        }
    });
};

exports.statBrandsWorkUnit = function (categoryID, callback) {
    var conditions = {
        category_id: categoryID,
        status: enums.ITEM_VALID
    };

    var retBrandsCount = [];

    Brand.listBrands(conditions, 0, 200, "priority", function(findBrandsErr, brands) {
        if (errorCode.FAILED.code == findBrandsErr.code) {
            logger.error("failed to find brands");
            callback(findBrandsErr, null);
        } else {
            async.eachSeries(brands, function (brand, innerCallback) {
                var brandName = brand.name;
                var brandID = brand.id;

                if (enums.CATEGORY_STB != categoryID) {
                    var countConditions = {
                        brand_id: brandID,
                        status: enums.ITEM_VALID
                    };
                    RemoteIndex.countRemoteIndexes(countConditions,
                        function(countRemoteIndexesErr, remoteIndexesCount) {
                            if (errorCode.SUCCESS.code == countRemoteIndexesErr.code) {
                                var brandStat = new Object();
                                brandStat.id = brandID;
                                brandStat.name = brandName;
                                brandStat.remote_indexes_count = remoteIndexesCount;
                                retBrandsCount.push(brandStat);
                            } else {
                                logger.error("failed to count remote indexes");
                            }
                            innerCallback();
                        });
                }
            }, function (err) {
                callback(errorCode.SUCCESS, retBrandsCount);
            });
        }
    });
};

exports.statCitiesWorkUnit = function (callback) {
    var retCitiesCount = [];

    City.listProvinces(function(listProvincesErr, provinces) {
        if (errorCode.FAILED.code == listProvincesErr.code) {
            logger.error("failed to find brands");
            callback(listProvincesErr, null);
        } else {
            async.eachSeries(provinces, function (province, innerCallback) {
                var provinceName = province.name;
                var provinceCode = province.code;
                var provincePrefix = provinceCode.substring(0, 2);
                var countConditions = "code LIKE '" + provincePrefix + "__00' AND code <> '" + provincePrefix + "0000';";
                City.countCities(countConditions,
                    function(countCitiesErr, citiesCount) {
                        if (errorCode.SUCCESS.code == countCitiesErr.code) {
                            var cityStat = new Object();
                            cityStat.name = provinceName;
                            cityStat.city_count = citiesCount[0].number;
                            retCitiesCount.push(cityStat);
                        } else {
                            logger.error("failed to count cities");
                        }
                        innerCallback();
                    });
            }, function (err) {
                callback(errorCode.SUCCESS, retCitiesCount);
            });
        }
    });
};