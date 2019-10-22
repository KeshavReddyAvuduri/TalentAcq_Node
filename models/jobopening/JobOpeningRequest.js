var jobopeningrequestmodel = {};
var Q = require("q");

var db = require("../../helpers/db/Postgres.js");
var tables = require("../../helpers/Tables.json");

var Transaction = require('pg-transaction');
var Util = require('../../helpers/Util.js');
var Transaction = require('pg-transaction');
var master = require('./');


jobopeningrequestmodel.insertJobOpeningsData = function (req, res) {
    var obj = {};
    /*fetching data from session*/
    var session = req.session;
    var userInfo = session.userDetails;

    var ddo_client_id = userInfo.ddo_client_id;
    var ddo_org_id = userInfo.ddo_org_id;
    var ddo_employee_id = userInfo.ddo_employee_id;
    var reqBody = req.body;
    var ddo_jobopening_id = reqBody.ddo_jobopening_id;
    var ddo_joblocation_id = reqBody.ddo_joblocation_id;
    var ddo_jobopeningstatus_id = reqBody.ddo_jobopeningstatus_id;
    var ddo_projects_clients_id = reqBody.ddo_projects_clients_id;
    obj.title = reqBody.title;
    obj.description = reqBody.description;
    obj.noofpositions = reqBody.noofpositions;
    obj.isactive = reqBody.isactive || 'Y';
    obj.minworkexperience = reqBody.minworkexperience;
    obj.maxworkexperience = reqBody.maxworkexperience;
    obj.minsalary = reqBody.minsalary || 0;
    obj.maxsalary = reqBody.maxsalary || 0;
    obj.skill_ids = reqBody.skill_ids;
    obj.interviewers_ids = reqBody.interviewers_ids;
    obj.closuredate = reqBody.closuredate;
    obj.work_on_priority = reqBody.work_on_priority || 'N';
    var ddo_department_id = reqBody.ddo_department_id || null ;
    var recruiter_id = reqBody.recruiter_id || '';


    var createdby = userInfo.ddo_employee_id,
        updatedby = userInfo.ddo_employee_id;

    /*table name*/
    var ddoJobOpeningTable = tables["ddo_jobopening"];

    if (obj.description.indexOf("'") > -1) {
        obj.description = obj.description.replace(/'/g, "''");
    } else if (obj.description.indexOf("/'") > -1) {
        obj.description = obj.description.replace("/'", "//'");
    }

    /*columns for query*/
    var ddoJobOpeningColumns = "ddo_client_id,ddo_org_id,ddo_department_id,ddo_joblocation_id,ddo_jobopeningstatus_id,createdby,updatedby,isactive,title,description,noofpositions,closuredate,minsalary,maxsalary,work_on_priority,minworkexperience,maxworkexperience,skill_ids,interviewers_ids,recruiter_id,ddo_projects_clients_id";
    /*values for query*/
    var values = "(" + ddo_client_id + "," + ddo_org_id + "," + ddo_department_id + "," + ddo_joblocation_id + "," + ddo_jobopeningstatus_id + "," + createdby + "," + updatedby + ",'" + obj.isactive + "','" + obj.title + "','" + obj.description + "'," + obj.noofpositions + ",'" + obj.closuredate + "','" + obj.minsalary + "','" + obj.maxsalary + "','" + obj.work_on_priority + "'," + obj.minworkexperience + "," + obj.maxworkexperience + ",'" + obj.skill_ids + "','" + obj.interviewers_ids + "','" + recruiter_id + "',"+ ddo_projects_clients_id +")";
    /*query to insert data in ddo_jobopening*/
    var ddoJobOpeningInsertQuery = "INSERT INTO " + ddoJobOpeningTable + " (" + ddoJobOpeningColumns + ") VALUES " + values;

    console.log("innnnnn", ddoJobOpeningInsertQuery);
    db.selectQuery(ddoJobOpeningInsertQuery, [], function (err, data) {
        if (err) {
            console.log("err in insert Job Opening", err);
            return res.status(500).json({ success: false, data: err, message: 'Failed to create Job Opening record!' });
        } else {
            return res.json({ success: true, message: "Successfully JobOpening is created" });
        }
    });
},

    jobopeningrequestmodel.getJobOpeningsDataById = function (req, res) {
        console.log("Fetching Job Data");

        /*Fetching data from session*/
        var session = req.session;
        var userInfo = session.userDetails;
        var ddo_client_id = userInfo.ddo_client_id;
        var ddo_org_id = userInfo.ddo_org_id;
        var ddo_employee_id = userInfo.ddo_employee_id;
        var reqBody = req.query;

        console.log('reqqqq', reqBody);
        //var ddo_jobopening_id = reqBody.ddo_jobopening_id;
        var recruiter_id = reqBody.recruiter_id;

        /*Table name*/
        var ddoJobOpeningTable = tables["ddo_jobopening"];
        var ddoEmployeeTable = tables["ddoemp"];

        /*columns for table*/
        var condition = "ddo_emp.isactive = 'Y' AND ddo_emp.DDO_Client_ID = " + ddo_client_id + " AND ddo_emp.DDO_Org_ID = " + ddo_org_id + " AND jo.recruiter_id =" + recruiter_id ;

        /*select query*/
        var jobOpeningsbyIdSelectQuery = "SELECT jo.updated as jobupdateddate,(select array_agg(skills.name) as skillnames from ddo_skills skills where skills.ddo_skills_id IN   (select unnest(string_to_array(ddo_job_i.skill_ids,',',''))::int FROM ddo_jobopening ddo_job_i where ddo_job_i.ddo_jobopening_id = jo.ddo_jobopening_id )),(select array_agg(emp.firstname) as interviewersnames "
        + " FROM ddo_employee emp WHERE emp.ddo_employee_id IN (select unnest(string_to_array(ddo_job_i.interviewers_ids,',',''))::int FROM ddo_jobopening ddo_job_i WHERE ddo_job_i.ddo_jobopening_id = jo.ddo_jobopening_id )),"
        + " ddo_jobopeningstatus.name as job_status_name, "
        + " ddo_emp.firstname, jo.description as job_desc,ddo_department.name as department_name, "
        + " jo.ddo_jobopening_id, jl.name as location_name,"
        + " jo.*, count(ja.ddo_jobopening_id), (select count(ja1.ddo_jobapplication_id) from ddo_jobapplication ja1  left join ddo_jobapplicationstatus djs  on djs.ddo_jobapplicationstatus_id = ja1.ddo_jobapplicationstatus_id  where jo.ddo_jobopening_id = ja1.ddo_jobopening_id and name = 'Candidate Joined' ) as count_status  from ddo_jobopening jo "
        + " LEFT JOIN ddo_jobapplication ja on jo.ddo_jobopening_id = ja.ddo_jobopening_id "
        + " LEFT JOIN "
        + " ddo_department ON ddo_department.ddo_department_id = jo.ddo_department_id "
        + " LEFT JOIN "
        + " ddo_joblocation jl ON jl.ddo_joblocation_id = jo.ddo_joblocation_id "
        + " LEFT JOIN "
        + " ddo_jobopeningstatus ON ddo_jobopeningstatus.ddo_jobopeningstatus_id = jo.ddo_jobopeningstatus_id "
        + " LEFT JOIN "
        + " ddo_employee ddo_emp ON jo.createdby = ddo_emp.ddo_employee_id WHERE "
        + condition 
        + "  group by ddo_department.name, jo.ddo_jobopening_id, jl.name, ddo_emp.firstname, ddo_jobopeningstatus.name ";
       

        console.log("get data byyyyyy id", jobOpeningsbyIdSelectQuery);
        /*query execution*/
        db.selectQuery(jobOpeningsbyIdSelectQuery, [], function (err, joblist) {
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

    jobopeningrequestmodel.getJobOpeningsData = function (req, res) {
        console.log("Fetching Job Data");

        /*Fetching data from session*/
        var session = req.session;
        var userInfo = session.userDetails;
        var ddo_client_id = userInfo.ddo_client_id;
        var ddo_org_id = userInfo.ddo_org_id;
        var ddo_employee_id = userInfo.ddo_employee_id;
        var reqBody = req.query;
        var ddo_jobopening_id = reqBody.ddo_jobopening_id;

        console.log("reqqqq", reqBody);
        /*Table name*/
        var ddoJobOpeningTable = tables["ddo_jobopening"];
        var ddoEmployeeTable = tables["ddoemp"];

        /*columns for table*/
        var condition = "ddo_emp.isactive = 'Y' AND ddo_emp.DDO_Client_ID = " + ddo_client_id + " AND ddo_emp.DDO_Org_ID = " + ddo_org_id;

        // var jobOpeningsSelectQuery = "SELECT ddo_job.updated as jobupdateddate,ddo_department.name as department_name,ddo_job.description as job_desc,ddo_emp.firstname,ddo_jobopeningstatus.name as job_status_name,ddo_joblocation.name as location_name,*,(select array_agg(skills.name) as skillnames from ddo_skills skills where skills.ddo_skills_id IN (select unnest(string_to_array(ddo_job_i.skill_ids,',',''))::int FROM "
        //  + ddoJobOpeningTable
        //  + " ddo_job_i where ddo_job_i.ddo_jobopening_id = ddo_job.ddo_jobopening_id )), (select array_agg(emp.firstname) as interviewersnames FROM ddo_employee emp WHERE emp.ddo_employee_id IN (select unnest(string_to_array(ddo_job_i.interviewers_ids,',',''))::int FROM ddo_jobopening ddo_job_i WHERE ddo_job_i.ddo_jobopening_id = ddo_job.ddo_jobopening_id )) FROM ddo_jobopening ddo_job "
        //  + " LEFT JOIN "
        //  + " ddo_department ON ddo_department.ddo_department_id = ddo_job.ddo_department_id "
        //  + " LEFT JOIN "
        //  + " ddo_joblocation ON ddo_joblocation.ddo_joblocation_id = ddo_job.ddo_joblocation_id "
        //  + " LEFT JOIN "
        //  + " ddo_jobopeningstatus ON ddo_jobopeningstatus.ddo_jobopeningstatus_id = ddo_job.ddo_jobopeningstatus_id "
        //  + " LEFT JOIN "
        //  + ddoEmployeeTable
        //  + " ddo_emp ON ddo_job.createdby = ddo_emp.ddo_employee_id AND "
        //  + condition;
        var jobOpeningsSelectQuery = "SELECT jo.updated as jobupdateddate,(select array_agg(skills.name) as skillnames from ddo_skills skills where skills.ddo_skills_id IN   (select unnest(string_to_array(ddo_job_i.skill_ids,',',''))::int FROM ddo_jobopening ddo_job_i where ddo_job_i.ddo_jobopening_id = jo.ddo_jobopening_id )),(select array_agg(emp.firstname) as recruiters  " 
        + " FROM ddo_employee emp WHERE emp.ddo_employee_id IN (select unnest(string_to_array(COALESCE(ddo_job_i.recruiter_id,'0'),',',''))::int FROM ddo_jobopening ddo_job_i WHERE ddo_job_i.ddo_jobopening_id = jo.ddo_jobopening_id )),(select array_agg(emp.firstname) as interviewersnames  "
            + " FROM ddo_employee emp WHERE emp.ddo_employee_id IN (select unnest(string_to_array(ddo_job_i.interviewers_ids,',',''))::int FROM ddo_jobopening ddo_job_i WHERE ddo_job_i.ddo_jobopening_id = jo.ddo_jobopening_id )),"
            + " ddo_jobopeningstatus.name as job_status_name, "
            + " ddo_projects_clients.name as project_client_name, "
            + " ddo_emp.firstname, jo.description as job_desc,ddo_department.name as department_name, "
            + " jo.ddo_jobopening_id, jl.name as location_name,"
            + " jo.*, count(ja.ddo_jobopening_id), (select count(ja1.ddo_jobapplication_id) from ddo_jobapplication ja1  left join ddo_jobapplicationstatus djs  on djs.ddo_jobapplicationstatus_id = ja1.ddo_jobapplicationstatus_id  where jo.ddo_jobopening_id = ja1.ddo_jobopening_id and name = 'Candidate Joined' ) as count_status  from ddo_jobopening jo "
            + " LEFT JOIN ddo_jobapplication ja on jo.ddo_jobopening_id = ja.ddo_jobopening_id "
            + " LEFT JOIN "
            + " ddo_department ON ddo_department.ddo_department_id = jo.ddo_department_id "
            + " LEFT JOIN "
            + " ddo_joblocation jl ON jl.ddo_joblocation_id = jo.ddo_joblocation_id "
            + " LEFT JOIN "
            + " ddo_jobopeningstatus ON ddo_jobopeningstatus.ddo_jobopeningstatus_id = jo.ddo_jobopeningstatus_id "
            + " LEFT JOIN "
            + " ddo_projects_clients ON ddo_projects_clients.ddo_projects_clients_id = jo.ddo_projects_clients_id "
            + " LEFT JOIN "
            + " ddo_employee ddo_emp ON jo.createdby = ddo_emp.ddo_employee_id"
            + "  group by ddo_department.name, jo.ddo_jobopening_id, jl.name, ddo_emp.firstname, ddo_jobopeningstatus.name, ddo_projects_clients.name, "
            + condition 
            + " ORDER BY CASE WHEN jo.recruiter_id = '" +ddo_employee_id + "' THEN 1 ELSE jo.ddo_jobopening_id END  ";

        console.log("jobOpeningsSelectQuery ", jobOpeningsSelectQuery);
        /*query execution*/
        db.selectQuery(jobOpeningsSelectQuery, [], function (err, joblist) {
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
    jobopeningrequestmodel.updateJobOpening = function (obj, session, req, res) {

        var userInfo = session.userDetails;
        var ddoJobOpeningTable = tables["ddo_jobopening"];

        var reqObj = {};
    

        if(obj.work_on_priority == "true"){
            obj.work_on_priority = 'Y'
        }
        if(obj.skill_ids){
            var skills = obj.skill_ids;
            obj.skill_ids = skills.toString();
        }
        if(obj.interviewers_ids){
            var interviewers = obj.interviewers_ids;
            obj.interviewers_ids = interviewers.toString();
        }
        if(obj.recruiter_id){
            var recruiter_id = obj.recruiter_id;
            obj.recruiter_id = recruiter_id.toString();
        }
        console.log("sss",obj);
            //obj.ddo_jobopeningstatus_id = 2;
            obj.description = obj.job_desc ||obj.description;
            delete obj.job_desc;
       
        reqObj = {
            table: ddoJobOpeningTable,
            key: "ddo_jobopening_id",
            id: obj.ddo_jobopening_id,
            ddo_org_id: userInfo.ddo_org_id,
            ddo_client_id: userInfo.ddo_client_id,
            ddo_employee_id: userInfo.ddo_employee_id
        }

        master.updateOperationalData(obj, reqObj, res);


        // console.log("Entering into updateJobOpening in JobModel");

        // var obj = {};
        // /*fetching data from session*/
        // var session = req.session;

        // /*Fetching data from session*/
        // var userInfo = session.userDetails;
        // var ddo_client_id = userInfo.ddo_client_id;
        // var ddo_org_id = userInfo.ddo_org_id;
        // var reqBody =req.body;

        // var ddo_employee_id = userInfo.ddo_employee_id;
        // obj.ddo_jobopening_id = reqBody.ddo_jobopening_id;
        // obj.ddo_joblocation_id = reqBody.ddo_joblocation_id || null;
        // obj.ddo_jobopeningstatus_id = reqBody.ddo_jobopeningstatus_id || null;
        // obj.title = reqBody.title || null;
        // obj.description = reqBody.job_desc || null;
        // obj.noofpositions = reqBody.noofpositions || null;
        // obj.isactive = reqBody.isactive || 'Y';
        // obj.minworkexperience = reqBody.minworkexperience || null;
        // obj.maxworkexperience = reqBody.maxworkexperience || null;
        // obj.skill_ids = reqBody.skill_ids || null;
        // obj.interviewers_ids = reqBody.interviewers_ids || null;

        // var ddo_department_id = reqBody.ddo_department_id || null;

        // console.log('uuuuuuu',reqBody.job_desc);
        // if (obj.description.indexOf("'") > -1) {
        //     console.log(obj.description);
        //     obj.description = obj.description.replace(/'/g, "''");
        // } else if (obj.description.indexOf("/'") > -1) {
        //     obj.description = obj.description.replace("/'", "//'");
        // }

        /*table name*/
        // var ddoJobOpeningTable = tables["ddo_jobopening"];

        /*query condition*/
        //var condition = "isactive = 'Y' AND ddo_jobopening_id = " + obj.ddo_jobopening_id + " AND ddo_client_id = " + ddo_client_id + " AND ddo_org_id = " + ddo_org_id;

        /*query for update*/
        // var jobOpeningUpdateQuery = "UPDATE "
        // + ddoJobOpeningTable
        // + " SET ddo_joblocation_id = '" + obj.ddo_joblocation_id
        // + "',ddo_jobopeningstatus_id = '" + obj.ddo_jobopeningstatus_id
        // + "',minworkexperience = '" + obj.minworkexperience
        // + "',maxworkexperience = '" + obj.maxworkexperience
        // + "',title = '" + obj.title
        // + "',description = '" + obj.description
        // + "',noofpositions = '" + obj.noofpositions
        // + "',isactive = '" + obj.isactive
        // + "',skill_ids ='"+obj.skill_ids
        // +"',interviewers_ids='"+obj.interviewers_ids
        // +"',updatedby = " + ddo_employee_id
        // + ",ddo_department_id = " + ddo_department_id
        // + ",updated = now()"
        // + " WHERE " + condition;
        // console.log("updateeeee queryyy",jobOpeningUpdateQuery);
        // db.nonSelectQuery(jobOpeningUpdateQuery, [], function (err, data) {
        //     if (err) {
        //         console.log("err in update Job Opening", err);
        //         return res.status(500).json({ success: false, data: err, message: 'Failed to update Job Opening record!' });
        //     } else {
        //         return res.json({ success: true, message: "Successfully JobOpening is Updated" });
        //     }
        // });
    };
jobopeningrequestmodel.updateJobStatus = function (req, res) {

    console.log("Updating into updateJobOpening job status in JobModel");

    var obj = {};
    /*fetching data from session*/
    var session = req.session;

    /*Fetching data from session*/
    var userInfo = session.userDetails;
    var ddo_client_id = userInfo.ddo_client_id;
    var ddo_org_id = userInfo.ddo_org_id;
    var reqBody = req.body;

    var ddo_employee_id = userInfo.ddo_employee_id;
    var ddo_jobopening_id = reqBody.ddo_jobopening_id;
    obj.status = reqBody.status;
    obj.isactive = reqBody.isactive || 'Y';
    console.log('dd',reqBody);

    /*table name*/
    var ddoJobOpeningTable = tables["ddo_jobopening"];
    var ddoJobStatusTable = tables["ddo_jobopeningstatus"];

    var ddo_jobopeningstatus_id = "SELECT ddo_jobopeningstatus_id FROM " + ddoJobStatusTable + " WHERE name = '" + obj.status +"'";


    /*query condition*/
    var condition = " ddo_jobopening.isactive = 'Y' AND ddo_jobopening_id = " + ddo_jobopening_id + " AND ddo_jobopening.ddo_client_id = " + ddo_client_id + " AND ddo_jobopening.ddo_org_id = " + ddo_org_id;

    /*query for update*/
    var jobStatusUpdateQuery = "UPDATE "
        + ddoJobOpeningTable + " ddo_jobopening"
        + " SET ddo_jobopeningstatus_id = ("
        + ddo_jobopeningstatus_id
        + ") "
        + ",updated = now()"
        + " FROM "
        + ddoJobStatusTable
        + " WHERE "
        + condition;

    console.log("status queryyy", jobStatusUpdateQuery);
    db.nonSelectQuery(jobStatusUpdateQuery, [], function (err, data) {
        if (err) {
            console.log("err in update Job Status", err);
            return res.status(500).json({ success: false, data: err, message: 'Failed to update Job Opening status record!' });
        } else {
            return res.json({ success: true, message: "Successfully JobOpening status is Updated" });
        }
    });
};
jobopeningrequestmodel.deleteJobOpening = function (req, res) {
    console.log("deleteJobOpening in JobOpeningRequestModel");
    var session = req.session;
    var userInfo = session.userDetails,
        client_id = userInfo.ddo_client_id,
        org_id = userInfo.ddo_org_id,
        reqBody = req.body,
        ddo_jobopening_id = reqBody.ddo_jobopening_id,
        ddo_jobopeningstatus_id  = reqBody.ddo_jobopeningstatus_id;

        

    var ddoJobOpeningTable = tables["ddo_jobopening"];
    var conditions = "ddo_org_id = " + org_id + " AND ddo_client_id = " + client_id + "AND ddo_jobopening_id = " + ddo_jobopening_id;
    var jobOpeningDeleteQuery = "DELETE  FROM " + ddoJobOpeningTable + " WHERE " + conditions;

    //  console.log("Job Delete Query : ", jobOpeningDeleteQuery);

    db.nonSelectQuery(jobOpeningDeleteQuery, [], function (err, record) {
        if (err) {
            console.log('error in deleting the  Job Opening', err);
            return res.status(500).json({ success: false, data: err, message: "Failed to delete the record." });
        } else {
            return res.json({ success: true, message: "Successfully Job Opening is deleted." });
        }
    });
},

    jobopeningrequestmodel.getJobStatusData = function (req, res) {
        console.log("Fetching Job status Data");

        /*Fetching data from session*/
        var session = req.session;
        var userInfo = session.userDetails;
        var ddo_client_id = 11;
        var ddo_org_id = 1000001;


        /*Table name*/
        var ddoJobStatusTable = tables["ddo_jobopeningstatus"];

        /*columns for table*/
        var condition = "isactive = 'Y' AND DDO_Client_ID = " + ddo_client_id + " AND DDO_Org_ID = " + ddo_org_id;

        /*select query*/
        var jobStatusSelectQuery = "SELECT ddo_jobopeningstatus_id,name FROM " + ddoJobStatusTable + " WHERE " + condition;
        // console.log("get data",jobStatusSelectQuery);
        /*query execution*/
        db.selectQuery(jobStatusSelectQuery, [], function (err, joblist) {
            if (err) {
                console.log("err in get API of Job status", err);
                return res.status(500).json({
                    success: false,
                    data: err
                });
            } else {
                joblist.push({
                    name: 'All',
                    ddo_jobopeningstatus_id: joblist.length + 1
                });
                console.log('liiiii', joblist);
                return res.json({
                    success: true,
                    totalCount: joblist.length,
                    data: joblist
                });
            }
        });
    },
    jobopeningrequestmodel.getLocationData = function (req, res) {
        console.log("Fetching Job status Data");

        /*Fetching data from session*/
        var session = req.session;
        var userInfo = session.userDetails;
        var ddo_client_id = userInfo.ddo_client_id;
        var ddo_org_id = userInfo.ddo_org_id;

        /*Table name*/
        var ddoJobLocationTable = tables["ddo_joblocation"];

        /*columns for table*/
        var condition = "isactive = 'Y' AND DDO_Client_ID = " + ddo_client_id + " AND DDO_Org_ID = " + ddo_org_id;

        /*select query*/
        var jobLocationSelectQuery = "SELECT ddo_joblocation_id,name FROM " + ddoJobLocationTable + " WHERE " + condition;
        console.log("get dataaaaaa", jobLocationSelectQuery);
        /*query execution*/
        db.selectQuery(jobLocationSelectQuery, [], function (err, joblist) {
            if (err) {
                console.log("err in get API of Job status", err);
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
    jobopeningrequestmodel.getJobRoles = function (req, res) {
        console.log("Fetching Job Roles Data");

        /*Fetching data from session*/
        var session = req.session;
        var userInfo = session.userDetails;
        var ddo_client_id = userInfo.ddo_client_id;
        var ddo_org_id = userInfo.ddo_org_id;

        /*Table name*/
        var ddoJobRolesTable = tables["ddorole"];

        /*columns for table*/
        var condition = "isactive = 'Y' AND DDO_Client_ID = " + ddo_client_id + " AND DDO_Org_ID = " + ddo_org_id;

        /*select query*/
        var jobRolesSelectQuery = "SELECT ddo_role_id,name FROM " + ddoJobRolesTable + " WHERE " + condition;
        //console.log("get dataaaaaa",jobRolesSelectQuery);
        /*query execution*/
        db.selectQuery(jobRolesSelectQuery, [], function (err, joblist) {
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
    jobopeningrequestmodel.getRecruitersList = function (req, res) {
        console.log("Fetching Job Data");

        var obj = {};
        /*Fetching data from session*/
        var session = req.session;
        var userInfo = session.userDetails;
        var ddo_client_id = userInfo.ddo_client_id;
        var ddo_org_id = userInfo.ddo_org_id;
        var ddo_employee_id = userInfo.ddo_employee_id;
        var reqBody = req.query;
        var ddo_jobopening_id = reqBody.ddo_jobopening_id;


        /*Table name*/
        var ddoRoleTable = tables["ddorole"];
        var ddoUserRoleTable = tables["ddouserrole"];
        var ddoUserTable = tables["ddouser"];
        var ddoEmployeeTable = tables["ddoemp"];

        /*columns for table*/
        var condition = "ddo_employee.isactive = 'Y' AND ddo_userrole.isactive = 'Y' AND ddo_employee.DDO_Client_ID = " + ddo_client_id + " AND ddo_employee.DDO_Org_ID = " + ddo_org_id + " AND name = 'Recruiter'";

        /*select query*/
        var jobRecruitersSelectQuery = "SELECT "
            + "ddo_role.ddo_role_id,"
            + "ddo_userrole.ddo_user_id,"
            + "ddo_user.ddo_employee_id,"
            + "ddo_employee.firstname "
            + "FROM " + ddoRoleTable + " ddo_role"
            + " LEFT JOIN " + ddoUserRoleTable + " ddo_userrole ON (ddo_userrole.ddo_role_id = ddo_role.ddo_role_id)"
            + " LEFT JOIN " + ddoUserTable + " ddo_user ON (ddo_user.ddo_user_id = ddo_userrole.ddo_user_id) "
            + " LEFT JOIN " + ddoEmployeeTable + " ddo_employee ON (ddo_employee.ddo_Employee_id = ddo_user.ddo_employee_id) "
            + "WHERE " + condition;

        console.log("get recruiterss", jobRecruitersSelectQuery);
        /*query execution*/
        db.selectQuery(jobRecruitersSelectQuery, [], function (err, joblist) {
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
    module.exports = jobopeningrequestmodel;
