# dbx

Event-driven, agnostic, sane ORM for the rest of us.

**Please Note: This is still a WIP and does not contain working code as of yet**

## What is dbx?

This is really just a dispatcher that sends everything around, making your database more event-driven. It abstracts away the database making a SQL system resemble more of a document-based store. It has some small opinions about the final schema, but they can be overridden. This system also enables the use of caching engines to squeeze better performance out of your fetch operations.

## Concepts

### DB agnostic

While this is modeled around the constraints of a [RDBMS](https://en.wikipedia.org/wiki/Relational_database_management_system), it is entirely possible to use it for any sort of data store, you just have to write the driver for it. Types are abstracted to be very granular and can easily be implemented with polyfills.

### Hookable

No need for janky workarounds, you have access to the data at every step pre and post processing to do additional validation, model validation, or whatever you wish. It will be easier to pick up if you all you know is running SQL against a database.

### Only as much magic as you want

In the [Defining Models](#Defining-Models) section, we go through the items that are created automatically for you, but can be easily enabled or disabled at the local, Model Level, or at the global Application Level. Field names are not changed for you on the DB's side, making custom queries easy to work with.

### Support for caching engines

Hitting the DB is expensive, you can enable caching engines and tweak any setting.

### Strict conventions

* Dates are stored as unix timestamps
* The first `err` parameter will either be an instance of `dbx.Error` or Boolean `false` if no error happened. No null, no undefined, just a normal false (See [The Worst Mistake of Computer Science](https://www.lucidchart.com/techblog/2015/08/31/the-worst-mistake-of-computer-science/)).

# <a name="Install"></a> Install

	npm install dbx --save

# <a name="Usage"></a> Usage

## Connections

### Basic
```js
// contains all the classes
var dbx = require('dbx');

// create a new connection
var db = new dbx.Connection({
	driver: require('dbx-mysql'),
	dbuser: 'root',
	dbpass: 'passw0rd',
	dbname: 'mydb'
});

// define caching options (Todo)
db.cache();

// connect!
db.connect(function (err) {
	console.log('connected!');
});
```

### Getting a previously established connection

You might also want to use this connection in another file where db might not necessarily be in scope. You can use the singleton getter to accomplish just that:

```js
var dbx = require('dbx');
var db = dbx.Connection.get();
```

### Multiple connections

Connecting to multiple servers? not to worry, you can name your connection:

```js
var anotherDb = new dbx.Connection('myservice', {
	driver: require('dbx-mysql'),
	host: '10.23.44.44',
	port: 64324
	dbuser: 'root',
	dbpass: 'passw0rd',
	dbname: 'myservicedb'
});

anotherDb.connect(function (err) {
	console.log('connected!')
});
```

Getting the connection back in other files is just as easy:

```js
var dbx = requre('dbx');
var db = dbx.Connection.get(); // get the main connection
var anotherDb = dbx.Connection.get('myservice'); // get a named connection!
```

## <a name="Defining-Models"></a> Defining Models

Models are nothing more than a representation of a table that they owe their namesake to. We abstract types here to very high-level ones, but you may also use the lower level ones if it suites your needs better.

```js
// 'db' is a connected database object
var User = db.define('User', {
	name: { type: 'string' },
	email: { type: 'string', key: 'unique' },
	password: { type: 'string' },
	type: { type: 'flag', key: 'index', values: { '0': 'Normal', '1': 'Admin' } },
	dateLastLogin: { type: 'timestamp' },
	social: { type: 'json' },
	bio: { type: 'text' }
});

var Post = db.define('Post', {
	authorId: { type: 'fk', model: 'User', field: 'id' },
	isVisible: { type 'boolean' },
	title: { type: 'string' },
	body: { type: 'text' }
});

// Using shorthand types
var Comment = db.define('Comment', {
	postId: 'fk.Post.id',
	authorId: 'fk.User.id',
	body: 'text',
});
```

A few things are going on here:

* Passing in the first parameter (string "User", in the user-model's case) gives you both a way to fetch the model later, but it also identifies the table name in the database.
* The second parameter is a key/value object that contains field information, with the field's name being key. It is advisable to keep the field names valid JS identifiers for simplicity, however they can be any quoted string.
* An auto-incrementing "id" filed was omitted, it is given to you by default.
* Most date fields are absent. `dateCreated` and `dateUpdated` are given to you by default.
* Shorthand notation is used in the Comment model, where you simply define the type instead of a field object.

### <a name="Field-Types"></a> Field types

* `type`: **(Required)** Field type, use one of the following:
    * `id`: Auto-incrementing ID, unsigned. Indexed (as Primary Key) automatically.
    * `fk`, `fk.TABLE.FIELD`: foreign key, same as ID except not auto-incrementing. Indexed automatically.
    * `int`: Signed, 8bit int, -2147483648 to 2147483647
    * `uint`: Unsigned, 8bit int, 0 to 4294967295
    * `flag`: Integer ranging from -128 to 127, typically a signed 8bit int. Indexed automatically.
    * `timestamp`: For unix timestamps, typically `uint`. Can only represent dates from Jan 1st 1970 00:00:00 to Feb 7th 2106 06:28:15 UTC.
    * `string`: Single-line string, no bigger than 255 bytes (UTF-8 warning! 1 byte is not always 1 char)
    * `char`, `char.X`: Byte of maximum `X` length. Do not use for any UGC as per the UTF-8 warning.
    * `text`: Block of text no bigger than 65,535 bytes (See UTF-8 warning above)
    * `json`: Same basic type as `text`, but converted to and from JSON automatically by the model
* `size`: **(Optional)** Only honored on fields that accept field size: (`char`, `string`)
* `def`: **(Optional)** Default value for the field.
    * Default: `''` or `0` depending on field type
* `notnull`: **(Optional)** Does this field require some data in it?
    * Default: true
* `key`: **(Optional)** Can be `primary`, `unique`, `index`, `text`. Note that `primary` cannot be used if you're using the `id` field, built-into models by default.
    * Default: Depends on `type`
* `values`: **(Optional)** Useful for the `flag` type only. Key/value Object (with quoted numbers as keys) containing possible values.
* `model`: **(Optional)** Useful for the `fk` type only. May use the foreign key shorthand instead.
* `field`: **(Optional)** Useful for the `fk` type only. May use the foreign key shorthand instead.

## Inserting records

```js
var User = db.model('User');

User.create({
	'name': 'John Doe',
	'email': 'john@doe.com',
	'password': 'hunter2'
}, function (err, record) {
	if (err) throw err;

	console.log('User exists:', record.exists);
	console.log(record.name + ' <' + record.email + '>');
});
```

## Get a record by ID

```js
var User = db.model('User');

User.get(5, function (err, user) {
	console.log('Hello, ' + user.name);
});
```

## Save a record

```js
var User = db.model('User');

User.get(5, function (err, user) {
	user.email = 'john.doe@gmail.com';

	user.save(function (err) {
		if (err) throw err;
		console.log('New email saved!');
	});
});
```

## Delete a record

```js
var User = db.model('User');

User.get(5, function (err, user) {
	user.delete(function (err) {
		if (err) throw err;
		console.log('User exists? ', user.exists);
	});
});
```

## Using events

In the previous `User.create` example, you can see the password is sent to the database with what looks like pain text. We can use an event hook for the User model to transform the password into a hashed version of whatever the password is.

```js
var bcrypt = require('bcryptjs');
User.on('preSave', function (record, callback) {
	// preSave is NOT a validation hook, it may be possible that we do have/want
	// a password to update an incoming record with.
	if (!record.password.length) {
		return callback();
	}

	bcrypt.hash(record.password, function (err, hashed) {
		if (err) return callback(err);

		record.password = hashed;
		return callback();
	});
});
```

# API

**The API is still a WIP and should be considered VOLATILE. It is not to be relied upon until the first major release.**

## <a name="dbx.Connection"></a> Class: dbx.Connection

Constructor to create a new connection, defines the database driver and other driver-specific options.  See [Database Drivers](#) for more information.

	dbx.Connection([identifier], options)

* `identifier` - 'String' (optional): Omit to have returned the default connection
* `options` - 'Object': With the following options:
	* `driver` - Driver implementing `dbx`, use `require('dbx-mysql')` for mysql
	* `host` - Hostname to connect to
	* `port` - Port to connect to
	* `dbname` - Name of DB
	* `dbuser` - Username to connect to DB with
	* `dbpass` - password to authenticate the user with

This is an [`EventEmitter`](https://nodejs.org/api/events.html#events_class_events_eventemitter) with the following events:

### Event: 'connection'

Emitted upon successful connection

	function (err, connection) { }

* `err` instance of [`dbx.Error`](#dbx.Error), `false` otherwise

### Event: 'disconnect'

Emitted upon disconnect.

	function (err, reason) { }

* `err` instance of [`dbx.Error`](#dbx.Error), `false` otherwise
* `reason` int (enum)

### Event: 'error'

Emitted each time an error occurs.

	function (err) { }

* `err` instance of [`dbx.Error`](#dbx.Error)

### Event: 'query'

Emitted when a query is ran

	function (err, query)

* `err` instance of [`dbx.Error`](#dbx.Error), `false` otherwise
* `query` instance of [`dbx.Query`](#dbx.Query)

### Connection.get([identifier])

(Static access) get the connection

* `identifier` string

Returns instance of [dbx.Connection](#dbx.Connection).

### connection.isConnected

Boolean - returns the state of the connection

### connection.hasError

Boolean - returns whether or not a connection-level error has occurred.

### connection.lastError

String - Information about the last connection-level error

### connection.cache(options)

Define a caching engine. See [Caching Engines](#).

### connection.connect([callback])

Connect to the DB server

* `callback` function

### connection.define(name, options)

Define a new model. See [Defining Models](#Defining-Models).

* `name` String - Name of the model
* `options` Object - Object containing the model definition

Returns an instance of [dbx.Model](#dbx.Model).

### connection.model(name)

Get the model by its name.

* `name` String - Name of the model defined previously

Returns an instance of [dbx.Model](#dbx.Model).

### connection.query(name, [fromCache, ] callback)

Directly run an SQL query.

* `sql` string
* `fromCache` boolean (optional) attempt to load from cache
* `callback` callback function accepting the following parameters
	* `err` instance of [`dbx.Error`](#dbx.Error) if error, `false` otherwise
	* `records`	Array, instances of [`dbx.Record`](#dbx.Record)

## <a name="dbx.Model"></a> Class: dbx.Model

The base class for all data models. Note that this is *only* the API documentation, for a more practical introduction to models, see [Defining Models](#Defining-Models). Note that it cannot be used directly, rather only through defining a model, which will have an instance returned to you. The consequence of this is that all events listed here are local to individual models.

This is an [`EventEmitter`](https://nodejs.org/api/events.html#events_class_events_eventemitter) with the following events:

### Event: 'postCreate'

Emitted after a successful write is issued for a new record.

	function (record, [callback]) { }

* `record` instance of [`dbx.Record`](#dbx.Record)
* `callback` callback function accepting no parameters

### Event: 'postDelete'

Emitted after a successful delete has been issued.

See Event 'postCreate' for callback details

### Event: 'postFetch'

Emitted after a fetch operation is issued to the DB.

	function (query, [callback]) { }

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

	function (record, [callback]) { }

* `record` instance of [`dbx.Record`](#dbx.Record)
* `callback` callback function accepting the following parameters:
	* `err` instance of [`dbx.Error`](#dbx.Error) if error, false otherwise. Errors will abort the write and it will bubble up

### Event: 'preDelete'

Emitted before a delete is issued to an existing record.

	function (record, [callback]) { }

* `record` instance of [`dbx.Record`](#dbx.Record)
* `callback` callback function accepting the following parameters:
	* `err` instance of [`dbx.Error`](#dbx.Error) if error, false otherwise. Errors will abort the delete and it will bubble up

### Event: 'preFetch'

Emitted before a fetch operation is issued to the DB

	function (query, [callback]) { }

* `query` instance of [`dbx.Query`](#dbx.Query)
* `callback` callback function accepting the following parameters:
	* `err` instance of [`dbx.Error`](#dbx.Error) if error, false otherwise. Errors will abort the delete and it will bubble up

### Event: 'preSave'

Emitted before a write is issued for either a new or an existing record.

See Event 'preCreate' for callback details

### Event: 'preUpdate'

Emitted before a write is issued for an existing record.

See Event 'preCreate' for callback details

### Event: 'validate'

Emitted before any db operations have taken place, this is where you can validate information and error out if needed.

	function (record, [callback]) { }

* `record` instance of [`dbx.Record`](#dbx.Record)
* `callback` callback function accepting the following parameters
	* `err` instance of [`dbx.Error`](#dbx.Error) if error, false otherwise. Errors will abort the write and it will bubble up

### model.name

String - name the model is identified by

### model.fields

Object - Key/value pairs containing the fields that this model can have.

### model.count(query, callback)

Count the number of records in a query.

* `query` instance of [`dbx.Query`](#dbx.Query)
* `callback` callback function accepting the following parameters
	* `err` instance of [`dbx.Error`](#dbx.Error) if error, false otherwise
	* `count` Number

### model.create(obj, callback)

Create a new record, does not issue a create in the DB yet.

* `obj` key/value hash of fields OR instance of [`dbx.Record`](#dbx.Record) (to clone an object)
* `callback` callback function accepting the following parameters
	* `err` instance of [`dbx.Error`](#dbx.Error) if error, false otherwise
	* `record` instance of [`dbx.Record`](#dbx.Record)

### model.get(id, [fromCache], callback)

Fetch one by the primary key.

* `id` primary key identifier as defined in the model
* `fromCache` boolean (optional) attempt to load from cache
* `callback` callback function accepting the following parameters
	* `err` instance of [`dbx.Error`](#dbx.Error) if error, false otherwise
	* `record` instance of [`dbx.Record`](#dbx.Record)

### model.getAll(ids, [fromCache], callback)

Fetch many by an array of primary keys.

* `ids` Array of primary key identifier as defined in the model
* `fromCache` boolean (optional) attempt to load from cache
* `callback` callback function accepting the following parameters
	* `err` instance of [`dbx.Error`](#dbx.Error) if error, false otherwise
	* `records`	Array, instances of [`dbx.Record`](#dbx.Record)

### model.search(query, [fromCache], callback)

Perform a search on a model.

* `query` instance of [`dbx.Query`](#dbx.Query)
* `fromCache` boolean (optional) attempt to load from cache
* `callback` callback function accepting the following parameters
	* `err` instance of [`dbx.Error`](#dbx.Error) if error, false otherwise
	* `records`	Array, instances of [`dbx.Record`](#dbx.Record)

### model.query(sql, [fromCache], callback)

Alias of `connection.query()`

## <a name="dbx.Record"></a> Class: dbx.Record

### record.delete([callback])

Delete the instance record.

* `callback` callback function accepting the following parameters
	* `err` instance of [`dbx.Error`](#dbx.Error) if error, false otherwise

### record.save([callback])

Saves the current state of the model (updates or creates).

* `callback` callback function accepting the following parameters
	* `err` instance of [`dbx.Error`](#dbx.Error) if error, false otherwise

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

Number - Time in seconds

### query.hasRun

Boolean - Has the query been executed yet

### query.inCache

Boolean - Were the results in cache?

### query.numResults

Number - Number of results

### query.results

Array - Raw results

### query.sql

String - raw SQL query

## <a name="dbx.Error"></a> Class: dbx.Error

### Error.LEVELS

(Static access) Array of valid error levels.

### Error.TYPES

(Static access) Array of valid error types

### error.level

Number - see Error.LEVELS for possible values

### error.type

Number - See Error.TYPES for possible values

### error.message

String - Message that is safe to surface to the end user

### error.internalMessage

String - Message with information about the error itself that is only meant to be viewed by an elevated user.
