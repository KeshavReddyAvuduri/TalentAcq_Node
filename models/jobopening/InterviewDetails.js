var interviewdetailsrequestmodel = {};
var Q = require("q");

var db = require("../../helpers/db/Postgres.js");
var tables = require("../../helpers/Tables.json");

var Transaction = require('pg-transaction');
var Util = require('../../helpers/Util.js');
var Transaction = require('pg-transaction');
var master = require('./');


interviewdetailsrequestmodel.insertJobInterviewDetailsData = function (req, res) {   
    var obj = {};
    /*fetching data from session*/
    var session = req.session;
    var userInfo = session.userDetails;

    var ddo_client_id = userInfo.ddo_client_id;
    var ddo_org_id = userInfo.ddo_org_id;
    var ddo_employee_id = userInfo.ddo_employee_id;
    var reqBody = req.body;   
    //var ddo_jobapplicationinterview_id = reqBody.ddo_jobapplicationinterview_id;
    var ddo_jobapplication_id = reqBody.ddo_jobapplication_id;
    var ddo_jobinterviewstatus_id = reqBody.ddo_jobinterviewstatus_id;
    var ddo_jobinterviewrating_id = reqBody.ddo_interviewrating_id || null;
    obj.interviewer_id = reqBody.interviewer_id;
    obj.interviewtype = reqBody.interviewtype;
    obj.interviewmode = reqBody.interviewmode;
    obj.interviewdate = reqBody.interviewdate;
    obj.interviewtime = reqBody.interviewtime;
    obj.feedback = reqBody.feedback ? "'"+reqBody.feedback+"'" : null;
    obj.isactive = reqBody.isactive || 'Y';
    console.log("interviewwwww",reqBody);
    console.log("req query",req.query);

    var createdby = userInfo.ddo_employee_id,
        updatedby = userInfo.ddo_employee_id;

    /*table name*/
    var ddoInterviewTable = tables["ddo_jobapplicationinterview"];

    /*columns for query*/
    var ddoJobInterviewColumns = "ddo_client_id,ddo_org_id,ddo_jobapplication_id,ddo_jobinterviewstatus_id,ddo_interviewrating_id,createdby,updatedby,isactive,interviewer_id,interviewtype,interviewdate,interviewtime,feedback,interviewmode";
    /*values for query*/
    var values = "(" + ddo_client_id + "," + ddo_org_id + "," + ddo_jobapplication_id + "," + ddo_jobinterviewstatus_id + ","+ ddo_jobinterviewrating_id+ "," + createdby + "," + updatedby + ",'"  + obj.isactive + "'," + obj.interviewer_id + ",'" + obj.interviewtype + "','" + obj.interviewdate + "','" + obj.interviewtime + "'," + obj.feedback + ",'"+ obj.interviewmode+"')";
    /*query to insert data in ddo_jobopening*/
    var ddoJobInterviewDetailsInsertQuery = "INSERT INTO " + ddoInterviewTable + " (" + ddoJobInterviewColumns + ") VALUES " + values;
    
    console.log("innnnnn",ddoJobInterviewDetailsInsertQuery);
    db.selectQuery(ddoJobInterviewDetailsInsertQuery, [], function (err, data) {
        if (err) {
            console.log("err in insert Job Interview Details", err);
            return res.status(500).json({ success: false, data: err, message: 'Failed to create Job Interview record!' });
        } else {
            return res.json({ success: true, message: "Successfully Interview Details is created" });
        }
    });
},

