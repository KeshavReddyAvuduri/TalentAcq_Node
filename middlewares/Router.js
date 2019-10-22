

var authController = require("../controllers/auth/Auth.js");

var SkillsController = require("../controllers/profile/Skills.js");


var dashboard = require("../controllers/dashboard/Dashboard.js");



var generalUtilityController = require("../controllers/util/GeneralUtility.js");

var projectTechnologies = require("../controllers/project/ProjectTechnologies.js");


//Job Openings
var jobOpeningRequestController = require("../controllers/jobopening/JobOpeningRequest.js");
var jobAppInterviewController = require("../controllers/jobopening/InterviewDetails.js");
var jobApplicationsController = require("../controllers/jobopening/JobApplications.js");

//Preferences
var preferenceController = require("../controllers/jobopening/Preference.js");

module.exports = function(app) {
    app.use("/auth", authController);

    
    app.use("/skill", SkillsController);

    app.use("/dashboard", dashboard);

    
    app.use("/utility", generalUtilityController);

    app.use("/projecttechnologies",projectTechnologies);

    

    //Job Openings

    app.use("/jobopeningrequest",jobOpeningRequestController);
    app.use("/jobappinterview",jobAppInterviewController);
    app.use("/jobapplication",jobApplicationsController);

    //Preferences

    app.use("/preference", preferenceController);
   

};
