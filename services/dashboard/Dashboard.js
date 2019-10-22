//an object being exported
var dashboardService = {};

var Util = require("../../helpers/Util.js");
var tables = require("../../helpers/Tables.json");

var dashboardModel = require("../../models/dashboard/Dashboard.js");

/**
* To fetch the department records
*/
dashboardService.fetchDepartmentRecords = function(req, res) {
    console.log("fetchDepartmentRecords in dashboardService");  

    var session = req.session;
    if (!session.useremail) {
        return res.json({success: false, data: null, session: false});
    } else {
	    //Calling Auth Model.
	    dashboardModel.fetchDepartmentRecords(session, req, res,function(err, data) {
            if(err) {
                return res.status(500).json({success: false, data: err, message: 'Failed to fetch the records!'});
            } else {
                return res.json({success: true, data: data, message: "successfully fetch data."});
            }
        });
	}
};

/**
* To fetch employee names
*/
dashboardService.getEmpRecords = function(req, res) {
    console.log("getEmpRecords in dashboardService");  

    var session = req.session;
    
    if (!session.useremail) {
        return res.json({success: false, data: null, session: false});
    } else {
	    //Calling Auth Model.
	    dashboardModel.getEmpRecords(session, req, res, function(err, data) {
            if(err) {
                return res.status(500).json({success: false, data: err, message: 'Failed to fetch the records!'});
            } else {
                return res.json({success: true, data: data, message: "successfully fetch data."});
            }
        });
	}
};

/**
* Org Chart GET API call
*/
dashboardService.orgChartFn = function(req, res) {
    console.log("orgChartFn in dashboardService");  

    var session = req.session;
    if (!session.useremail) {
        return res.json({success: false, data: null, session: false});
    } else {
        //Calling Auth Model.
        dashboardModel.orgChartFn(session, req, res,function(err, data) {
            if(err) {
                return res.status(500).json({success: false, data: err, message: 'Failed to fetch the records!'});
            } else {
                var dataLength = data.length;
                var orgRoot = [];
                
                while (dataLength--) {
                    var doc = data[dataLength];

                    if (doc.employee_code === doc.supervisor_code || doc.supervisor_code === undefined || doc.supervisor_code === null) {
                        doc.supervisor_code = 'root';
                        doc.supervisor_name = 'WTC';
                        doc.supervisor_email = null;
                        orgRoot.push(doc);
                    } 

                    orgRoot.push(doc);
                }

                var treeStoreFormat = Util.getTreeData(data, 'supervisor_code', 'employee_code', ['supervisor_code', 'supervisor_name', 'supervisor_email'], ['employee_code', 'employee_name'], {
                        'supervisor_code': 'employee_code',
                        'supervisor_name': 'employee_name',
                        'supervisor_email': 'employee_emailid'
                    });

                res.json(treeStoreFormat);
            }
        });
    }
};

/*This function is used to get the availability details of employee*/

dashboardService.getEmployeesAvaliabilityDetails = function(req, res) {
    console.log("getEmployeesAvaliabilityDetails in dashboardService");
    
    dashboardModel.getEmployeesAvaliabilityDetails(req, res);
};

/*This function is used to get the availability grouped employee*/

dashboardService.getEmployeesGroupedAvaliabilityDetails = function(req, res) {
    console.log("getEmployeesAvaliabilityDetails in dashboardService");
    
    dashboardModel.getEmployeesGroupedAvaliabilityDetails(req, res);
};
dashboardService.getAllocationDetails = function(req, res) {
    console.log("Get employees allocation details API call in dashboardService");
    dashboardModel.getAllocationDetails(req, res);
};
module.exports = dashboardService;
