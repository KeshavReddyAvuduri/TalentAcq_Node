//an object being exported
var interviewDetailsDataService = {};

var interviewdetailsrequestmodel = require("../../models/jobopening/InterviewDetails.js");
interviewDetailsDataService.createJobInterviewDetails = function(req, res) {
    console.log("getJobInterviewFormData in interviewDetailsDataService");
    
    var session = req.session;

    if (!session.useremail) {
        return res.json({success: false, data: null, session: false});
    }  else {
    	interviewdetailsrequestmodel.insertJobInterviewDetailsData(req, res);
    }
};

interviewDetailsDataService.getJobInterviewDetails = function(req, res) {
    console.log("getJobInterviewDetails in interviewDetailsDataService");
    
    var session = req.session;

    if (!session.useremail) {
        return res.json({success: false, data: null, session: false});
    }  else {
    	interviewdetailsrequestmodel.getJobInterviewDetails(req, res);
    }
};
interviewDetailsDataService.interviewStatusUpdate = function(req, res) {
    console.log("getJobInterviewDetails in interviewDetailsDataService");
    
    var session = req.session;

    if (!session.useremail) {
        return res.json({success: false, data: null, session: false});
    }  else {
    	interviewdetailsrequestmodel.interviewStatusUpdate(req, res);
    }
};
interviewDetailsDataService.interviewStatusDetails = function(req, res) {
    console.log("getJobInterviewFormData in interviewDetailsDataService");
    
    var session = req.session;

    if (!session.useremail) {
        return res.json({success: false, data: null, session: false});
    }  else {
    	interviewdetailsrequestmodel.interviewStatusDetails(req, res);
    }
};

interviewDetailsDataService.applicationStatusDetails = function(req, res) {
    console.log("getJobApp Status Data in interviewDetailsDataService");
    
    var session = req.session;

    if (!session.useremail) {
        return res.json({success: false, data: null, session: false});
    }  else {
    	interviewdetailsrequestmodel.applicationStatusDetails(req, res);
    }
};
interviewDetailsDataService.getInterviewRating = function(req, res) {
    console.log("getInterviewRating  Data in interviewDetailsDataService");
    
    var session = req.session;

    if (!session.useremail) {
        return res.json({success: false, data: null, session: false});
    }  else {
    	interviewdetailsrequestmodel.getInterviewRating(req, res);
    }
};
interviewDetailsDataService.updateInterviewDetails = function(req, res) {
    console.log("updateInterviewDetails  Data in interviewDetailsDataService");
    var session = req.session;

    if (!session.useremail) {
        return res.json({success: false, data: null, session: false});
    } else {

        interviewdetailsrequestmodel.updateInterviewDetails(req.body, session, req, res);       
    }
};
interviewDetailsDataService.interviewRequestDetails = function(req, res) {
    console.log("getInterviewDetails  Data in interviewDetailsDataService");
    var session = req.session;

    if (!session.useremail) {
        return res.json({success: false, data: null, session: false});
    } else {

        interviewdetailsrequestmodel.interviewRequestDetails(req, res);       
    }
};
interviewDetailsDataService.deleteInterviewRequest = function(req, res) {
    console.log("deleteInterviewRequest  Data in interviewDetailsDataService");
    var session = req.session;

    if (!session.useremail) {
        return res.json({success: false, data: null, session: false});
    } else {

        interviewdetailsrequestmodel.deleteInterviewRequest(req, res);       
    }
};
interviewDetailsDataService.getInterviewPanelMembers = function(req, res) {
    console.log("getInterviewPanelMembers  Data in interviewDetailsDataService");
    var session = req.session;

    if (!session.useremail) {
        return res.json({success: false, data: null, session: false});
    } else {

        interviewdetailsrequestmodel.getInterviewPanelMembers(req, res);       
    }
};
module.exports = interviewDetailsDataService;