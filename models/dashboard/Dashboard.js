//an object being exported
var dashboardModel = {};

//(#pre-includes)
//db usage file like connection, query passage, etc...,
var db = require("../../helpers/db/Postgres.js");

//To use database Tables 
var tables = require("../../helpers/Tables.json");

//For error or success or anything else response color
var chalk = require('chalk');

//for error response color
var error = chalk.red;

//for success response color
var response = chalk.green;

//for query/no data/extra purpose color
var fetchcolor = chalk.blue;

//for start of function color
var startcolor = chalk.yellow;

var DDO_EMP_TABLE_NAME = tables['ddoemp'];

var DDO_EMP_IMAGES_TABLE_NAME = tables['ddoempimages'];

var DDO_DEPARTMENT_TABLE_NAME = tables['ddo_department'];

var DDO_DESIGNATION_TABLE_NAME = tables['ddo_designation'];

var DDO_EMP_WORK_DETAILS_TABLE_NAME = tables['ddoempworkdetails'];

/**
 * To fetch all the department records
 * params ->
 * (1#) - session | which stores in DB
 * (2#) - req | request of an API call
 * (3#) - res | response of an API call
 * (4#) - cb | callback
 */
dashboardModel.fetchDepartmentRecords = function (session, req, res, cb) {
    console.log(startcolor("fetchDepartmentRecords in dashboardModel"));

    //logged user details
    var userInfo = session.userDetails;

    var ddo_org_id = userInfo.ddo_org_id;
    var ddo_client_id = userInfo.ddo_client_id;

    var conditions = "isactive = 'Y' and ddo_client_id=$1 and ddo_org_id=$2";
    var fetchQuery = "select ddo_department_id, name from " + DDO_DEPARTMENT_TABLE_NAME + " where " + conditions;
    console.log('fetchQuery: ', fetchQuery);

    db.selectQuery(fetchQuery, [ddo_client_id, ddo_org_id], function (err, data) {
        if (err) {
            cb(err);
        } else {
            cb(null, data);
        }
    });
};

/**
 * To fetch all the employee records
 * params ->
 * (1#) - session | which stores in DB
 * (2#) - req | request of an API call
 * (3#) - res | response of an API call
 * (4#) - cb | callback
 *
 * ### INPUT PARAMETERS
 * (1$) - isGroup | only for groups(optional)
 */
dashboardModel.getEmpRecords = function (session, req, res, cb) {
    console.log(startcolor("getEmpRecords in dashboardModel"));

    //logged user details
    var userInfo = session.userDetails;
    
    var ddo_org_id = userInfo.ddo_org_id;
    var ddo_client_id = userInfo.ddo_client_id;

    var isGroup = req.query.isGroup || "";

    var fetchQuery;

    if (isGroup === 'false') {      
        // fetchQuery = "select de.ddo_employee_id as user_id, concat(de.firstname, ' ' ,de.lastname) as user_full_name, de.email as user_emilid, dd.name as user_designation, COALESCE(dei.profileimage_url, (('http://www.gravatar.com/avatar/'::text || md5(de.email::text)) || '.jpg?s200&d=identicon'::text)::character varying) AS user_profile_pic_url from " + DDO_EMP_TABLE_NAME + " de LEFT JOIN " + DDO_DESIGNATION_TABLE_NAME + " dd ON dd.ddo_designation_id=(select DISTINCT designation from " + DDO_EMP_WORK_DETAILS_TABLE_NAME + " dew where dew.ddo_employee_id=de.ddo_employee_id) LEFT JOIN " + DDO_EMP_IMAGES_TABLE_NAME + " dei ON dei.ddo_employee_id=de.ddo_employee_id where de.isactive = 'Y' and de.ddo_client_id = $1 and de.ddo_org_id = $2"
        fetchQuery=    "select de.ddo_employee_id as user_id, concat(de.firstname, ' ', de.lastname) as user_full_name, de.email as user_emilid, dd.ddo_designation_id as user_designation_id, dd.name as user_designation, COALESCE(dei.profileimage_url,  (( 'http://www.gravatar.com/avatar/' :: text || md5(de.email :: text) ) || '.jpg?s200&d=identicon' :: text ):: character varying ) AS user_profile_pic_url from ddo_employee de LEFT JOIN ddo_empworkdetails dew  ON de.ddo_employee_id =  dew.ddo_employee_id left join ddo_designation dd ON dd.ddo_designation_id=dew.designation LEFT JOIN ddo_empimages dei ON dei.ddo_employee_id = de.ddo_employee_id where de.isactive = 'Y' and de.ddo_client_id = $1 and de.ddo_org_id = $2"
    } else {
        fetchQuery = "select de.ddo_employee_id as employee_code, concat(de.firstname, ' ' ,de.lastname) as employee_name, dewk.department from " + DDO_EMP_TABLE_NAME + " de LEFT JOIN ddo_empworkdetails dewk ON dewk.ddo_employee_id=de.ddo_employee_id where de.isactive = 'Y'and de.ddo_client_id = $1 and dewk.empstatus!='Separated' and de.ddo_org_id = $2";
    }
    console.log('GET employee records: ', fetchQuery);

    db.selectQuery(fetchQuery, [ddo_client_id, ddo_org_id], function (err, data) {
        if (err) {
            cb(err);
        } else {
            cb(null, data);
        }
    });
};

