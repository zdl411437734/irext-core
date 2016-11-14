/*
 * Created by Strawmanbobi
 * 2014-09-22
 */

require('../../configuration/constants');
var mongoose = require('mongoose');
var logger = require('../../logging/logger4js').helper;

exports.setMongoDBParameter = function(dbHost, dbName, dbUser, dbPassword) {
    var dbURI = "mongodb://";
    if(dbUser) {
        dbURI += dbUser;
    }
    if(dbPassword) {
        dbURI += ":" + dbPassword;
    }
    if(dbUser || dbPassword) {
        dbURI += "@";
    }
    dbURI += dbHost + "/" + dbName;
    mongoose.connect(dbURI);
    exports.mongoDB = mongoose.Schema;
};

exports.define = function(schemaName, schemaObj) {
    return mongoose.model(schemaName, schemaObj);
};

exports.defineByCollection = function(schemaName, schemaObj, collectionName) {
    return mongoose.model(schemaName, schemaObj, collectionName);
};