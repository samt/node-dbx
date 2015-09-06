/*
 * dbx
 * Connection class
 */
var util = require('util');
var events = require('events');

function Connection() {
}

util.inherits(Connection, events.EventEmitter);

/**
 * @param Object
 * @return void
 */
Connection.prototype.cache = function (opts) {
};

/**
 * @return void
 */
Connection.prototype.syncModels = function () {
};

/**
 * @param string
 * @param Object
 * @param dbx.Model
 */
Connection.prototype.define = function (name, opts) {
};

/**
 * @param string
 * @return dbx.Model
 */
Connection.prototype.model = function (name) {
};

/**
 * @param string
 * @param boolean (optional)
 * @param function
 */
Connection.prototype.query = function (sql, fromCache, callback) {
};
