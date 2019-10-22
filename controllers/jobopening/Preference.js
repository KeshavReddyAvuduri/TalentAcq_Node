var express = require('express');
var router = express.Router();
var preferenceservice = require('../../services/jobopening/Preference.js');

router.get("/categories", function(req, res) {
	console.log("GET PREFERENCE DETAILS Controller");
	preferenceservice.getPreferenceDetails(req, res);
});

router.get("/preferencedata", function(req, res) {
	console.log("GET PREFERENCE DATA Controller");
	preferenceservice.getPreferenceData(req, res);
});

router.post("/preferencedata", function(req, res) {
	console.log("Create PREFERENCE DATA Controller");
	preferenceservice.createPreferenceData(req, res);
});

router.delete("/preferencedata", function(req, res) {
	console.log("Delete PREFERENCE DATA Controller");
	preferenceservice.deletePreferenceData(req, res);
});

router.put("/preferencedata", function(req, res) {
	console.log("Update PREFERENCE DATA Controller");
	preferenceservice.updatePreferenceData(req, res);
});


module.exports = router;