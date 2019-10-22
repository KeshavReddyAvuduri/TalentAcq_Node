var passport = require('passport');
var LdapStrategy = require('passport-ldapauth');

var OPTS = {
	server: {
		url: 'ldap://50.17.244.205:389',
		searchBase: 'ou=People,dc=17,dc=244,dc=205',
		searchFilter: 'uid={{username}}'
	}
};

module.exports = function(app) {
	console.log('OPTS: ', OPTS);
	passport.use(new LdapStrategy(OPTS));

	app.use(passport.initialize());

	// Make passport accessible to our router
	app.use(function(req, res, next) {
		req.passport = passport;
		next();
	});
};