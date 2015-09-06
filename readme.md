# dbx

Event-driven, DB-agnostic, sane ORM.

## What is dbx?

This is really just a dispatcher that sends everything around, making your database more event-driven. It abstracts away the database making a SQL system resemble more of a document-based store. It has some small opinions about the final schema, but they can be overridden. This system also enables the use of caching engines to squeeze better performance out of your fetch operations.

**This is still a WIP and does not contain working code as of yet**

# Install

	npm install dbx --save

# Usage

```js
var dbx = require('dbx');

// @todo
```

# API

## <a name="dbx.Connection"></a> Class: dbx.Connection

Constructor to create a new connection, defines the database driver and other driver-specific options.  See [Database Drivers](#) for more information.

	dbx.Connection([identifier, ]options)

* `identifier` - 'String' (optional): Omit to have returned the default connection
* `options` - 'Object': With the following options:
	* `driver` - Driver implementing `dbx`, use `require('dbx-mysql')` for mysql
	* `host` - Hostname to connect to
	* `port` - Port to connect to
	* `[...]` - Anything else driver-specific (see docs for individual drivers)

This is an [`EventEmitter`](https://nodejs.org/api/events.html#events_class_events_eventemitter) with the following events:

### Event: 'connection'

Emitted upon successful connection

	function (err, connection) { }

* `err` non-false when an error occurs, instance of [`dbx.Error`](#dbx.Error) otherwise.

### Event: 'disconnect'

Emitted upon disconnect.

	function (err, reason) { }

* `err` instance of [`dbx.Error`](#dbx.Error).
* `reason` int (enum)

### Event: 'error'

Emitted each time an error occurs.

	function (err) { }

* `err` instance of [`dbx.Error`](#dbx.Error).

### Event: 'query'

Emitted when a query is ran

	function (err, query)

* `err` instance of [`dbx.Error`](#dbx.Error).
* `query` instance of [`dbx.Query`](#dbx.Query).

### connection.cache(options)

Define a caching engine. See [Caching Engines](#).

### connection.syncModels()

Synchronize defined models with upstream schema

### connection.define(name, options)

Define a new model. See [Defining Models](#).

* `name` String - Name of the model
* `options` Object - Object containing the model definition

Returns an instance of [dbx.Model](#dbx.Model).

### connection.model(name)

Get the model by its name.

* `name` String - Name of the model defined previously

Returns an instance of [dbx.Model](#dbx.Model).

### connection.query(name, [fromCache = true, ]callback)

Directly run an SQL query.

* `sql` string
* `fromCache` boolean (optional) attempt to load from cache
* `callback` callback function accepting the following parameters
	* `err` instance of [`dbx.Error`](#dbx.Error) if error, falsey otherwise
	* `records`	Array, instances of [`dbx.Record`](#dbx.Record)

## <a name="dbx.Model"></a> Class: dbx.Model

The base class for all data models. Note that this is *only* the API documentation, for a more practical introduction to models, see [Defining Models](#). Note that it cannot be used directly, rather only through defining a model, which will have an instance returned to you. The consequence of this is that all events listed here are local to individual models.

This is an [`EventEmitter`](https://nodejs.org/api/events.html#events_class_events_eventemitter) with the following events:

### Event: 'postCreate'

Emitted after a successful write is issued for a new record.

	function (record[, callback]) { }

* `record` instance of [`dbx.Record`](#dbx.Record)
* `callback` callback function accepting no parameters

### Event: 'postDelete'

Emitted after a successful delete has been issued.

See Event 'postCreate' for callback details

### Event: 'postFetch'

Emitted after a fetch operation is issued to the DB.

	function (query[, callback]) { }

* `query` instance of [`dbx.Query`](#dbx.Query)
* `records` Array of [`dbx.Record`](#dbx.Record)
* `callback` callback function accepting no parameters

### Event: 'postSave'

Emitted after a successful write is issued for either a new or an existing record.

See Event 'postCreate' for callback details

### Event: 'postUpdate'

Emitted after a successful write is issued for an existing record.

See Event 'postCreate' for callback details

### Event: 'preCreate'

Emitted before a write is issued for a new record. Use this hook for formatting data or injecting data into the query before it's run. use the 'validate' event for data validation.

	function (record[, callback]) { }

* `record` instance of [`dbx.Record`](#dbx.Record)
* `callback` callback function accepting the following parameters:
	* `err` instance of [`dbx.Error`](#dbx.Error) if error, falsey otherwise. Errors will abort the write and it will bubble up
	* `record` instance of [`dbx.Record`](#dbx.Record) (if you wish for any changes to be made) or falsey if nothing is to be changed

### Event: 'preDelete'

Emitted before a delete is issued to an existing record.

	function (record[, callback]) { }

* `record` instance of [`dbx.Record`](#dbx.Record)
* `callback` callback function accepting the following parameters:
	* `err` instance of [`dbx.Error`](#dbx.Error) if error, falsey otherwise. Errors will abort the delete and it will bubble up

### Event: 'preFetch'

Emitted before a fetch operation is issued to the DB

	function (query[, callback]) { }

* `query` instance of [`dbx.Query`](#dbx.Query)
* `callback` callback function accepting the following parameters:
	* `err` instance of [`dbx.Error`](#dbx.Error) if error, falsey otherwise. Errors will abort the delete and it will bubble up

### Event: 'preSave'

Emitted before a write is issued for either a new or an existing record.

See Event 'preCreate' for callback details

### Event: 'preUpdate'

Emitted before a write is issued for an existing record.

See Event 'preCreate' for callback details

### Event: 'validate'

Emitted before any db operations have taken place, this is where you can validate information and error out if needed.

	function (record[, callback]) { }

* `record` instance of [`dbx.Record`](#dbx.Record)
* `callback` callback function accepting the following parameters
	* `err` instance of [`dbx.Error`](#dbx.Error) if error, falsey otherwise. Errors will abort the write and it will bubble up

### model.count(query, callback)

Count the number of records in a query.

* `query` instance of [`dbx.Query`](#dbx.Query)
* `callback` callback function accepting the following parameters
	* `err` instance of [`dbx.Error`](#dbx.Error) if error, falsey otherwise
	* `count` Number

### model.create(obj, callback)

Create a new record, does not issue a create in the DB yet.

* `obj` key/value hash of fields OR instance of [`dbx.Record`](#dbx.Record) (to clone an object)
* `callback` callback function accepting the following parameters
	* `err` instance of [`dbx.Error`](#dbx.Error) if error, falsey otherwise
	* `record` instance of [`dbx.Record`](#dbx.Record)

### model.get(id, [fromCache = true, ]callback)

Fetch one by the primary key.

* `id` primary key identifier as defined in the model
* `fromCache` boolean (optional) attempt to load from cache
* `callback` callback function accepting the following parameters
	* `err` instance of [`dbx.Error`](#dbx.Error) if error, falsey otherwise
	* `record` instance of [`dbx.Record`](#dbx.Record)

### model.getAll(ids, [fromCache = true, ]callback)

Fetch many by an array of primary keys.

* `ids` Array of primary key identifier as defined in the model
* `fromCache` boolean (optional) attempt to load from cache
* `callback` callback function accepting the following parameters
	* `err` instance of [`dbx.Error`](#dbx.Error) if error, falsey otherwise
	* `records`	Array, instances of [`dbx.Record`](#dbx.Record)

### model.search(query, [fromCache = true, ]callback)

Perform a search on a model.

* `query` instance of [`dbx.Query`](#dbx.Query)
* `fromCache` boolean (optional) attempt to load from cache
* `callback` callback function accepting the following parameters
	* `err` instance of [`dbx.Error`](#dbx.Error) if error, falsey otherwise
	* `records`	Array, instances of [`dbx.Record`](#dbx.Record)

### model.query(sql, [fromCache = true, ]callback)

Alias of `connection.query()`

## <a name="dbx.Record"></a> Class: dbx.Record

### record.delete([callback])

Delete the instance record.

* `callback` callback function accepting the following parameters
	* `err` instance of [`dbx.Error`](#dbx.Error) if error, falsey otherwise

### record.save([callback])

Saves the current state of the model (updates or creates).

* `callback` callback function accepting the following parameters
	* `err` instance of [`dbx.Error`](#dbx.Error) if error, falsey otherwise

### record.dateCreated

Number - Unix timestamp from when the record was originally created

### record.dateModified

Number - Unix timestamp from when the record was last updated

### record.exists

Boolean - Whether the record exists in the DB or not

### record.id

Number|String - Primary key of the record, falsey if this is not used as the main ID.

### record.inCache

Boolean - Whether the record exists in the cache or not. Always false if no caching engine is defined.

## <a name="dbx.Query"></a> Class: dbx.Query

### query.executionTime

Number - Time (MS)

### query.hasRun

Boolean - Has the query been executed yet

### query.inCache

Boolean - Were the results in cache?

### query.sql

String - raw SQL query

## <a name="dbx.Error"></a> Class: dbx.Error
