//Pgsql Session
var dbConfig = require("../helpers/db/config.json");
var pg = require('pg')
var session = require('express-session');
var pgSession = require('connect-pg-simple')(session);

module.exports = function(app){

	// Make Session related Configuration
	var sessionOptions = {
	    secret: 'ddo_session',
	    resave : true,
	    saveUninitialized : true,
	    cookie: {},
	    store : new pgSession({
	    	pg : pg,
	    	conString : dbConfig.engazewell,
	    	tableName : 'ddo_session' 
	    })
	}
	app.use(session(sessionOptions));
}
