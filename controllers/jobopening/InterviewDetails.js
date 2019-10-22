var express = require('express');
var router = express.Router();

var interviewDetailsDataService = require("../../services/jobopening/InterviewDetails.js");
router.post("", function (req, res) {
    console.log("/createJobInterviewDetails POST API call in getInterviewDetailsDataController");

    //service call goes here
    interviewDetailsDataService.createJobInterviewDetails(req, res);
});
router.get("", function (req, res) {
    console.log("/ReadJobInterviewDetails POST API call in getInterviewDetailsDataController");

    //service call goes here
    interviewDetailsDataService.getJobInterviewDetails(req, res);
});
router.delete("", function (req, res) {
    console.log("/deleteInterviewRequest POST API call in  getInterviewDetailsDataController");

    //service call goes here
    interviewDetailsDataService.deleteInterviewRequest(req, res);
});
router.put("/updateintvwstatus", function (req, res) {
    console.log("/interviewStatusUpdate POST API call in getInterviewDetailsDataController");

    //service call goes here
    interviewDetailsDataService.interviewStatusUpdate(req, res);
});

router.get("/interviewstatus", function (req, res) {
    console.log("/interviewStatusDetails POST API call in getInterviewDetailsDataController");

    //service call goes here
    interviewDetailsDataService.interviewStatusDetails(req, res);
});

router.get("/appstatus", function (req, res) {
    console.log("/applicationStatusDetails POST API call in getInterviewDetailsDataController");

    //service call goes here
    interviewDetailsDataService.applicationStatusDetails(req, res);
});
router.get("/getInterviewRating", function (req, res) {
    console.log("/getInterviewRating GET API call in getInterviewDetailsDataController");

    //service call goes here
    interviewDetailsDataService.getInterviewRating(req, res);
});
router.put("", function (req, res) {
    console.log("updateInterviewDetails PUT API call in getInterviewDetailsDataController");

    //service call goes here
    interviewDetailsDataService.updateInterviewDetails(req, res);
});
router.get("/getinterviewrequests", function (req, res) {
    console.log("interviewRequestDetails GET API call in getInterviewDetailsDataController");

    //service call goes here
    interviewDetailsDataService.interviewRequestDetails(req, res);
});
router.get("/getInterviewPanelMembers", function (req, res) {
    console.log("getInterviewPanelMembers GET API call in getInterviewDetailsDataController");

    //service call goes here
    interviewDetailsDataService.getInterviewPanelMembers(req, res);
});
module.exports = router;