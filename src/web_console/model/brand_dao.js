/**
 * Created by strawmanbobi
 * 2016-11-27
 */

// global inclusion
var orm = require('orm');
var dbOrm = require('../mini_poem/db/mysql/mysql_connection').mysqlDB;
var logger = require('../mini_poem/logging/logger4js').helper;
var dateUtils = require('../mini_poem/utils/date_utils.js');

// local inclusion
var ErrorCode = require('../constants/error_code');
var Enums = require('../constants/enums');

var errorCode = new ErrorCode();
var enums = new Enums();

var Brand = dbOrm.define('brand',
    {
        id: Number,
        name: String,
        category_id: Number,
        category_name: String,
        status: Number,
        update_time: String,
        priority: Number,
        name_en: String,
        name_tw: String,
        contributor: String
    },
    {
        cache: false
    }
);

Brand.createBrand = function(brand, callback) {
    var date = dateUtils.formatDate(new Date(), "yyyy-MM-dd hh:mm:ss");
    var newBrand = new Brand({
        name: brand.name,
        category_id: brand.category_id,
        category_name: brand.category_name,
        status: enums.ITEM_VERIFY,
        update_time: date,
        priority: brand.priority,
        name_en: brand.name_en,
        name_tw: brand.name_tw,
        contributor: brand.contributor
    });
    newBrand.save(function(error, createdBrand) {
        if(error) {
            logger.error('failed to create brand : ' + error);
            callback(errorCode.FAILED, null);
        } else {
            callback(errorCode.SUCCESS, createdBrand);
        }
    });
};

Brand.findBrandByConditions = function(conditions, callback) {
    Brand.find(conditions)
        .run(function (error, brands) {
            if (error) {
                logger.error("find brand error : " + error);
                callback(errorCode.FAILED, null);
            } else {
                callback(errorCode.SUCCESS, brands);
            }
        });
};

Brand.listBrands = function(conditions, from, count, sortField, callback) {
    if("id" == sortField && 0 != from) {
        conditions.id = orm.gt(from);
        Brand.find(conditions).limit(parseInt(count)).orderRaw("?? ASC", [sortField])
            .run(function (listBrandsErr, brands) {
                if (listBrandsErr) {
                    logger.error("list brands error : " + listBrandsErr);
                    callback(errorCode.FAILED, null);
                } else {
                    callback(errorCode.SUCCESS, brands);
                }
            });
    } else {
        Brand.find(conditions).limit(parseInt(count)).offset(parseInt(from)).orderRaw("?? ASC", [sortField])
            .run(function (listBrandsErr, brands) {
                if (listBrandsErr) {
                    logger.error("list brands error : " + listBrandsErr);
                    callback(errorCode.FAILED, null);
                } else {
                    callback(errorCode.SUCCESS, brands);
                }
            });
    }
};

Brand.countBrands = function(conditions, callback) {
    Brand.count(conditions, function(countBrandsErr, brandsCount) {
        if (countBrandsErr) {
            logger.error("count brands error : " + countBrandsErr);
            callback(errorCode.FAILED, 0);
        } else {
            callback(errorCode.SUCCESS, brandsCount);
        }
    });
};

Brand.getBrandByID = function(brandID, callback) {
    Brand.get(brandID, function(error, brand) {
        if (error) {
            logger.error("get brand by ID error : " + error);
            callback(errorCode.FAILED, null);
        } else {
            callback(errorCode.SUCCESS, brand);
        }
    });
};

Brand.updateBrandByID = function(brandID, newBrand, callback) {
    Brand.get(brandID, function(error, brand) {
        if (error) {
            logger.error("get brand by ID error in update brand : " + error);
            callback(errorCode.FAILED, null);
        } else {
            brand.name = newBrand.name;
            brand.category_id = newBrand.category_id;
            brand.category_name = newBrand.category_name;
            brand.status = newBrand.status;
            brand.update_time = newBrand.update_time;
            brand.priority = newBrand.priority;
            brand.name_en = newBrand.name_en;
            brand.name_tw = newBrand.name_tw;
            brand.contributor = newBrand.contributor;
            brand.save(function(error, createdBrand) {
                if(error) {
                    logger.error('failed to create brand in update brand : ' + error);
                    callback(errorCode.FAILED, null);
                } else {
                    callback(errorCode.SUCCESS, createdBrand);
                }
            });
        }
    });
};

module.exports = Brand;