/* jshint node: true */

var mongoose = require('mongoose');
var app = require('../config/application');

/*
 * service start/stop
 */

// start/started queues
var start = [];
var started = [];

/*
 * tApp is an interface to start the app through the start queue
 *
 * @param {String|Number} port (a server port)
 * @param {Object} app (your application)
 * @constructor
 */

function tApp(port, app) {
  this.port = port || "7331";
  this.app = app;
  this.server = undefined;
}

tApp.prototype.start = function(callback) {
  this.server = this.app.listen(this.port, callback);
};

tApp.prototype.stop = function(callback) {
  this.server.close(callback);
};

/*
 * tDb is an interface to start the databse through the start queue
 *
 * @param {String} url (a database url)
 * @param {ObjecT} db (your database object)
 * @constructor
 */

function tDb(url, db) {
  this.url = url || process.env.TEST_MONGODB_URL;
  this.db = db;
}

tDb.prototype.start = function(callback) {
  this.db.connect(this.url, callback);
};

tDb.prototype.stop = function(callback) {
  this.db.disconnect(callback);
};


/*
 * app adds the express app to the start queue
 *
 * @parma {Number} port (a server port)
 */

exports.app = function(port) {
  var service = new tApp(port, app);
  start.push(service);
};

/*
 * db adds the database to the start queue
 *
 * @param {String} url (a database url)
 */

exports.db = function(url) {
  var service = new tDb(url, mongoose);
  start.push(service);
};

/*
 * start starts the services in the start queue
 *
 * @param {Function} done
 */

exports.start = function(done) {
  starter(done);
};

/*
 * stop stops the services in the started queue
 *
 * @param {Function} done
 */

exports.stop = function(done) {
  stopper(done);
};

/*
 * stopper stops the started services in the started queue
 *
 * @param {Function} done
 */

function stopper(done) {
  var service = started.shift();
  if (!service) {
    return done();
  }

  service.stop(function() {
    stopper(done);
  });
}

/*
 * starter iterates through the start queue and starts each service
 * sequentially, then adds them to the started queue for later shutdown
 *
 * @param {Function} done
 */

function starter(done) {
  var service = start.shift();
  if (!service) {
    return done();
  }

  service.start(function() {
    started.push(service);
    starter(done);
  });
}


/*
 * database cleaner
 */

// clean queue
var clean = [];

/*
 * dbcleaner queues up models to run `remove` then begins the cleaner
 *
 * @param {Function} callback
 */

exports.dbcleaner = function(done) {
  var models = Object.keys(mongoose.models);
  clean = models.map(function(m) {
    return function(callback) {
      mongoose.models[m].remove({}, callback);
    };
  });

  cleaner(done);
};

/*
 * cleaner iterates through the clean queue clearing each model
 *
 * @param {Function} done
 */

function cleaner(done) {
  var remove = clean.shift();
  if (!remove) {
    return done();
  }

  remove(function() {
    cleaner(done);
  });
}
