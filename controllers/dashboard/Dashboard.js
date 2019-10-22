var express = require('express');
var router = express.Router();

var dashboardService = require("../../services/dashboard/Dashboard.js");

/**
* Fetch department names based on
* clientId and orgId
*/
router.get("/getDepartmentNames", function (req, res, next) {
    console.log("/getDepartmentNames GET API call in DashboardController");

    //service goes here
    dashboardService.fetchDepartmentRecords(req, res);
});

/**
* Fetch department names based on
* clientId and orgId
*/
router.get("/getEmployeeNames", function (req, res, next) {
    console.log("/getEmployeeNames GET API call in DashboardController");

    //service goes here
    dashboardService.getEmpRecords(req, res);
});

/**
* Organisation Chart GET API call
* based on clientId and orgId
*/
router.get("/organization", function (req, res, next) {
    console.log("/organization GET API call in DashboardController");

    //service goes here
    dashboardService.orgChartFn(req, res);
});

/*API call for getting the Employees availability details*/

router.get("/employeeavailability/resources", function (req, res) {
    console.log("Get employees availability details API call in DashboardController");

    dashboardService.getEmployeesAvaliabilityDetails(req, res);
});

/*API call for getting the Employees availability details*/

router.get("/employeeavailability/groupedresources", function (req, res) {
    console.log("Get employees availability details API call in DashboardController");

    dashboardService.getEmployeesGroupedAvaliabilityDetails(req, res);
});
router.get("/allocation", function (req, res) {
    console.log("Get employees allocation details API call in DashboardController");

    dashboardService.getAllocationDetails(req, res);
});

module.exports = router;