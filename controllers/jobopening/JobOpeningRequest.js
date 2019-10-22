var express = require('express');
var router = express.Router();

var jobOpeningDataService = require("../../services/jobopening/JobOpeningRequest.js");

router.post("", function (req, res) {
    console.log("/createJobOpenings POST API call in getJobOpeningReuestDataController");

    //service call goes here
    jobOpeningDataService.createJobOpenings(req, res);
});
router.get("/getJobOpeningsDataById",function(req,res){
    console.log("/getJobOpeningsDataById GET API call in getJobOpeningReuestDataController");

    //service call goes here
    jobOpeningDataService.getJobOpeningsDataById(req, res);
});
router.get("",function(req,res){
    console.log("/getAllJobOpenings GET API call in getJobOpeningReuestDataController");

    //service call goes here
    jobOpeningDataService.getAllJobOpenings(req, res);
});
router.delete("",function(req,res){
    console.log("/deleteJobOpening DELETE API call in getJobOpeningReuestDataController");

    //service call goes here
    jobOpeningDataService.deleteJobOpening(req, res);
});
router.get("/getJobStatusData",function(req,res){
    console.log("/getJobStatusData GET API call in getJobOpeningReuestDataController");

    //service call goes here
    jobOpeningDataService.getJobStatusData(req, res);
});
router.get("/getLocationData",function(req,res){
    console.log("/getLocationData GET API call in getJobOpeningReuestDataController");

    //service call goes here
    jobOpeningDataService.getLocationData(req, res);
});
router.get("/getJobRoles",function(req,res){
    console.log("/getJobRoles GET API call in getJobOpeningReuestDataController");

    //service call goes here
    jobOpeningDataService.getJobRoles(req, res);
});
router.put("",function(req,res){
    console.log("/updateJobOpening GET API call in getJobOpeningReuestDataController");

    //service call goes here
    jobOpeningDataService.updateJobOpening(req, res);
});
router.get("/getRecruitersList",function(req,res){
    console.log("/getRecruitersList GET API call in getJobOpeningReuestDataController");

    //service call goes here
    jobOpeningDataService.getRecruitersList(req, res);
});
router.put("/updateJobStatus",function(req,res){
    console.log("/updateJobStatus GET API call in getJobOpeningReuestDataController");

    //service call goes here
    jobOpeningDataService.updateJobStatus(req, res);
});
module.exports = router;