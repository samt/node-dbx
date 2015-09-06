/*
 * dbx
 */
var dbx = {};

// public static classes
dbx.Connection = require('./lib/Connection.js');
dbx.Model = require('./lib/Model.js');
dbx.Query = require('./lib/Connection.js');
dbx.Record = require('./lib/Record.js');

module.exports = dbx;
