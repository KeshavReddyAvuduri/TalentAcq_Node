//an object being exported
var jobOpeningDataService = {};

var jobopeningrequestmodel = require("../../models/jobopening/JobOpeningRequest.js");

jobOpeningDataService.createJobOpenings = function(req, res) {
    console.log("getJobFormData in jobOpeningDataService");
    
    var session = req.session;

    if (!session.useremail) {
        return res.json({success: false, data: null, session: false});
    }  else {
    	jobopeningrequestmodel.insertJobOpeningsData(req, res);
    }
};
/*geting data from  ddo_empeducation table */
jobOpeningDataService.getAllJobOpenings = function(req, res) {

    console.log("Getting data from JobService");

    /*verifying session*/
    var session = req.session;

    if (!session.useremail) {
        return res.json({
            success: false,
            data: null,
            session: false
        });
    }

    /**
    *session - login usersession 
    *req - request from session
    *res - response from session
    */
   jobopeningrequestmodel.getJobOpeningsData(req, res);

};
/*geting data from  ddo_empeducation table */
jobOpeningDataService.getJobOpeningsDataById = function(req, res) {

    console.log("Getting data from JobService");

    /*verifying session*/
    var session = req.session;

    if (!session.useremail) {
        return res.json({
            success: false,
            data: null,
            session: false
        });
    }

    /**
    *session - login usersession 
    *req - request from session
    *res - response from session
    */
   jobopeningrequestmodel.getJobOpeningsDataById(req, res);

};
/*geting data from  ddo_empeducation table */
jobOpeningDataService.deleteJobOpening = function(req, res) {

    console.log("Deliting data from JobService");

    /*verifying session*/
    var session = req.session;

    if (!session.useremail) {
        return res.json({
            success: false,
            data: null,
            session: false
        });
    }

    /**
    *session - login usersession 
    *req - request from session
    *res - response from session
    */
   jobopeningrequestmodel.deleteJobOpening(req, res);

};
jobOpeningDataService.getJobStatusData = function(req, res) {

    console.log("Getting data from JobStatus");

    /*verifying session*/
    // var session = req.session;

    // if (!session.useremail) {
    //     return res.json({
    //         success: false,
    //         data: null,
    //         session: false
    //     });
    // }   
   jobopeningrequestmodel.getJobStatusData(req, res);
};
jobOpeningDataService.getLocationData = function(req, res) {

    console.log("Getting data from Job Location");

    /*verifying session*/
    var session = req.session;

    if (!session.useremail) {
        return res.json({
            success: false,
            data: null,
            session: false
        });
    }   
   jobopeningrequestmodel.getLocationData(req, res);   
};
jobOpeningDataService.getJobRoles = function(req, res) {

    console.log("Getting data from Job Roles");

    /*verifying session*/
    var session = req.session;

    if (!session.useremail) {
        return res.json({
            success: false,
            data: null,
            session: false
        });
    }   
   jobopeningrequestmodel.getJobRoles(req, res);   
};
jobOpeningDataService.updateJobOpening = function(req, res) {

    // console.log("Getting data from Job Openings");

    // /*verifying session*/
    // var session = req.session;

    // if (!session.useremail) {
    //     return res.json({
    //         success: false,
    //         data: null,
    //         session: false
    //     });
    // }   
    var session = req.session;

    if (!session.useremail) {
        return res.json({success: false, data: null, session: false});
    } else {

        jobopeningrequestmodel.updateJobOpening(req.body, session, req, res);       
    }
   //jobopeningrequestmodel.updateJobOpening(req, res);   
};
jobOpeningDataService.getRecruitersList = function(req, res) {

    console.log("Getting data from Job Employees");

    /*verifying session*/
    var session = req.session;

    if (!session.useremail) {
        return res.json({
            success: false,
            data: null,
            session: false
        });
    }   
   jobopeningrequestmodel.getRecruitersList(req, res);   
};
jobOpeningDataService.updateJobStatus = function(req, res) {

    console.log("Update data from Job Status");

    /*verifying session*/
    var session = req.session;

    if (!session.useremail) {
        return res.json({
            success: false,
            data: null,
            session: false
        });
    }   
   jobopeningrequestmodel.updateJobStatus(req, res);   
};
module.exports = jobOpeningDataService;