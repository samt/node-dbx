/*
 * dbx
 * Model class
 */
var util = require('util');
var events = require('events');
var _ = require('underscore');

function Model(name, opts) {
    this.name = '';
    this.fields = {
        id: 'autoint',
        dateCreated: 'date',
        dateUpdated: 'date'
    };

    if (_.isString(name)) this.name = name;

}

util.inherits(Model, events.EventEmitter);

/**
 * @param String OR dbx.Query
 * @param boolean
 * @param callback
 */
Model.prototype.count = function (query, fromCache, callback) {
};

/**
 * @param Object OR dbx.Record
 * @param callback
 */
Model.prototype.create = function (record, callback) {
};

/**
 * @param String|Number
 * @param boolean
 * @param callback
 */
Model.prototype.get = function (id, fromCache, callback) {
};

/**
 * @param Array<String|Number>
 * @param boolean
 * @param callback
 */
Model.prototype.getAll = function (ids, fromCache, callback) {
};

/**
 * @param dbx.Query
 * @param boolean
 * @param callback
 */
Model.prototype.search = function (query, fromCache, callback) {
};

/**
 * @param string
 * @param boolean
 * @param callback
 */
Model.prototype.query = function (sql, fromCache, callback) {
};

module.exports = Model;
