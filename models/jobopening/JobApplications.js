var jobapplicationsmodel = {};
var Q = require("q");

var db = require("../../helpers/db/Postgres.js");
var tables = require("../../helpers/Tables.json");

var Transaction = require('pg-transaction');
var Util = require('../../helpers/Util.js');
var Transaction = require('pg-transaction');
var master = require('./');


jobapplicationsmodel.createJobApplications = function ( req, res ){

    
    /*fetching data from session*/
    var session = req.session;
    var userInfo = session.userDetails;

    console.log("uuuuu", userInfo);
    var createdby = userInfo.ddo_employee_id,
        updatedby = userInfo.ddo_employee_id;

    var ddo_client_id = userInfo.ddo_client_id;
    var ddo_org_id = userInfo.ddo_org_id;
    var ddo_employee_id = userInfo.ddo_employee_id;
    var reqBody = req.body;

    var ddo_jobapplication_id = reqBody.ddo_jobapplication_id;
    // obj.Referred_BY = reqBody.referred_by;

    

    // console.log("reqBodyyyy", reqBody);
    // console.log("uuuuu", userInfo);

    
    /*columns for query*/
    var jobColumns = "ddo_client_id,ddo_org_id,ddo_jobeducation_id,ddo_jobopening_id,ddo_jobapplicationstatus_id,createdby,updatedby,isactive,firstName,lastName,currentJobTitle,workExpYears,workExpMonths,currentLocation,collegeName,mobile,emailId,ddo_jobhiringsource_id,jobPortalName,resumePath,declineReason,app_skills,ddo_employeereferral_id,resumename,ddo_jobidentificationtype_id,identification_num,recruiter,preferred_location,submission_date";
    // console.log("jjjjjjjj", jobColumns.split(',').length);
    /*values for query*/
    var values = "" ;
    var appNo = 0;
    var totalApplications = reqBody.applications;
    while( appNo < totalApplications.length ){
        
        var obj = {};
        obj.isactive = totalApplications[appNo].isactive || 'Y';
        var ddo_jobopening_id = totalApplications[appNo].ddo_jobopening_id;
        var ddo_jobapplicationstatus_id = totalApplications[appNo].ddo_jobapplicationstatus_id || 1;
        var ddo_jobeducation_id = totalApplications[appNo].ddo_jobeducation_id || null;
        var ddo_jobhiringsource_id = totalApplications[appNo].ddo_jobhiringsource_id || 1;
        var ddo_jobidentificationtype_id = totalApplications[appNo].ddo_jobidentificationtype_id || 1;
        var ddo_employeereferral_id = totalApplications[appNo].ddo_employeereferral_id;
        obj.firstName = totalApplications[appNo].firstName;
        obj.lastName = totalApplications[appNo].lastName;
        obj.currentJobTitle = totalApplications[appNo].currentJobTitle ? "'" + totalApplications[appNo].currentJobTitle + "'" : null;
        obj.workExpYears = totalApplications[appNo].workExpYears || null;
        obj.workExpMonths = totalApplications[appNo].workExpMonths || null;
        obj.currentLocation = totalApplications[appNo].currentLocation ? "'" + totalApplications[appNo].currentLocation + "'" : null;
        obj.collegeName = totalApplications[appNo].collegeName ? "'" + totalApplications[appNo].collegeName + "'" : null;
        obj.mobile = totalApplications[appNo].mobile;
        obj.emailId = totalApplications[appNo].emailId;
        obj.jobPortalName = totalApplications[appNo].jobPortalName ? "'" + totalApplications[appNo].jobPortalName + "'" : null;
        obj.resumePath = totalApplications[appNo].resumePath;
        obj.resumename = totalApplications[appNo].resumename;
        obj.declineReason = totalApplications[appNo].declineReason ? "'" + totalApplications[appNo].declineReason + "'" : null;
        obj.app_skills = totalApplications[appNo].app_skills ? "'" + totalApplications[appNo].app_skills + "'" : null;
        obj.identification_num = totalApplications[appNo].identification_num;
        obj.recruiter = totalApplications[appNo].recruiter;
        obj.submission_date = totalApplications[appNo].submission_date;
        obj.preferredLocation = totalApplications[appNo].preferredLocation;


         values += "("
            + ddo_client_id + ","
            + ddo_org_id + ","
            + ddo_jobeducation_id + ","
            + ddo_jobopening_id + ","
            + ddo_jobapplicationstatus_id + ","
            + createdby + ","
            + updatedby + ",'"
            + obj.isactive + "','"
            + obj.firstName + "','"
            + obj.lastName + "',"
            + obj.currentJobTitle + ","
            + obj.workExpYears + ","
            + obj.workExpMonths + ","
            + obj.currentLocation + ","
            + obj.collegeName + ",'"
            + obj.mobile + "','"
            + obj.emailId + "',"
            + ddo_jobhiringsource_id + ","
            + obj.jobPortalName + ",'"
            // + '*' + ",'"
            + obj.resumePath + "',"
            + obj.declineReason + ","
            + obj.app_skills + ",NULL" + ",'"
            + obj.resumename+"',"
            + ddo_jobidentificationtype_id + ",'"
            + obj.identification_num + "','"
            + obj.recruiter+"','"
            + obj.preferredLocation+"','"
            + obj.submission_date+"'),";
        /*table name*/
        appNo++;
    }

    var jobTable = tables["ddo_jobapplication"];
    // console.log("byyyy", obj);

    // if (!obj.Referred_BY) {
        var ddoJobAppInsertQuery = "INSERT INTO " + jobTable + " (" + jobColumns + ") VALUES " + values.slice( 0,-1 );
        console.log("appppp", ddoJobAppInsertQuery);
        db.nonSelectQuery(ddoJobAppInsertQuery, [], function (err, data) {
            if (err) {
                console.log("err in insert Job App Details", err);
                return res.status(500).json({ success: false, data: err, message: 'This is a Duplicate application/referral. This combination already exists.' });
            } else {
                return res.json({ success: true, message: "Successfully Job Application/referral Details is created" });
            }
        });

    // }
}, 