/**
 * To fetch all the employee records
 * params ->
 * (1#) - session | which stores in DB
 * (2#) - req | request of an API call
 * (3#) - res | response of an API call
 * (4#) - cb | callback
 */
dashboardModel.orgChartFn = function (session, req, res, cb) {
    console.log(startcolor("orgChartFn in dashboardModel"));

    //logged user details
    var userInfo = session.userDetails;

    var ddo_org_id = userInfo.ddo_org_id;
    var ddo_client_id = userInfo.ddo_client_id;
    var fetchQuery = "select DISTINCT de.ddo_employee_id as employee_code, concat(de.firstname, ' ' ,de.lastname) as employee_name,"
                    + " de.email as employee_emailid, dde.ddo_employee_id as supervisor_code, concat(dde.firstname, ' ' ,dde.lastname)"
                    + " as supervisor_name, dde.email as supervisor_email, (select dd.name from ddo_designation dd"
                    + " WHERE dd.ddo_designation_id=dewk.designation) as employee_designation, (select ddep.name from ddo_department ddep"
                    + " WHERE ddep.ddo_department_id=dewk.department) as department_name, dewk.department  as ddo_department_id, de.employee_code"
                    + " as emp_id, COALESCE(dei.profileimage_url, (('http://www.gravatar.com/avatar/'::text || md5(de.email::text)) || '.jpg?s200&d=identicon'::text)::character varying) as user_profile_pic_url"
                    + " FROM ddo_employee de"
                    + " LEFT JOIN ddo_empworkdetails dewk ON dewk.ddo_employee_id=de.ddo_employee_id"
                    + " LEFT JOIN ddo_employee dde ON dde.ddo_employee_id=dewk.reportingto"
                    + " LEFT JOIN ddo_empimages dei ON dei.ddo_employee_id = de.ddo_employee_id"
                    + " WHERE de.isactive = 'Y' AND dewk.empstatus != 'Separated' and de.ddo_client_id = $1 and de.ddo_org_id = $2";
    db.selectQuery(fetchQuery, [ddo_client_id, ddo_org_id], function (err, data) {
        if (err) {
            cb(err);
        } else {
            cb(null, data);
        }
    });
};


dashboardModel.getEmployeesAvaliabilityDetails = function (req, res) {    
    console.log(startcolor("getEmployeesAvaliabilityDetails in dashboardModel"));
    
    var session = req.session;
    
    if (!session.useremail) {
        return res.json({success: false, data: null, session: false});
    } else {
        //session logged details
        var user = session.userDetails;

        var org_id = user.ddo_org_id;
        var client_id = user.ddo_client_id;
        var query = "select * from ddo_emp_fulldetails_v empdetails"
                    + " LEFT JOIN ddo_empprojects_v projects ON projects.ddo_employee_id = empdetails.c_bpartner_id"
                    + " LEFT JOIN ddo_emptechnologies_v technologies ON technologies.ddo_employee_id = empdetails.c_bpartner_id"
                    + " WHERE empdetails.ddo_client_id=$1 AND empdetails.ddo_org_id=$2 AND empdetails.isbillable='Y' and empdetails.jobtype = 'Billable'";
            
        console.log("query for getting the employee availiability details", query);

        db.selectQuery(query, [client_id, org_id], function (err, data) {
            if (err) {
                console.log("error in employeeavailability resources is:", err);
                return res.status(500).json({success: false, data: err});
            } else {
                res.json({success: true, data: data});                
            }
        });
    }    
};

