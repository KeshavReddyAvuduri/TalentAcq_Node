var express = require('express');
var router = express.Router();
var db = require("../../helpers/db/Postgres");

/*API call for getting the tasks list */

router.get("/getsupervisorlist", function(req, res) {
    console.log('get getsupervisorlist API call in GeneralUtility');

    var session = req.session;
    
    if (!session.useremail) {
        return res.json({success: false, data: null, session: false});
    } else {
        //session logged details
        var userDetails = session.userDetails;

        var orgId = userDetails.ddo_org_id;
        var clientId = userDetails.ddo_client_id;

        var whereClause = " WHERE demp.DDO_client_id = $1 AND demp.ddo_org_id = $2";

        var selectQuery = "SELECT DISTINCT demp.ddo_employee_id as reportingEmpId, CONCAT(demp.firstName, ' ', demp.lastname) as reportingEmpName" +
            " FROM DDO_Employee demp JOIN DDO_EmpWorkDetails empwork ON empwork.reportingTo = demp.ddo_employee_id" +
            whereClause;

        console.log("Get reporting to employee list Query :", selectQuery);


        db.selectQuery(selectQuery, [clientId, orgId], function(err, result) {
            if (err) {
                console.log('error in getting the reporting to employee list', err);
                return res.status(500).json({success: false, data: err});
            } else {
                if (result.length == 0) {
                    return res.json({success: true, data: result, message: "No emp with supervisor role"});
                } else {                
                    return res.json({success: true, totalCount: result.length, data: result});           
                }

            }
        });
    }
});


router.get("/getempbasiclist", function(req, res) {
    console.log('get getempbasiclist API call in GeneralUtility');

    var session = req.session;
    
    if (!session.useremail) {
        return res.json({success: false, data: null, session: false});
    } else {
        //session logged details
        var userDetails = session.userDetails;

        var orgId = userDetails.ddo_org_id;
        var clientId = userDetails.ddo_client_id;

        var fetchQuery = "SELECT emp.ddo_employee_id as empid, CONCAT(emp.firstname, ' ', emp.lastname) as empName,  COALESCE(empimg.profileimage_url, (('http://www.gravatar.com/avatar/'::text || md5(emp.email::text)) || '.jpg?s200&d=identicon'::text)::character varying) AS profilepic,  emp.email as email, emp.employee_code as empcode FROM DDO_Employee emp LEFT JOIN DDO_EmpImages empimg ON  emp.ddo_employee_id = empimg.ddo_employee_id  WHERE  emp.DDO_client_id = $1 AND emp.ddo_org_id = $2 AND emp.isactive='Y' ORDER BY empname";
        console.log("Get basic employee list Query :", fetchQuery);

        db.selectQuery(fetchQuery, [clientId, orgId], function(err, data) {
            if(err) {
                return res.status(500).json({success: false, data: err, message: 'Failed to fetch the records!'});
            } else {
                if(data.length > 0) {
                    return res.json({success: true, data: data, totalCount: data.length, message: 'Successfully retrieved!'});
                } else {
                    return res.json({success: true, data: data, message: 'No employees found!'});
                }
            }
        });
    }
});

router.get("/getwalletbasiclist", function(req, res) {
    console.log('get getwalletbasiclist API call in GeneralUtility');

    var session = req.session;
    
    if (!session.useremail) {
        return res.json({success: false, data: null, session: false});
    } else {
        //session logged details
        var userDetails = session.userDetails;

        var orgId = userDetails.ddo_org_id;
        var clientId = userDetails.ddo_client_id;

        var fetchQuery = "SELECT DISTINCT(wallet_type) as wallettype from ddo_wallet WHERE DDO_client_id = $1 AND ddo_org_id = $2 AND isactive='Y' ORDER BY wallet_type";
        console.log("Get basic wallet list Query :", fetchQuery);

        db.selectQuery(fetchQuery, [clientId, orgId], function(err, data) {
            if(err) {
                return res.status(500).json({success: false, data: err, message: 'Failed to fetch the records!'});
            } else {
                if(data.length > 0) {
                    return res.json({success: true, data: data, totalCount: data.length, message: 'Successfully retrieved!'});
                } else {
                    return res.json({success: true, data: data, message: 'No wallet found!'});
                }
            }
        });
    }
});

router.get("/getempprojectsummary", function(req, res) {
    console.log('get empprojectsummary API call in GeneralUtility');

    var session = req.session;
    
    if (!session.useremail) {
        return res.json({success: false, data: null, session: false});
    } else {
        //logged user details
        var userInfo = session.userDetails;

        var ddo_org_id = userInfo.ddo_org_id;
        var ddo_client_id = userInfo.ddo_client_id;

        var ddo_employee_id = req.query.employeeid || userInfo.ddo_employee_id;

        var selectQuery = "select dp.ddo_project_id as project_id, dp.name as project_name, (select dpr.name from ddo_projectroles dpr where dpr.ddo_projectroles_id=dpa.ddo_projectroles_id) as project_role_name, dpa.allocpercent from ddo_project_allocation dpa LEFT JOIN ddo_project dp ON dp.ddo_project_id=dpa.ddo_project_id where dpa.ddo_employee_id = $3  and dpa.ddo_client_id = $1 and current_date BETWEEN dpa.startdate::date and dpa.enddate::date and dpa.ddo_org_id= $2 ORDER BY project_name, project_role_name";

        db.selectQuery(selectQuery, [ddo_client_id, ddo_org_id, ddo_employee_id], function(err, data) {
            if (err) {
                console.log("error in selectQuery, ProjectSummaryModel", err);
                return res.status(500).json({success: false, data: err, messgae: 'Failed to fetch project summary record!'});
            } else {
                return res.json({success: true, data: data, messgae: 'Successfully fetched'});
            }
        });
    }
});

router.get("/getclientroles", function(req, res) {
    console.log('get getclientroles API call in GeneralUtility');

    var session = req.session;
    
    if (!session.useremail) {
        return res.json({success: false, data: null, session: false});
    } else {
        //session logged details
        var userDetails = session.userDetails;

        var orgId = userDetails.ddo_org_id;
        var clientId = userDetails.ddo_client_id;

        var whereClause = " WHERE  DDO_client_id = $1 AND ddo_org_id = $2 AND isactive = 'Y'";

        var selectQuery = "select * from ddo_client_setting" +
            whereClause;

        console.log("Get getclientroles :", selectQuery);


        db.selectQuery(selectQuery, [clientId, orgId], function(err, result) {
            if (err) {
                console.log('error in getting the getclientroles', err);
                return res.status(500).json({success: false, data: err});
            } else {
                if (result.length == 0) {
                    return res.json({success: true, data: [], message: "No clientroles are found"});
                } else {                
                    return res.json({success: true, totalCount: result.length, data: result});           
                }

            }
        });
    }
});

module.exports = router;