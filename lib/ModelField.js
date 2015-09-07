/*
 * dbx
 * ModelField class
 */
var util = require('util');

var defaults = {
	'id': { size: 10, def: null, notnull: true, key: 'primary' },
	'fk': { size: 10 def: null, notnull: true, key: 'index', model: '', field: '' },
	'int': { size: 10, def: 0, notnull: true, key: '' },
	'uint': { size: 10, def: 0, notnull: true, key: '' },
	'flag': { size: 3, def: 0, notnull: true, key: 'index', values: {} },
	'timestamp': { size: 10, def: 0, notnull: true, key: '' },
	'string': { size: 255, def: '', notnull: true, key: '' },
	'char': { size: 1, def: ' ', notnull: true, key: '' },
	'text': { size: 65535, def: '', notnull: true, key: '' },
	'json': { size: 65535, def: '[]', notnull: true, key: '' }
};

function ModelField(opts) {
	this.name = '';
	this.type = '';
	this.size = 0;
	this.def = '';
	this.notnull = true;
	this.key = '';
}

module.exports = ModelField;
