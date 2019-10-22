var express = require('express');
var router = express.Router();
var multer = require('multer');

var jobApplicationService = require("../../services/jobopening/JobApplications.js");
router.post("", function (req, res) {
    console.log("/createJobApplication POST API call in JobApplicationController");

    //service call goes here
    jobApplicationService.createJobApplication(req, res);
});
router.post("/jobapplications", function (req, res) {
    console.log("/createJobApplications POST API call in JobApplicationController");

    //service call goes here
    jobApplicationService.createJobApplications(req, res);
});
router.get("", function (req, res) {
    console.log("/getJobApplication GET API call in JobApplicationController");

    //service call goes here
    jobApplicationService.getJobApplications(req, res);
});
router.delete("", function (req, res) {
    console.log("/deleteJobApplications DELETE API call in JobApplicationController");

    //service call goes here
    jobApplicationService.deleteJobApplications(req, res);
});
router.put("", function (req, res) {
    console.log("/updateJobApplications PUT API call in JobApplicationController");

    //service call goes here
    jobApplicationService.updateJobApplication(req, res);
});
router.get("/hiringsource", function (req, res) {
    console.log("/getJobHiringSource GET API call in JobApplicationController");

    //service call goes here
    jobApplicationService.getJobHiringSource(req, res);
});
router.get("/getJobById", function (req, res) {
    console.log("/getJobApplicationById GET API call in JobApplicationController");

    //service call goes here
    jobApplicationService.getJobApplicationById(req, res);
});
router.get("/getJobeducation", function (req, res) {
    console.log("/getJobeducation GET API call in JobApplicationController");

    //service call goes here
    jobApplicationService.getJobEducation(req, res);
});

/**
 * Insert Resume in resumes directory
 */

router.post("/uploadResume", multer({dest: './appResumes/'}).single('appResume'), function (req, res) {
    console.log('resumes POST API call in JobApplicationController!');

    jobApplicationService.uploadResume(req, res);

});

router.get("/getIdDetails", function (req, res) {
    console.log("/getIdDetails GET API call in JobApplicationController");

    //service call goes here
    jobApplicationService.getIdDetails(req, res);
});

// /**
//  * POST API to update resumepath
//  * in ddo_jobapplication table
//  */

// router.post("", multer({dest: './appResumes/'}).single('appResumes'), function (req, res) {
//     console.log("app resume test");
   
//     jobApplicationService.updateResumePath(req, res);

    
// });
module.exports = router;