/*
 * dbx
 * Connection class
 */
var util = require('util');
var events = require('events');
var Model = require('./Model.js');
var _ = require('underscore');

var connections = {};

function Connection(id, options) {
    // 'private' vars
    this._driver = {};
    this._models = {};
    this._engines = {
        cache: {}
    }

    this.id = '';
    this.options = {
        driver: {},
        host: 'localhost',
        port: 0,
        dbname: '',
        dbuser: 'root',
        dbpass: '',
    };

    this.isConnected = false;
    this.hasError = false;
    this.lastError = '';

    if (_.isString(id)) this.id = id;
    if (_.isObject(id)) options = id;

    this.options = _.defaults(options, this.options);

    if (_.isFunction(this.options.driver)) {
        this._driver = this.options.driver(this);
    }

    connections[id] = this;
}

util.inherits(Connection, events.EventEmitter);

Connection.get = function (name) {
    if (!name) name = '';
    return connections[name] || {};
}

/**
 * @param Object
 * @return void
 */
Connection.prototype.cache = function (opts) {
};

/**
 * @param Object
 * @return void
 */
Connection.prototype.connect = function (callback) {
    var err = false;

    this.emit('connection', err, this);
    if (err) this.emit('error', err, this);

    callback(err, this);
};

/**
 * @param string
 * @param Object
 */
Connection.prototype.define = function (name, opts) {
    this._models[name] = new Model(name, opts);
    return this._models[name];
};

/**
 * @param string
 * @return dbx.Model
 */
Connection.prototype.model = function (name) {
    return this._models[name] || new Model();
};

/**
 * @param string
 * @param boolean (optional)
 * @param function
 */
Connection.prototype.query = function (sql, fromCache, callback) {
    var err = false;
    var query = {};

    this.emit('query', err, query);
};

module.exports = Connection;
