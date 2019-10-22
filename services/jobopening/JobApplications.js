var jobApplicationService = {};

var jobapplicationsmodel = require("../../models/jobopening/JobApplications.js");

jobApplicationService.createJobApplication = function(req, res) {
    console.log("getJobAppFormData in jobApplicationService");
    
    var session = req.session;

    if (!session.useremail) {
        return res.json({success: false, data: null, session: false});
    }  else {
    	jobapplicationsmodel.createJobApplication(req, res);
    }
   
};
jobApplicationService.createJobApplications = function(req, res) {
    console.log("createJobApplications in jobApplicationS");
    
    var session = req.session;

    if (!session.useremail) {
        return res.json({success: false, data: null, session: false});
    }  else {
        jobapplicationsmodel.createJobApplications(req, res);
    }
  
};
jobApplicationService.getJobApplications = function(req, res) {
    console.log("getJobAppFormData in jobApplicationService");
    
    var session = req.session;

    if (!session.useremail) {
        return res.json({success: false, data: null, session: false});
    }  else {
    	jobapplicationsmodel.getJobApplications(req, res);
    }
    
};
jobApplicationService.deleteJobApplications = function(req, res) {
    console.log("deleteJobAppFormData in jobApplicationService");
    
    var session = req.session;

    if (!session.useremail) {
        return res.json({success: false, data: null, session: false});
    }  else {
    	jobapplicationsmodel.deleteJobApplications(req, res);
    }
   
};
jobApplicationService.updateJobApplication = function(req, res) {
    console.log("updateJobApplication in jobApplicationService");
    
    var session = req.session;

    if (!session.useremail) {
        return res.json({success: false, data: null, session: false});
    } else {

        jobapplicationsmodel.updateJobApplication(req.body, session, req, res);            
    }
            
};
jobApplicationService.getJobHiringSource = function(req, res) {
    console.log("getJobHiringSource in jobApplicationService");
    
    var session = req.session;

    if (!session.useremail) {
        return res.json({success: false, data: null, session: false});
    }  else {
    	jobapplicationsmodel.getJobHiringSource(req, res);
    }
  
};
jobApplicationService.getJobApplicationById = function(req, res) {
    console.log("getJobApplicationById in jobApplicationService");
    
    // var session = req.session;

    // if (!session.useremail) {
    //     return res.json({success: false, data: null, session: false});
    // }  else {
    // 	jobapplicationsmodel.getJobApplicationById(req, res);
    // }
    jobapplicationsmodel.getJobApplicationById(req, res);
};
jobApplicationService.getJobEducation = function(req, res) {
    console.log("getJobEducation in jobApplicationService");
    
    var session = req.session;

    if (!session.useremail) {
        return res.json({success: false, data: null, session: false});
    }  else {
    	jobapplicationsmodel.getJobEducation(req, res);
    }
  
};
jobApplicationService.uploadResume = function(req, res) {
    console.log("upload resume in jobApplicationService");
    
    var session = req.session;

    if (!session.useremail) {
        return res.json({success: false, data: null, session: false});
    }  else {
    	jobapplicationsmodel.uploadResume(req, res);
    }
   
};
jobApplicationService.getIdDetails = function(req, res) {
    console.log("getIdDetails in jobApplicationService");
    
    var session = req.session;

    if (!session.useremail) {
        return res.json({success: false, data: null, session: false});
    }  else {
    	jobapplicationsmodel.getIdDetails(req, res);
    }
   
};

jobApplicationService.getAppDetailsByMobileNo = function(req, res) {
    console.log("getAppDetailsByMobileNo in jobApplicationService");

    var reqBody = req.query;
    var obj = {};
    obj.mobile = reqBody.mobile;  
    console.log("oooobjj",obj);
    jobapplicationsmodel.getAppDetailsByMobileNo(obj, req, res);    
};
// jobApplicationService.updateResumePath = function (req, res) {
//     var session = req.session;
//     if (!session.useremail) {
//         return res.json({success: false, data: null, session: false});
//     } else {
//         //controller function, to update the image url path
//         jobApplicationService.updateResumePath(req, res);
//     }
// };

module.exports = jobApplicationService;
