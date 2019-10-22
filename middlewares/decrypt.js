var express = require('express');
var router = express.Router();

//for Encryption and decryption mechanism
var crypto = require('crypto');

var db = require("../helpers/db/Postgres.js");

/**
* POST API for decrypt call
*/
router.get("", function(req, res) {  
    var decipher = crypto.createDecipher('aes-256-cbc', 'ddosuperkey');

    var email = req.query.email;

    var fetchQuery = "SELECT password FROM ddo_user WHERE lower(regexp_replace(email, '\\s+$', ''))=lower(regexp_replace('" + email + "', '\\s+$', ''))";
    console.log('fetchQuery: ', fetchQuery);

    db.selectQuery(fetchQuery, [], function(err, data) {
    	if(err) {
    		return res.status(500).json({success: false, data: err, message: 'Failed to fetch the password!'});
    	} else {
    		if(data.length > 0) {
    			var decrypted = decipher.update(data[0].password.trim(), 'hex', 'utf-8');

				console.log('original text: ', data[0].password);

				decrypted += decipher.final('utf-8');
				console.log('decrypted: ', decrypted);

    			return res.json({password: decrypted});
    		} else {
    			return res.json({success: true, data: data, message: 'No data found!'});
    		}
    	}
    });	
});

module.exports = router;