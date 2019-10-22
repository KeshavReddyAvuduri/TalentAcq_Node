var postgresLogic = {};
var pg = require('pg');

//Connect URL path config.json file
var config = require("../db/config.json");
var Q = require("q");

//To connect to DB || make DB connection

postgresLogic.connect = function(cb) {
    pg.connect(config["engazewell"], function(err, client, done) {
        cb(err, client, done);
    });
};

//Fetch query action
postgresLogic.fetchSelectQueryRecords = function(client, queryString, params, cb, done) {
    var rows = [],
        fetchRecords;

    params = params || [];

    fetchRecords = client.query(queryString, params);

    fetchRecords.on("row", function(row) {
        rows.push(row);
    });

    fetchRecords.on("end", function() {
        if (done) {
            done();
        }

        cb(null, rows);
    });

    fetchRecords.on("error", function(error) {
         if (done) {
            done();
         }
        cb(error);
    });
};

postgresLogic.fetchNonSelectQueryRecords = function(client, queryString, params, cb, done) {
    var rows = [],
        params = params || [],
        fetchRecords;

    fetchRecords = client.query(queryString + " RETURNING *", params, function(err, result) {
        if (err) {
            cb(err);
        } else {
            if (result) {
                var resultRows = result.rows;

                for (var i = 0; i < resultRows.length; i++) {
                    rows.push(result.rows[i]);
                }
            } else {
                rows.push([]);
            }
        }
    });

    fetchRecords.on("end", function() {
        if (done) {
            done();
        }
        cb(null, rows);
    });

    fetchRecords.on("error", function(error) {
        if (done) {
            done();
        }
        cb(error);
    });
};

postgresLogic.fetchNonSelectMultipleQueryRecords = function(client, queryString, params, cb, done) {
    var rows = [],
        params = params || [],
        fetchRecords;

    fetchRecords = client.query(queryString , params, function(err, result) {
        if (err) {
            cb(err);
        } else {
            if (result) {
                var resultRows = result.rows;

                for (var i = 0; i < resultRows.length; i++) {
                    rows.push(result.rows[i]);
                }
            } else {
                rows.push([]);
            }
        }
    });

    fetchRecords.on("end", function() {
        if (done) {
            done();
        }
        cb(null, rows);
    });

    fetchRecords.on("error", function(error) {
        cb(error);
    });
};

/**
 * #### Query execution ####
 * (1#) -> connectionId | config url connection
 * (2#) -> queryString | query passed
 * (3#) -> params | if params exist(optional)
 * (4#) -> client | if DB connection exist(optional)
 * (5#) -> cb | callback
 */

postgresLogic.selectQuery = function(queryString, params, client, cb) {
    if (typeof client === 'function') {
        cb = client;
        client = undefined;
    }

    if (!client) {
        postgresLogic.connect(function(err, client, done) {
            if (err) {
                done();
                return cb(err, []);
            } else {
                postgresLogic.fetchSelectQueryRecords(client, queryString, params, cb, done);
            }
        });
    } else {
        postgresLogic.fetchSelectQueryRecords(client, queryString, params, cb);
    }
};


postgresLogic.nonSelectQuery = function(queryString, params, client, cb) {
    if (typeof client === 'function') {
        cb = client;
        client = undefined;
    }

    if (!client) {
        postgresLogic.connect(function(err, client, done) {
            if (err) {
                done();
                return cb(err, []);
            } else {
                postgresLogic.fetchNonSelectQueryRecords(client, queryString, params, cb, done);
            }
        });
    } else {
        postgresLogic.fetchNonSelectQueryRecords(client, queryString, params, cb);
    }
};

postgresLogic.nonSelectMultipleQuery = function(queryString, params, client, cb) {
    if (typeof client === 'function') {
        cb = client;
        client = undefined;
    }

    if (!client) {
        postgresLogic.connect(function(err, client, done) {
            if (err) {
                done();
                return cb(err, []);
            } else {
                postgresLogic.fetchNonSelectMultipleQueryRecords(client, queryString, params, cb, done);
            }
        });
    } else {
        postgresLogic.fetchNonSelectMultipleQueryRecords(client, queryString, params, cb);
    }
};

/**
 * #### Query execution ####
 * (1#) -> connectionId | config url connection
 * (2#) -> queryString | query passed
 * (3#) -> params | if params exist(optional)
 * (4#) -> client | if DB connection exist(optional)
 * (5#) -> cb | callback
 */
postgresLogic.selectPromise = function(queryString, params, client) {
    var deferred = Q.defer();
    var _done = undefined;
    var cb = function(err, data) {
        if (err) {
            _done && _done();
            return deferred.reject(err);
        }

        deferred.resolve(data);
    };

    if (!client) {
        postgresLogic.connect(function(err, client, done) {
            _done = done;
            if (err) {
                done();
                deferred.reject(err);
            } else {
                postgresLogic.fetchSelectQueryRecords(client, queryString, params, cb, done);
            }
        });
    } else {
        postgresLogic.fetchSelectQueryRecords(client, queryString, params, cb);
    }
    return deferred.promise;
};

module.exports = postgresLogic;
