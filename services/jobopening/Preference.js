var preferenceservice = { };

var preferencemodel = require('../../models/jobopening/Preference.js');

preferenceservice.getPreferenceDetails = function( req, res ){
			console.log("GET PREFERENCE DETAILS Services");

		    var session = req.session;
		    
		    if (!session.useremail) {
		        return res.json({success: false, data: null, session: false});
		    }  
		    else {
		    	console.log(session);
		    	preferencemodel.getPreferenceDetails( req, res );
			}
			// preferencemodel.getPreferenceDetails( req, res );
};

preferenceservice.getPreferenceData = function( req, res ){
			console.log("GET PREFERENCE DATA Services");

		    var session = req.session;
		    
		    if (!session.useremail) {
		        return res.json({success: false, data: null, session: false});
		    }  
		    else {
		    	preferencemodel.getPreferenceData( req, res );
			}
			// preferencemodel.getPreferenceData( req, res );
};

preferenceservice.deletePreferenceData = function( req, res ){
			console.log("Delete PREFERENCE DATA Services");

		    var session = req.session;
		    
		    if (!session.useremail) {
		        return res.json({success: false, data: null, session: false});
		    }  
		    else {
		    	preferencemodel.deletePreferenceData( req, res );
		    }
};

preferenceservice.createPreferenceData = function( req, res ){
			console.log("Create PREFERENCE DATA Services");

		    var session = req.session;
		    
		    if (!session.useremail) {
		        return res.json({success: false, data: null, session: false});
		    }  
		    else {
		    	preferencemodel.createPreferenceData( req, res );
		    }
};

preferenceservice.updatePreferenceData = function( req, res ){
			console.log("Update PREFERENCE DATA Services");

		    var session = req.session;
		    
		    if (!session.useremail) {
		        return res.json({success: false, data: null, session: false});
		    }  
		    else {
		    	preferencemodel.updatePreferenceData( req, res );
		    }
};

module.exports = preferenceservice;