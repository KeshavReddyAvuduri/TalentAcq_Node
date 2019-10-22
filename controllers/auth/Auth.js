var express = require('express');
var router = express.Router();
var db = require("../../helpers/db/Postgres");
var authService = require("../../services/auth/Auth.js");
var authmodel = require("../../models/auth/Auth.js");

//Login Authentication
router.post("", function (req, res, next) {
    console.log("Entering Authentication api call");
    authService.login(req, res);
});

router.get("/testApi", function (req, res) {
    return res.status(200).json({success: true, message: 'Hello, Keshav!'});
});

//To get UserDetails from session
router.get("/userdetails", function (req, res) {
    var session = req.session;
    if(!session.useremail || session.email != req.query.email) {
        authmodel.getSession(req, req.query.email.toLowerCase(), session)
        .then(function(data) {
            var dta = null;
            if(data != 'No Data Found!!') {
                dta = data;
            }
            
            console.log('New session created..');
            return res.json({success: true, data: dta, session: true});
        })
        .catch(function(err) {
            console.log('Auth model error: ', err);
            return res.status(500).json({success: false, data: err, message: 'Authentication failed!'});
        })
        .done();
    } else {
        return res.json({success: true, data: session.userDetails, session: true});
    }    
});

// Destroying existing session
router.get("/logout", function (req, res) {
    var session = req.session;
    if (session.user.email) {
        session.destroy(function (err) {
            if (err) {
                return res.json({success: true, data: "Unable to destroy session", session: true});
            }
            return res.json({success: true, data: null, session: false});
        });
    } else {
        return res.json({success: true, data: null, session: false});
    }
});

// Checking session if exist or not.
router.get("/checksession", function (req, res) {
    var session = req.session;
    if (session.useremail) {
        return res.json({success: true, data: null, session: true});
    } else {
        return res.json({success: true, data: null, session: false});
    }
});

module.exports = router;