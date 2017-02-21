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
var errorCode = new ErrorCode();

var Category = dbOrm.define('category',
    {
        id: Number,
        name: String,
        status: Number,
        update_time: String,
        name_en: String,
        name_tw: String,
        contributor: String
    },
    {
        cache: false
    }
);

Category.createCategory = function(category, callback) {
    var date = dateUtils.formatDate(new Date(), "yyyy-MM-dd hh:mm:ss");
    var newCategory = new Category({
        name: category.name,
        status: 1,
        update_time: date,
        name_en: category.name_en,
        name_tw: category.name_tw,
        contributor: category.contributor
    });
    newCategory.save(function (error, createdCategory) {
        if (error) {
            logger.error('failed to create category : ' + error);
            callback(errorCode.FAILED, null);
        } else {
            callback(errorCode.SUCCESS, createdCategory);
        }
    });
};

Category.findCategoryByConditions = function(conditions, callback) {
    Category.find(conditions)
        .run(function (error, categories) {
            if (error) {
                logger.error("find category error : " + error);
                callback(errorCode.FAILED, null);
            } else {
                callback(errorCode.SUCCESS, categories);
            }
        });
};

Category.listCategories = function(conditions, from, count, sortField, callback) {
    if("id" == sortField && 0 != from) {
        conditions.id = orm.gt(from);
        Category.find(conditions).limit(parseInt(count)).orderRaw("?? ASC", [sortField])
            .run(function (listCategoriesErr, categories) {
                if (listCategoriesErr) {
                    logger.error("list categories error : " + listCategoriesErr);
                    callback(errorCode.FAILED, null);
                } else {
                    callback(errorCode.SUCCESS, categories);
                }
            });
    } else {
        Category.find(conditions).limit(parseInt(count)).offset(parseInt(from)).orderRaw("?? ASC", [sortField])
            .run(function (listCategoriesErr, categories) {
                if (listCategoriesErr) {
                    logger.error("list categories error : " + listCategoriesErr);
                    callback(errorCode.FAILED, null);
                } else {
                    callback(errorCode.SUCCESS, categories);
                }
            });
    }
};

Category.countCategories = function(conditions, callback) {
    Category.count(conditions, function(countCategoriesErr, categoriesCount) {
        if (countCategoriesErr) {
            logger.error("count categories error : " + countCategoriesErr);
            callback(errorCode.FAILED, 0);
        } else {
            callback(errorCode.SUCCESS, categoriesCount);
        }
    });
};

Category.getCategoryByID = function(categoryID, callback) {
    Category.get(categoryID, function(error, category) {
        if (error) {
            logger.error("get category by ID error : " + error);
            callback(errorCode.FAILED, null);
        } else {
            callback(errorCode.SUCCESS, category);
        }
    });
};

/* For internal use only */
Category.listRemoteCategories = function(conditions, from, count, sortField, callback) {
    if("id" == sortField && 0 != from) {
        conditions.id = orm.gt(from);
        Category.find(conditions).limit(parseInt(count)).orderRaw("?? ASC", [sortField])
            .run(function (listCategoriesErr, categories) {
                if (listCategoriesErr) {
                    logger.error("list categories error : " + listCategoriesErr);
                    callback(errorCode.FAILED, null);
                } else {
                    callback(errorCode.SUCCESS, categories);
                }
            });
    } else {
        Category.find(conditions).limit(parseInt(count)).offset(parseInt(from)).orderRaw("?? ASC", [sortField])
            .run(function (listCategoriesErr, categories) {
                if (listCategoriesErr) {
                    logger.error("list categories error : " + listCategoriesErr);
                    callback(errorCode.FAILED, null);
                } else {
                    callback(errorCode.SUCCESS, categories);
                }
            });
    }

};

module.exports = Category;