interviewdetailsrequestmodel.getJobInterviewDetails = function (req, res) {   
    var obj = {};
    /*fetching data from session*/
    var session = req.session;
    var userInfo = session.userDetails;

    var ddo_client_id = userInfo.ddo_client_id;
    var ddo_org_id = userInfo.ddo_org_id;
    var ddo_employee_id = userInfo.ddo_employee_id;
    var reqBody = req.query;   
    var ddo_jobapplicationinterview_id = reqBody.ddo_jobapplicationinterview_id;
    console.log("interviewwwww",reqBody);
    console.log("req query",req.query);

    var createdby = userInfo.ddo_employee_id,
        updatedby = userInfo.ddo_employee_id;

    /*table name*/
    var ddoInterviewTable = tables["ddo_jobapplicationinterview"];
    var ddoEmployeeTable = tables["ddoemp"];

    /*columns for query*/
    var condition = "ddo_emp.isactive = 'Y' AND ddo_emp.DDO_Client_ID = " + ddo_client_id + " AND ddo_emp.DDO_Org_ID = " + ddo_org_id;

     /*select query*/
     var jobInterviewDetailsSelectQuery = "SELECT  ddo_emp.firstname as interviewrname,ddo_interviewrating.imagepath as ratingimgpath, ddo_interviewrating.name as ratingname,ddo_jobinterviewstatus.name as intvwstatusname,ddo_jobinterview.* from "
     + ddoInterviewTable
     + " ddo_jobinterview LEFT JOIN "
     + ddoEmployeeTable
     + " ddo_emp ON ddo_emp.ddo_employee_id = ddo_jobinterview.interviewer_id "
     + " LEFT JOIN "
     + " ddo_interviewrating ON ddo_interviewrating.ddo_interviewrating_id = ddo_jobinterview.ddo_interviewrating_id "
     + " LEFT JOIN "
     + " ddo_jobinterviewstatus ON ddo_jobinterviewstatus.ddo_jobinterviewstatus_id = ddo_jobinterview.ddo_jobinterviewstatus_id "
     + " WHERE " 
     + condition;
    console.log("jobInterviewDetailsSelectQuery ",jobInterviewDetailsSelectQuery);
    /*query execution*/
    db.selectQuery(jobInterviewDetailsSelectQuery, [], function(err, joblist) {
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
interviewdetailsrequestmodel.updateInterviewDetails = function (obj, session, req, res) { 
    var userInfo = session.userDetails;
    var ddoJobInterviewTable = tables["ddo_jobapplicationinterview"];

    var reqObj = {};
  
    reqObj = {
        table: ddoJobInterviewTable,
        key:"ddo_jobapplicationinterview_id",
        id:obj.ddo_jobapplicationinterview_id,
        ddo_org_id: userInfo.ddo_org_id,
        ddo_client_id:userInfo.ddo_client_id,
        ddo_employee_id:userInfo.ddo_employee_id
    }
    console.log('rbb',reqObj);
    master.updateOperationalData(obj, reqObj, res);
},

interviewdetailsrequestmodel.interviewStatusUpdate = function (req, res) { 
    console.log("Updating into update job App status in JobModel");

    var obj = {};
    /*fetching data from session*/
    var session = req.session;

    /*Fetching data from session*/
    var userInfo = session.userDetails;
    var ddo_client_id = userInfo.ddo_client_id;
    var ddo_org_id = userInfo.ddo_org_id;
    var reqBody =req.body;
 
    var ddo_employee_id = userInfo.ddo_employee_id;
    var ddo_jobapplicationinterview_id = reqBody.ddo_jobapplicationinterview_id;
    obj.isactive = reqBody.isactive || 'Y';

   console.log(reqBody);
    /*table name*/
    var ddoJobAppInterviewTable = tables["ddo_jobapplicationinterview"];
    var ddoJobAppStatusTable = tables["ddo_jobinterviewstatus"];

    var ddo_jobinterviewstatus_id	 = "SELECT ddo_jobinterviewstatus_id FROM " +ddoJobAppStatusTable + " WHERE name ='Interview Cancelled'";


    /*query condition*/
    var condition = " ddo_jobappinterview.isactive = 'Y' AND ddo_jobapplicationinterview_id = " + ddo_jobapplicationinterview_id + " AND ddo_jobappinterview.ddo_client_id = " + ddo_client_id + " AND ddo_jobappinterview.ddo_org_id = " + ddo_org_id;

    /*query for update*/
    var jobAppStatusUpdateQuery = "UPDATE " 
    + ddoJobAppInterviewTable + " ddo_jobappinterview" 
    + " SET ddo_jobinterviewstatus_id = ("
    + ddo_jobinterviewstatus_id 
    + ") " 
    + ",updated = now()" 
    +" FROM "
    + ddoJobAppStatusTable
    + " WHERE "
    + condition;

    console.log("status queryyy",jobAppStatusUpdateQuery);
    db.nonSelectQuery(jobAppStatusUpdateQuery, [], function (err, data) {
        if (err) {
            console.log("err in update Job App Status", err);
            return res.status(500).json({ success: false, data: err, message: 'Failed to update Job App status record!' });
        } else {
            return res.json({ success: true, message: "Successfully JobApp status is Updated" });
        }
    }); 
},
interviewdetailsrequestmodel.interviewStatusDetails = function (req, res) {   
    var obj = {};
    /*fetching data from session*/
    var session = req.session;
    var userInfo = session.userDetails;

    var ddo_client_id = userInfo.ddo_client_id;
    var ddo_org_id = userInfo.ddo_org_id;
    var ddo_employee_id = userInfo.ddo_employee_id;
    var reqBody = req.query;

    /*Table name*/
    var ddoJobInterviewStatusTable = tables["ddo_jobinterviewstatus"];

    /*columns for table*/
    var condition = "isactive = 'Y' AND DDO_Client_ID = " + ddo_client_id + " AND DDO_Org_ID = " + ddo_org_id;

    /*select query*/
    var jobInterviewStatusQuery = "SELECT ddo_jobinterviewstatus_id,name FROM " + ddoJobInterviewStatusTable + " WHERE " + condition;
    console.log("get dataaaaaa",jobInterviewStatusQuery);
    /*query execution*/
    db.selectQuery(jobInterviewStatusQuery, [], function(err, jobintvwlist) {
        if (err) {
            console.log("err in get API of Job Interview status", err);
            return res.status(500).json({
                success: false,
                data: err
            });
        } else {
            return res.json({
                success: true,
                totalCount: jobintvwlist.length,
                data: jobintvwlist
            });
        }
    });
},
interviewdetailsrequestmodel.applicationStatusDetails = function (req, res) {   
    var obj = {};
    /*fetching data from session*/
    var session = req.session;
    var userInfo = session.userDetails;

    var ddo_client_id = userInfo.ddo_client_id;
    var ddo_org_id = userInfo.ddo_org_id;
    var ddo_employee_id = userInfo.ddo_employee_id;
    var reqBody = req.query;

    /*Table name*/
    var ddoJobAppStatusTable = tables["ddo_jobapplicationstatus"];

    /*columns for table*/
    var condition = "isactive = 'Y' AND DDO_Client_ID = " + ddo_client_id + " AND DDO_Org_ID = " + ddo_org_id;

    /*select query*/
    var jobAppStatusQuery = "SELECT ddo_jobapplicationstatus_id,name FROM " + ddoJobAppStatusTable + " WHERE " + condition;
    console.log("get dataaaaaa",jobAppStatusQuery);
    /*query execution*/
    db.selectQuery(jobAppStatusQuery, [], function(err, jobapplist) {
        if (err) {
            console.log("err in get API of Job Interview status", err);
            return res.status(500).json({
                success: false,
                data: err
            });
        } else {
            return res.json({
                success: true,
                totalCount: jobapplist.length,
                data: jobapplist
            });
        }
    });
},
interviewdetailsrequestmodel.getInterviewRating = function (req, res) {   
    var obj = {};
    /*fetching data from session*/
    var session = req.session;
    var userInfo = session.userDetails;

    var ddo_client_id = userInfo.ddo_client_id;
    var ddo_org_id = userInfo.ddo_org_id;
    var ddo_employee_id = userInfo.ddo_employee_id;
    var reqBody = req.query;

    /*Table name*/
    var ddoJobInterviewRatingTable = tables["ddo_interviewrating"];

    /*columns for table*/
    var condition = "isactive = 'Y' AND DDO_Client_ID = " + ddo_client_id + " AND DDO_Org_ID = " + ddo_org_id;

    /*select query*/
    var jobInterviewRatingQuery = "SELECT ddo_interviewrating_id,name FROM " + ddoJobInterviewRatingTable + " WHERE " + condition;
    console.log("get rating data",jobInterviewRatingQuery);
    /*query execution*/
    db.selectQuery(jobInterviewRatingQuery, [], function(err, jobintvwlist) {
        if (err) {
            console.log("err in get API of Job Interview status", err);
            return res.status(500).json({
                success: false,
                data: err
            });
        } else {
            return res.json({
                success: true,
                totalCount: jobintvwlist.length,
                data: jobintvwlist
            });
        }
    });
},
interviewdetailsrequestmodel.interviewRequestDetails = function (req, res) {   
    var obj = {};
    /*fetching data from session*/
    var session = req.session;
    var userInfo = session.userDetails;

    var ddo_client_id = userInfo.ddo_client_id;
    var ddo_org_id = userInfo.ddo_org_id;
    var ddo_employee_id = userInfo.ddo_employee_id;
    var reqBody = req.query;   
    var ddo_jobapplicationinterview_id = reqBody.ddo_jobapplicationinterview_id;
    var loginuser_id = reqBody.loginuser_id;
    console.log("interviewwwww",reqBody);
    console.log("req query",req.query);

    var createdby = userInfo.ddo_employee_id,
        updatedby = userInfo.ddo_employee_id;

    /*table name*/
    var ddoInterviewTable = tables["ddo_jobapplicationinterview"];
    var ddoEmployeeTable = tables["ddoemp"];

    /*columns for query*/
    var condition = "ddo_emp.isactive = 'Y' AND ddo_emp.DDO_Client_ID = " + ddo_client_id + " AND ddo_emp.DDO_Org_ID = " + ddo_org_id + " AND ddo_jobinterview.interviewer_id = " + loginuser_id;

     /*select query*/
     var interviewDetailsSelectQuery = "SELECT  ja.firstname as jobapplicantname,ja.workexpyears,ja.workexpmonths,ja.currentjobtitle,(select array_agg(skills.name) as skillnames from ddo_skills skills where skills.ddo_skills_id IN (select unnest(string_to_array(ddo_job_app.app_skills,',',''))::int from ddo_jobapplication ddo_job_app where ddo_job_app.ddo_jobapplication_id = ja.ddo_jobapplication_id )),ja.currentlocation,ddo_emp.firstname as interviewrname,ddo_interviewrating.imagepath as ratingimgpath, ddo_interviewrating.name as ratingname,ddo_jobinterviewstatus.name as intvwstatusname,* from "
     + ddoInterviewTable
     + " ddo_jobinterview LEFT JOIN "
     + ddoEmployeeTable
     + " ddo_emp ON ddo_emp.ddo_employee_id = ddo_jobinterview.interviewer_id "
     + " LEFT JOIN "
     + " ddo_interviewrating ON ddo_interviewrating.ddo_interviewrating_id = ddo_jobinterview.ddo_interviewrating_id "
     + " LEFT JOIN "
     + " ddo_jobinterviewstatus ON ddo_jobinterviewstatus.ddo_jobinterviewstatus_id = ddo_jobinterview.ddo_jobinterviewstatus_id "
     + " LEFT JOIN "
     + " ddo_jobapplication ja ON ja.ddo_jobapplication_id = ddo_jobinterview.ddo_jobapplication_id "
     + " WHERE " 
     + condition;
    console.log("interviewDetailsSelectQuery ",interviewDetailsSelectQuery);
    /*query execution*/
    db.selectQuery(interviewDetailsSelectQuery, [], function(err, joblist) {
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
interviewdetailsrequestmodel.deleteInterviewRequest = function (req, res) {
    console.log("deleteInterviewRequest in JobOpeningRequestModel");
    var session = req.session;
    var userInfo = session.userDetails,
        client_id = userInfo.ddo_client_id,
        org_id = userInfo.ddo_org_id,
        reqBody = req.body,
        ddo_jobapplicationinterview_id = reqBody.ddo_jobapplicationinterview_id;
        

    var ddoJobInterviewTable = tables["ddo_jobapplicationinterview"];
    var conditions = "ddo_org_id = " + org_id + " AND ddo_client_id = " + client_id + "AND ddo_jobapplicationinterview_id = " + ddo_jobapplicationinterview_id;
    var jobInterviewDeleteQuery = "DELETE  FROM " + ddoJobInterviewTable + " WHERE " + conditions;

    console.log("Job Delete Query : ", jobInterviewDeleteQuery);

    db.nonSelectQuery(jobInterviewDeleteQuery, [], function (err, record) {
        if (err) {
            console.log('error in deleting the  Job Interview Request', err);
            return res.status(500).json({ success: false, data: err, message: "Failed to delete the record." });
        } else {
            return res.json({ success: true, message: "Successfully Job Interview is deleted." });
        }
    });
},
interviewdetailsrequestmodel.getInterviewPanelMembers = function (req, res) {   
    var obj = {};
    /*fetching data from session*/
    var session = req.session;
    var userInfo = session.userDetails;

    var ddo_client_id = userInfo.ddo_client_id;
    var ddo_org_id = userInfo.ddo_org_id;
    var ddo_employee_id = userInfo.ddo_employee_id;

    var reqBody = req.query;
    var ddo_jobopening_id = reqBody.ddo_jobopening_id;

    /*Table name*/
    var ddoJobOpeningTable = tables["ddo_jobopening"];

    /*columns for table*/
    var condition = "isactive = 'Y' AND DDO_Client_ID = " + ddo_client_id + " AND DDO_Org_ID = " + ddo_org_id;

    /*select query*/
    var jobInterviewPanelQuery = "select distinct ddo_emp.ddo_employee_id as empid,CONCAT(ddo_emp.firstname, ' ', ddo_emp.lastname) as empname, ddo_emp.pposition from "
    + " (select firstname,lastname, ddo_employee_id, '1' as pposition from ddo_employee where ddo_employee_id in (select unnest(string_to_array(ddo_job_i.interviewers_ids,',',''))::int "
    + " FROM ddo_jobopening ddo_job_i WHERE ddo_job_i.ddo_jobopening_id = " + ddo_jobopening_id + "AND " + condition + " ) union (select firstname, lastname,ddo_employee_id, '2' as pposition from ddo_employee)) ddo_emp"
    + " order by pposition, ddo_employee_id,empname ";
    
    console.log("get Interview Panel data",jobInterviewPanelQuery);
    /*query execution*/
    db.selectQuery(jobInterviewPanelQuery, [], function(err, jobintvwpanellist) {
        if (err) {
            console.log("err in get API of Job Interview Panel Members", err);
            return res.status(500).json({
                success: false,
                data: err
            });
        } else {
            return res.json({
                success: true,
                totalCount: jobintvwpanellist.length,
                data: jobintvwpanellist
            });
        }
    });
},
module.exports = interviewdetailsrequestmodel;
