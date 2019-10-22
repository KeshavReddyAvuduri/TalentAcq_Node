//an object being exported
var projectTechnologies = {};
//(#pre-includes)
//db usage file like connection, query passage, etc...,
var db = require("../../helpers/db/Postgres.js");

projectTechnologies.createRecord = function (obj, res, session) {
    ("ProjectTechnology createRecord Function");
    //user session details
    var userInfo = session.userDetails;
    var ddo_client_id = userInfo.ddo_client_id;
    var ddo_org_id = userInfo.ddo_org_id;
    var cbpid = userInfo.ddo_employee_id;
    var key = "Employee_" + ddo_client_id;
    var projectId = obj.projectId;
    obj.isactive = obj.isactive || 'Y';
console.log("ooooooo",obj);
    var table = "ddo_project_technologies";
    var columns = "ddo_client_id, ddo_org_id, isactive,createdby, updatedby, ddo_project_id,name,description";
    var values = "(" +
        ddo_client_id + "," +
        ddo_org_id + ",'" +
        obj.isactive + "'," +
        cbpid + "," +
        cbpid + "," +
        obj.projectId + ",'" +
        obj.name + "','" +
        obj.description + "')";

    console.log("pid", obj.projectId);
    var projectTechnologiesInsertQuery = "INSERT INTO " + table + " (" + columns + ") VALUES " + values;
    console.log('project Technology insert query: ', projectTechnologiesInsertQuery);

    db.nonSelectQuery(projectTechnologiesInsertQuery, [], function (err, data) {
        if (err) {
            console.log("Error while inserting project Technology!!")
            return res.status(500).json({
                success: false,
                data: err,
                message: "Failed to insert the record!"
            });
        } else {
            return res.json({
                success: true,
                message: "Successfully Project Technology is created!"
            });
        }
    });
};
projectTechnologies.getRecord = function (session, projectId, res) {
    ("ProjectTechnologies getRecord Function");

    //user session details
    var userInfo = session.userDetails;
    var ddo_client_id = userInfo.ddo_client_id;
    var ddo_org_id = userInfo.ddo_org_id;

    console.log("piid", projectId);
    //Fetch query
    var table = "ddo_project_technologies"
    var condition = "isactive = 'Y' AND ddo_client_id = " + ddo_client_id + " AND ddo_org_id = " + ddo_org_id + " AND ddo_project_id = " + projectId;
    var technologiesQuery = "select * from " + table + " where " + condition;
    console.log('project Technoloy fetch query: ', technologiesQuery);;

    //Query execution
    db.selectQuery(technologiesQuery, [], function (err, products) {
        var dataArray = [];
        if (err) {
            console.log("Error while fetching project technologies!!")
            return res.status(500).json({
                success: false,
                data: err,
                message: 'Failed to fetch Project technologies!'
            });
        } else {
            return res.json({
                success: true,
                totalCount: products.length,
                data: products
            });
        }
    });
};
projectTechnologies.deleteRecord = function (session, res, technologyId) {
    ("ProjectTechnologies deleteRecord Function");

    //user session details
    var userInfo = session.userDetails;
    var ddo_client_id = userInfo.ddo_client_id;
    var ddo_org_id = userInfo.ddo_org_id;

    var cbpid = userInfo.ddo_employee_id;

    //Table representation
    var table = "ddo_project_technologies";
    var condition = "ddo_project_technology_id = " + technologyId + " AND ddo_client_id = " + ddo_client_id + " AND ddo_org_id = " + ddo_org_id;
    var technologyDeleteQuery = "DELETE FROM " + table + " WHERE " + condition;
    console.log('Project Technology delete query: ', technologyDeleteQuery);

    //Query execution
    db.selectQuery(technologyDeleteQuery, [], function (err, client, done) {
        if (err) {
            console.log("Error while deleting project technology!!")
            return res.status(500).json({
                success: false,
                data: err,
                message: "Failed to remove the technology!"
            });
        } else {
            return res.json({
                success: true,
                message: "Successfully Project technology is deleted!"
            });
        }
    });
};
projectTechnologies.getClientsDetails = function (session, projectId, res) {
    console.log("Fetching Clients Data");

    /*Fetching data from session*/    
    var userInfo = session.userDetails;
    var ddo_client_id = userInfo.ddo_client_id;
    var ddo_org_id = userInfo.ddo_org_id;


    /*Table name*/
    var table = "ddo_projects_clients";

    /*columns for table*/
    var condition = "isactive = 'Y' AND DDO_Client_ID = " + ddo_client_id + " AND DDO_Org_ID = " + ddo_org_id;

    /*select query*/
    var projectsClientsSelectQuery = "SELECT ddo_projects_clients_id,name FROM " + table + " WHERE " + condition;
    console.log("get data",projectsClientsSelectQuery);
    /*query execution*/
    db.selectQuery(projectsClientsSelectQuery, [], function (err, clientlist) {
        if (err) {
            console.log("err in get API of Projects clients", err);
            return res.status(500).json({
                success: false,
                data: err
            });
        } else {
            // joblist.push({
            //     name: 'All',
            //     ddo_jobopeningstatus_id: joblist.length + 1
            // });
            console.log('liiiii', clientlist);
            return res.json({
                success: true,
                totalCount: clientlist.length,
                data: clientlist
            });
        }

    });
};

module.exports = projectTechnologies;