jobapplicationsmodel.createJobApplication = function (req, res) {
    var obj = {};
    /*fetching data from session*/
    var session = req.session;
    var userInfo = session.userDetails;

    console.log("uuuuu", userInfo);
    var createdby = userInfo.ddo_employee_id,
        updatedby = userInfo.ddo_employee_id;

    var ddo_client_id = userInfo.ddo_client_id;
    var ddo_org_id = userInfo.ddo_org_id;
    var ddo_employee_id = userInfo.ddo_employee_id;
    var reqBody = req.body;

    var ddo_jobapplication_id = reqBody.ddo_jobapplication_id;
    obj.Referred_BY = reqBody.referred_by;

    obj.isactive = reqBody.isactive || 'Y';

    console.log("reqBodyyyy", reqBody);
    console.log("uuuuu", userInfo);

    var ddo_jobopening_id = reqBody.ddo_jobopening_id;
    var ddo_jobapplicationstatus_id = reqBody.ddo_jobapplicationstatus_id;
    var ddo_jobeducation_id = reqBody.ddo_jobeducation_id || null;
    var ddo_jobhiringsource_id = reqBody.ddo_jobhiringsource_id || 1;
    var ddo_jobidentificationtype_id = reqBody.ddo_jobidentificationtype_id || 1;
    var ddo_employeereferral_id = reqBody.ddo_employeereferral_id;
    obj.firstName = reqBody.firstName;
    obj.lastName = reqBody.lastName;
    obj.currentJobTitle = reqBody.currentJobTitle ? "'" + reqBody.currentJobTitle + "'" : null;
    obj.workExpYears = reqBody.workExpYears || null;
    obj.workExpMonths = reqBody.workExpMonths || null;
    obj.currentLocation = reqBody.currentLocation ? "'" + reqBody.currentLocation + "'" : null;
    obj.collegeName = reqBody.collegeName ? "'" + reqBody.collegeName + "'" : null;
    obj.mobile = reqBody.mobile;
    obj.emailId = reqBody.emailId;
    obj.jobPortalName = reqBody.jobPortalName ? "'" + reqBody.jobPortalName + "'" : null;
    obj.resumePath = reqBody.resumePath;
    obj.resumename = reqBody.resumename;
    obj.declineReason = reqBody.declineReason ? "'" + reqBody.declineReason + "'" : null;
    obj.app_skills = reqBody.app_skills ? "'" + reqBody.app_skills + "'" : null;
    obj.identification_num = reqBody.identification_num;
    obj.recruiter = reqBody.recruiter;
    obj.submission_date = reqBody.submission_date;
    obj.preferredLocation = reqBody.preferredLocation;
    /*columns for query*/
    var jobColumns = "ddo_client_id,ddo_org_id,ddo_jobeducation_id,ddo_jobopening_id,ddo_jobapplicationstatus_id,createdby,updatedby,isactive,firstName,lastName,currentJobTitle,workExpYears,workExpMonths,currentLocation,collegeName,mobile,emailId,ddo_jobhiringsource_id,jobPortalName,resumePath,declineReason,app_skills,ddo_employeereferral_id,resumename,ddo_jobidentificationtype_id,identification_num,recruiter,preferred_location,submission_date";
    // console.log("jjjjjjjj", jobColumns.split(',').length);
    /*values for query*/
    var values = "("
        + ddo_client_id + ","
        + ddo_org_id + ","
        + ddo_jobeducation_id + ","
        + ddo_jobopening_id + ","
        + ddo_jobapplicationstatus_id + ","
        + createdby + ","
        + updatedby + ",'"
        + obj.isactive + "','"
        + obj.firstName + "','"
        + obj.lastName + "',"
        + obj.currentJobTitle + ","
        + obj.workExpYears + ","
        + obj.workExpMonths + ","
        + obj.currentLocation + ","
        + obj.collegeName + ",'"
        + obj.mobile + "','"
        + obj.emailId + "',"
        + ddo_jobhiringsource_id + ","
        + obj.jobPortalName + ",'"
        // + '*' + ",'"
        + obj.resumePath + "',"
        + obj.declineReason + ","
        + obj.app_skills + ",NULL" + ",'"
        + obj.resumename+"',"
        + ddo_jobidentificationtype_id + ",'"
        + obj.identification_num + "','"
        + obj.recruiter+"','"
        + obj.preferredLocation+"','"
        + obj.submission_date+"')";
    /*table name*/
    var jobTable = tables["ddo_jobapplication"];
    console.log("byyyy", obj);

    if (!obj.Referred_BY) {
        var ddoJobAppInsertQuery = "INSERT INTO " + jobTable + " (" + jobColumns + ") VALUES " + values;
        console.log("appppp", ddoJobAppInsertQuery);
        db.nonSelectQuery(ddoJobAppInsertQuery, [], function (err, data) {
            if (err) {
                console.log("err in insert Job App Details", err);
                return res.status(500).json({ success: false, data: err, message: 'This is a Duplicate application/referral. This combination already exists.' });
            } else {
                return res.json({ success: true, message: "Successfully Job Application/referral Details is created" });
            }
        });

    } else {
        obj.Referred_BY = reqBody.referred_by;
        obj.Relationship = reqBody.Relationship;
        obj.Recommendation = reqBody.Recommendation;
        /*columns for query*/
        var jobrefColumns = "ddo_client_id,ddo_org_id,createdby,updatedby,isactive,Referred_BY,Relationship,Recommendation";
        var refvalues = "("
            + ddo_client_id + ","
            + ddo_org_id + ","
            + createdby + ","
            + updatedby + ",'"
            + obj.isactive + "',"
            + obj.Referred_BY + ",'"
            + obj.Recommendation + "','"
            + obj.Relationship + "')";
        /*table name*/
        var jobRefTable = tables["ddo_employeereferral"];
        var ddoJobAppInsertQuery = "INSERT INTO " + jobTable + " (" + jobColumns + ") VALUES " + values;
        var ddoJobRefInsertQuery = "INSERT INTO " + jobRefTable + " (" + jobrefColumns + ") VALUES " + refvalues;

        jobapplicationsmodel.transactionLogic(req, res, ddoJobAppInsertQuery, ddoJobRefInsertQuery);
    }

    /*query to insert data in ddo_jobopening*/

},
    jobapplicationsmodel.transactionLogic = function (req, res, ddoJobAppInsertQuery, ddoJobRefInsertQuery) {
        db.connect(function (err, client, done) {
            if (err) {
                console.log("err in database connection", err);
                return res.status(500).json({
                    success: false,
                    data: err,
                    message: "Failed to connect to DB!"
                });

            } else {
                var tx = new Transaction(client);

                tx.begin();

                //Initializing an object
                var obj = {};

                obj['tx'] = tx;

                obj['res'] = res;

                obj['done'] = done;

                obj['client'] = client;

                obj['savepoint'] = 'jobApp';

                tx.savepoint(obj['savepoint']);

                db.nonSelectQuery(ddoJobRefInsertQuery, [], client, function (err, appData) {
                    console.log("ref", ddoJobRefInsertQuery);
                    if (err) {
                        console.log("Error while creating Job ref!!", err);
                        Util.rollbackFn(obj, err, 'Fail to Create Job ref!!');
                    }
                    ddoJobAppInsertQuery = ddoJobAppInsertQuery.replace('NULL', appData[0].ddo_employeereferral_id);
                    console.log("ref time app insertion", ddoJobAppInsertQuery);
                    db.nonSelectQuery(ddoJobAppInsertQuery, [], client, function (err, appData) {
                        if (err) {
                            // console.log("queryy", ddoJobAppInsertQuery);
                            console.log("Error while creating Job App!!", err);
                            Util.rollbackFn(obj, err, 'Fail to Create Job App/Ref!! This is a Duplicate application/referral. This combination already exists.');
                        }
                        console.log(appData);
                        Util.commitFn(obj, "Successfully job App is created!");
                    })
                    //obj.ddo_employeegoal_id = goalData[0].ddo_employeegoal_id;
                    //obj.ddo_employee_id = goalData[0].ddo_employee_id;
                    var message = "Successfully Job App is created!";


                });
            }
        });
    },
    jobapplicationsmodel.getJobApplications = function (req, res) {
        console.log("Fetching Job Data");

        /*Fetching data from session*/
        var session = req.session;
        var userInfo = session.userDetails;
        var ddo_client_id = userInfo.ddo_client_id;
        var ddo_org_id = userInfo.ddo_org_id;
        var ddo_employee_id = userInfo.ddo_employee_id;
        var reqBody = req.query;
        var isjobApp = reqBody.isjobApp;
        var ddo_jobopening_id = reqBody.ddo_jobopening_id;
        var referred_BY = reqBody.referred_BY;
        console.log("reqqqq", reqBody);
        /*Table name*/
        var ddoJobAppTable = tables["ddo_jobapplication"];
        var ddoEmpRefTable = tables["ddo_employeereferral"];
        var ddoEmployeeTable = tables["ddoemp"];
        /*columns for table*/


        // if (isjobApp) {
        var condition = "ddo_jobapp.isactive = 'Y' AND ddo_jobapp.DDO_Client_ID = " + ddo_client_id + " AND ddo_jobapp.DDO_Org_ID = " + ddo_org_id;

        if (referred_BY) {
            condition = condition + " AND ddo_emp_ref.referred_by = " + referred_BY;
        }
        else {
            condition = `${condition} ${ddo_jobopening_id ? ("AND ddo_jobapp.ddo_jobopening_id = " + ddo_jobopening_id) : ""}`;
        }
        /*select query*/
        var jobAppSelectQuery = "SELECT ddo_jobapp.ddo_jobapplication_id as ddo_jobapplication, "
            + " ddo_jobapp.updated as jobupdateddate,ddo_jobapp.firstname as appfirstname,ddo_jobapp.lastname as applastname, ddo_jobeducation.name as education,ddo_jobapplicationstatus.name as appstatus, *,(select array_agg(skills.name) as skillnames from ddo_skills skills where skills.ddo_skills_id IN (select unnest(string_to_array(ddo_job_app.app_skills,',',''))::int from ddo_jobapplication ddo_job_app where ddo_job_app.ddo_jobapplication_id = ddo_jobapp.ddo_jobapplication_id )) FROM "
            + ddoJobAppTable
            + " ddo_jobapp LEFT JOIN "
            + " ddo_jobeducation ON ddo_jobeducation.ddo_jobeducation_id = ddo_jobapp.ddo_jobeducation_id "
            + " LEFT JOIN "
            + " ddo_jobopening ON ddo_jobopening.ddo_jobopening_id = ddo_jobapp.ddo_jobopening_id "
            + " LEFT JOIN "
            + " ddo_jobapplicationstatus ON ddo_jobapplicationstatus.ddo_jobapplicationstatus_id = ddo_jobapp.ddo_jobapplicationstatus_id "
            + " LEFT JOIN "
            + " ddo_jobhiringsource ON ddo_jobhiringsource.ddo_jobhiringsource_id = ddo_jobapp.ddo_jobhiringsource_id"
            + " LEFT JOIN "
            + ddoEmpRefTable + " ddo_emp_ref ON ddo_emp_ref.ddo_employeereferral_id = ddo_jobapp.ddo_employeereferral_id"
            + "  LEFT JOIN "
            + ddoEmployeeTable
            + " ddo_emp ON ddo_emp_ref.referred_by = ddo_emp.ddo_employee_id "
            + " WHERE "
            + condition;

        // }
        //  else {
        //
        //     var condition = "ddo_empref.isactive = 'Y' AND ddo_empref.DDO_Client_ID = " + ddo_client_id + " AND ddo_empref.DDO_Org_ID = " + ddo_org_id;
        //     /*select query*/
        //     var jobAppSelectQuery = "SELECT ddo_empref.updated as jobupdateddate,ddo_emp.firstname as referername, * FROM "
        //         + ddoEmpRefTable
        //         + " ddo_empref LEFT JOIN "
        //         + ddoEmployeeTable
        //         + " ddo_emp ON ddo_empref.referred_by = ddo_emp.ddo_employee_id "
        //         + " WHERE "
        //         + condition;
        // }

        console.log("testquery ", jobAppSelectQuery);
        /*query execution*/
        db.selectQuery(jobAppSelectQuery, [], function (err, joblist) {
            if (err) {
                console.log("err in get API of Job Openings", err);
                return res.status(500).json({
                    success: false,
                    data: err
                });
            } else {
                return res.json({
                    success: true,
                    totalCount: joblist.length,
                    data: joblist
                });
            }
        });
    },
    jobapplicationsmodel.deleteJobApplications = function (req, res) {
        console.log("deleteJobApplication in JobOpeningRequestModel");
        var session = req.session;
        var userInfo = session.userDetails,
            client_id = userInfo.ddo_client_id,
            org_id = userInfo.ddo_org_id,
            reqBody = req.body,
            ddo_jobapplication_id = reqBody.ddo_jobapplication_id,
            ddo_employeereferral_id = reqBody.ddo_employeereferral_id;

        console.log("iiddd", ddo_jobapplication_id);

        if (ddo_jobapplication_id) {
            var conditions = "ddo_org_id = " + org_id + " AND ddo_client_id = " + client_id + "AND ddo_jobapplication_id = " + ddo_jobapplication_id;
            var ddoJobTable = tables["ddo_jobapplication"];

            var jobInterviewTable = tables["ddo_jobapplicationinterview"];
            var intvwCondition = conditions = "ddo_org_id = " + org_id + " AND ddo_client_id = " + client_id + "AND ddo_jobapplication_id = " + ddo_jobapplication_id;
            var jobAppDeleteQuery = "DELETE  FROM " + ddoJobTable + " WHERE " + conditions;
            var jobInterviewDeleteQuery = "DELETE  FROM " + jobInterviewTable + " WHERE " + intvwCondition;

            console.log("Job Delete Query : ", jobAppDeleteQuery);
            jobapplicationsmodel.transactionLogicfordelete(req, res, jobAppDeleteQuery, jobInterviewDeleteQuery);

        } else {
            var conditions = "ddo_org_id = " + org_id + " AND ddo_client_id = " + client_id + "AND ddo_employeereferral_id = " + ddo_employeereferral_id;
            var ddoJobRefTable = tables["ddo_employeereferral"];
            var jobRefDeleteQuery = "DELETE  FROM " + ddoJobRefTable + " WHERE " + conditions;

            db.nonSelectQuery(jobRefDeleteQuery, [], function (err, record) {
                if (err) {
                    condition
                    console.log('error in deleting the  Job ref', err);
                    return res.status(500).json({ success: false, data: err, message: "Failed to delete the record." });
                } else {
                    return res.json({ success: true, message: "Successfully Job ref is deleted." });
                }
            });
        }
    },
    jobapplicationsmodel.transactionLogicfordelete = function (req, res, jobAppDeleteQuery, jobInterviewDeleteQuery) {
        db.connect(function (err, client, done) {
            if (err) {
                console.log("err in database connection", err);
                return res.status(500).json({
                    success: false,
                    data: err,
                    message: "Failed to connect to DB!"
                });

            } else {
                var tx = new Transaction(client);

                tx.begin();

                //Initializing an object
                var obj = {};

                obj['tx'] = tx;

                obj['res'] = res;

                obj['done'] = done;

                obj['client'] = client;

                obj['savepoint'] = 'jobApplication';

                tx.savepoint(obj['savepoint']);

                db.nonSelectQuery(jobAppDeleteQuery, [], client, function (err, appData) {
                    console.log("ref", jobAppDeleteQuery);
                    if (err) {
                        console.log("Error while deleting Job app!!", err);
                        Util.rollbackFn(obj, err, 'Fail to Delete Job app!!');
                    }else{

                        db.nonSelectQuery(jobInterviewDeleteQuery, [], client, function (err, intvwData) {
                            if (err) {

                                console.log("Error while deleting Job App!!", err);
                                Util.rollbackFn(obj, err, 'Fail to delete Job Interview!!');
                            }
                            console.log(appData);
                            Util.commitFn(obj, "Successfully job App is deleted!");
                        })

                        var message = "Successfully Job App is deleted!";
                    }

                });
            }
        });
    },
    jobapplicationsmodel.updateJobApplication = function (obj, session, req, res) {

        var userInfo = session.userDetails;
        var ddoJobAppTable = tables["ddo_jobapplication"];
        var ddoJobEmpRefTable = tables["ddo_employeereferral"];

        var reqObj = {};
        console.log("oooo", obj);
        console.log("fff", userInfo);
        if (obj.ddo_jobapplication_id) {
            console.log("iiii", userInfo);
            reqObj = {
                table: ddoJobAppTable,
                key: "ddo_jobapplication_id",
                id: obj.ddo_jobapplication_id,
                ddo_org_id: userInfo.ddo_org_id,
                ddo_client_id: userInfo.ddo_client_id,
                ddo_employee_id: userInfo.ddo_employee_id
            }
        } else {
            reqObj = {
                table: ddoJobEmpRefTable,
                key: "ddo_employeereferral_id",
                id: obj.ddo_employeereferral_id,
                ddo_org_id: userInfo.ddo_org_id,
                ddo_client_id: userInfo.ddo_client_id,
                ddo_employee_id: userInfo.ddo_employee_id
            }
        }

        master.updateOperationalData(obj, reqObj, res);
    },
    jobapplicationsmodel.getJobHiringSource = function (req, res) {
        console.log("Fetching Job hiring Data");

        /*Fetching data from session*/
        var session = req.session;
        var userInfo = session.userDetails;
        var ddo_client_id = userInfo.ddo_client_id;
        var ddo_org_id = userInfo.ddo_org_id;

        /*Table name*/
        var ddoJobHiringTable = tables["ddo_jobhiringsource"];

        /*columns for table*/
        var condition = "isactive = 'Y' AND DDO_Client_ID = " + ddo_client_id + " AND DDO_Org_ID = " + ddo_org_id;

        /*select query*/
        var jobJobHiringSelectQuery = "SELECT ddo_jobhiringsource_id,name FROM " + ddoJobHiringTable + " WHERE " + condition;
        //console.log("get dataaaaaa",jobRolesSelectQuery);
        /*query execution*/
        db.selectQuery(jobJobHiringSelectQuery, [], function (err, joblist) {
            if (err) {
                console.log("err in get API of Job Roles", err);
                return res.status(500).json({
                    success: false,
                    data: err
                });
            } else {
                return res.json({
                    success: true,
                    totalCount: joblist.length,
                    data: joblist
                });
            }
        });
    },
    jobapplicationsmodel.getJobApplicationById = function (req, res) {
        console.log("Fetching Job App Data");

        /*Fetching data from session*/
        var session = req.session;
        var userInfo = session.userDetails;
        var ddo_client_id = userInfo.ddo_client_id;
        var ddo_org_id = userInfo.ddo_org_id;
        var ddo_employee_id = userInfo.ddo_employee_id;
        var reqBody = req.query;

        console.log('reqqqq', reqBody);
        var ddo_jobapplication_id = reqBody.ddo_jobapplication_id;
        var ddo_employeereferral_id = reqBody.ddo_employeereferral_id;


        /*Table name*/
        var ddoJobAppTable = tables["ddo_jobapplication"];
        var ddoEmpRefTable = tables["ddo_employeereferral"];
        var ddoEmployeeTable = tables["ddoemp"];

        console.log("appid", reqBody.ddo_jobapplication_id);

        if (reqBody.ddo_jobapplication_id) {
            var condition = "ddo_jobapp.isactive = 'Y' AND ddo_jobapp.DDO_Client_ID = " + ddo_client_id + " AND ddo_jobapp.DDO_Org_ID = " + ddo_org_id + " AND ddo_jobapp.ddo_jobapplication_id =" + ddo_jobapplication_id;
            /*select query*/
            var jobAppbyIdSelectQuery = "SELECT ddo_jobapp.updated as jobupdateddate,ddo_jobeducation.name as education,ddo_jobapplicationstatus.name as appstatus,ddo_skills.name as skill_name, *,(select array_agg(skills.name) as skillnames from ddo_skills skills where skills.ddo_skills_id IN (select unnest(string_to_array(ddo_job_app.app_skills,',',''))::int from ddo_jobapplication ddo_job_app where ddo_job_app.ddo_jobapplication_id = ddo_jobapp.ddo_jobapplication_id )) FROM "
                + ddoJobAppTable
                + " ddo_jobapp LEFT JOIN "
                + " ddo_jobeducation ON ddo_jobeducation.ddo_jobeducation_id = ddo_jobapp.ddo_jobeducation_id "
                + " LEFT JOIN "
                + " ddo_jobopening ON ddo_jobopening.ddo_jobopening_id = ddo_jobapp.ddo_jobopening_id"
                + " LEFT JOIN "
                + " ddo_jobapplicationstatus ON ddo_jobapplicationstatus.ddo_jobapplicationstatus_id = ddo_jobapp.ddo_jobapplicationstatus_id"
                + " LEFT JOIN "
                + " ddo_jobapplicationinterview ON ddo_jobapplicationinterview.ddo_jobapplication_id = ddo_jobapp.ddo_jobapplication_id"
                + " LEFT JOIN "
                + " ddo_jobhiringsource ON ddo_jobhiringsource.ddo_jobhiringsource_id = ddo_jobapp.ddo_jobhiringsource_id"
                + " WHERE "
                + condition;

        } else {

            var condition = "ddo_empref.isactive = 'Y' AND ddo_empref.DDO_Client_ID = " + ddo_client_id + " AND ddo_empref.DDO_Org_ID = " + ddo_org_id + " AND ddo_employeereferral_id =" + ddo_employeereferral_id;
            /*select query*/
            var jobAppbyIdSelectQuery = "SELECT ddo_empref.updated as jobupdateddate,ddo_emp.firstname as referername, * FROM "
                + ddoEmpRefTable
                + " ddo_empref LEFT JOIN "
                + ddoEmployeeTable
                + " ddo_emp ON ddo_empref.referred_by = ddo_emp.ddo_employee_id "
                + " WHERE "
                + condition;
        }

        console.log("jobapppp ", jobAppbyIdSelectQuery);
        /*query execution*/
        db.selectQuery(jobAppbyIdSelectQuery, [], function (err, joblist) {
            if (err) {
                console.log("err in get API of Job Openings", err);
                return res.status(500).json({
                    success: false,
                    data: err
                });
            } else {
                return res.json({
                    success: true,
                    totalCount: joblist.length,
                    data: joblist
                });
            }
        });
    },
    jobapplicationsmodel.getJobEducation = function (req, res) {
        console.log("Fetching Job Education Data");

        /*Fetching data from session*/
        var session = req.session;
        var userInfo = session.userDetails;
        var ddo_client_id = userInfo.ddo_client_id;
        var ddo_org_id = userInfo.ddo_org_id;

        /*Table name*/
        var ddoJobEducationTable = tables["ddo_jobeducation"];

        /*columns for table*/
        var condition = "isactive = 'Y' AND DDO_Client_ID = " + ddo_client_id + " AND DDO_Org_ID = " + ddo_org_id;

        /*select query*/
        var jobJobEducationSelectQuery = "SELECT ddo_jobeducation_id,name FROM " + ddoJobEducationTable + " WHERE " + condition;
        //console.log("get dataaaaaa",jobRolesSelectQuery);
        /*query execution*/
        db.selectQuery(jobJobEducationSelectQuery, [], function (err, joblist) {
            if (err) {
                console.log("err in get API of Job Roles", err);
                return res.status(500).json({
                    success: false,
                    data: err
                });
            } else {
                return res.json({
                    success: true,
                    totalCount: joblist.length,
                    data: joblist
                });
            }
        });
    },
    // jobapplicationsmodel.updateResumePath = function(session, req, res) {
    //     //console.log(startcolor('updateResumePath in jobapplicationsmodel!'));

    //     //logged user details
    //     var userInfo = session.userDetails;

    //     var ddo_client_id = userInfo.ddo_client_id;
    //     var ddo_org_id = userInfo.ddo_org_id;

    //     //Input parameters
    //     var resumePath = req.file.path;
    //     var ddo_jobapplication_id = req.body.ddo_jobapplication_id;

    //     var ddoJobAppTable = tables["ddo_jobapplication"];

    //     var conditions = "isactive='Y' and ddo_client_id=" + ddo_client_id + " and ddo_org_id=" + ddo_org_id + " and ddo_jobapplication_id=" + ddo_jobapplication_id;
    //     var updateQuery = "update " + ddoJobAppTable + " set resumepath='" + resumePath + "' where " + conditions;
    //     console.log(fetchcolor('updateQuery: '), updateQuery);

    //     db.nonSelectQuery(updateQuery, [], function(err, data) {
    //         if (err) {
    //             return res.json({ success: false, data: err, message: 'Failed to update url path!' });
    //         } else {
    //             return res.json({ success: true, data: data, message: 'Successfully updated the record' });
    //         }
    //     });
    // };

    jobapplicationsmodel.getAppDetailsByMobileNo=function(obj,req, res){   
       var session = req.session;
       var userInfo = session.userInfo;
       var client_id = userInfo.ddo_client_id;
       var org_id = userInfo.ddo_org_id;

        var ddoJobAppTable = tables["ddo_jobapplication"];
 
         var condition =  "mobile = '"+ obj.mobile + "ddo_client_id = " + client_id + "ddo_org_id = " + org_id ;        
 
         var jobAppbyMobileSelectQuery= "SELECT mobile,emailId,firstName,lastName,ddo_jobapplication_id FROM " + ddoJobAppTable + " WHERE " + condition;
         console.log("Mobile No verification Query",jobAppbyMobileSelectQuery);
 
           db.selectQuery(jobAppbyMobileSelectQuery,[], function (err, joblist) {
             if (err || joblist.length == 0) {
                 console.log("err in get API of Job Applications", err);
                 return res.status(500).json({
                     success: false,
                     data: err
                 });
             } else {
                 return res.json({
                     success: true,
                     totalCount: joblist.length,
                     data: joblist
                 });
             }
         });
 
     },
   jobapplicationsmodel.getIdDetails=function(req, res){
       /*Fetching data from session*/
        var reqBody = req.body;
        var session = req.session;
        var userInfo = session.userDetails;
        var ddo_client_id = userInfo.ddo_client_id;
        var ddo_org_id = userInfo.ddo_org_id;
        var reqBody = req.query;

        console.log(reqBody);
        var ddo_jobidentificationtype_id =reqBody.ddo_jobidentificationtype_id;
        var identification_num = reqBody.identification_num;



        var ddoJobAppTable = tables["ddo_jobapplication"];

        var condition = "DDO_Client_ID = " + ddo_client_id + " AND DDO_Org_ID = " + ddo_org_id + " AND mobile = '"+identification_num + "'";
        // " AND identification_num = '" + identification_num + "' AND ddo_jobidentificationtype_id = " + ddo_jobidentificationtype_id;


        var jobAppbyIdSelectQuery= "SELECT * FROM " + ddoJobAppTable + " WHERE " + condition;
        console.log("ID verification Query",jobAppbyIdSelectQuery);

          db.selectQuery(jobAppbyIdSelectQuery,[], function (err, joblist) {
            if (err || joblist.length == 0) {
                console.log("err in get API of Job Openings", err);
                return res.status(500).json({
                    success: false,
                    data: err
                });
            } else {
                return res.json({
                    success: true,
                    totalCount: joblist.length,
                    data: joblist
                });
            }
        });

    }

    jobapplicationsmodel.uploadResume = function (req, res) {
        console.log('uploadResume in jobapplicationsmodel!');
        console.log("tttest", req);
        var resumePath = req.file.path;
        return res.json({ success: true, data: resumePath });
    };
module.exports = jobapplicationsmodel;