dashboardModel.getEmployeesGroupedAvaliabilityDetails = function (req, res) {    
    console.log(startcolor("getEmployeesAvaliabilityDetails in dashboardModel"));
    
    var session = req.session;
    
    if (!session.useremail) {
        return res.json({success: false, data: null, session: false});
    } else {
        //session logged details
        var user = session.userDetails;

        var org_id = user.ddo_org_id;
        var client_id = user.ddo_client_id;
        
        var query = "select  DISTINCT on(c_bpartner_id) * ,(dp.allocpercent/100) as allocation_per from ddo_emp_fulldetails_v empdetails"
        + " LEFT JOIN ddo_empprojects_v projects ON projects.ddo_employee_id = empdetails.c_bpartner_id"
        + " LEFT JOIN ddo_emptechnologies_v technologies ON technologies.ddo_employee_id = empdetails.c_bpartner_id"
        + " LEFT JOIN ddo_empexperience_v exp ON exp.ddo_employee_id = empdetails.c_bpartner_id"
        + " LEFT JOIN ddo_empcurrentexp_v currexp ON currexp.ddo_employee_id = empdetails.c_bpartner_id LEFT join ddo_project_allocation dp ON dp.ddo_employee_id = empdetails.c_bpartner_id"
        + " WHERE empdetails.ddo_client_id=$1 AND empdetails.ddo_org_id=$2 AND empdetails.isbillable='Y' and empdetails.jobtype = 'Billable' and empdetails.employmentstatus  NOT IN('Separated') "
        + " ORDER BY c_bpartner_id DESC";           
            
        console.log("query for getting the employee availiability details", query);

        db.selectQuery(query, [client_id, org_id], function (err, data) {
            if (err) {
                console.log("error in employeeavailability resources is:", err);
                return res.status(500).json({success: false, data: err});
            } else {
                res.json({success: true, data: data});                
            }
        });
    }    
};

dashboardModel.getAllocationDetails = function (req, res) {    
    console.log(startcolor("Get employees allocation details API call in dashboardModel"));
    var session = req.session;
    var org_id = session.userDetails.ddo_org_id;
    var client_id = session.userDetails.ddo_client_id;
    var month=req.query.month;
    var year=req.query.yearcombo;
    if (!session.useremail) {
        return res.json({success: false, data: null, session: false});
    } else {
        
        var query="select e.firstname,e.lastname,p.name as project,sum(d.abs_allocation_perc) as allocation_factor, e.ddo_employee_id, e.employee_code, ewd.designation,des.name as designationname,d.month,d.fyear,fn.name as yearname,to_char(to_timestamp (d.month::text, 'mm'), 'TMMonth') as monthname from ddo_project_allocation_monthwise d join ddo_employee e on e.ddo_employee_id = d.ddo_employee_id join ddo_project p on p.ddo_project_id = d.ddo_project_id join ddo_empworkdetails ewd on ewd.ddo_employee_id= d.ddo_employee_id join ddo_designation des on des.ddo_designation_id =ewd.designation join ddo_fyear fn on fn.ddo_fyear_id=d.fyear where d.ddo_org_id="+org_id+" and d.ddo_client_id="+client_id;
        var grpAndOrderBy=" group by p.name,e.firstname,e.lastname,e.ddo_employee_id,ewd.designation,des.name,d.month,d.fyear,fn.name order by p.name"
        if(month && year){
        var conditions= " and d.month="+month+" and d.fyear="+year;
        query=query+conditions+grpAndOrderBy;
        }else{
        query=query+grpAndOrderBy
        }
            	
            console.log("query for getting the allocation details", query);

        db.selectQuery(query,[], function (err, data) {
            if (err) {
                console.log("error in employee allocation is:", err);
                return res.status(500).json({success: false, data: err});
            } else {
                res.json({success: true, data: data});                
            }
        });
    }    
};
module.exports = dashboardModel;