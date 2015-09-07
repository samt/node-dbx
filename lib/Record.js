/*
 * dbx
 * Record class
 */
var util = require('util');
var events = require('events');

function Record() {
	this.id = 0;
	this.dateCreated = 0;
	this.dateModified = 0;

	this.exists = false;
	this.inCache = false;
}

util.inherits(Record, events.EventEmitter);

/**
 * @param callback
 */
Record.prototype.delete = function (callback) {
};

/**
 * @param callback
 */
Record.prototype.save = function (callback) {
};

module.exports = Record;