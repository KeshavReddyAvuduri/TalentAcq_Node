var Q = require("q");

var db = require("../../helpers/db/Postgres.js");

var Util = require("../../helpers/Util.js");

/*For error or success or anything else response color*/
var chalk = require('chalk');

/*for error response color*/
var error = chalk.red;

/*for success response color*/
var response = chalk.green;

/*for query/no data/extra purpose color*/
var fetchcolor = chalk.blue;

/*for query/no data/extra purpose color*/
var startcolor = chalk.yellow;

//For query console identity
var querycolor = chalk.magenta;

//The Lodash library exported as Node.js modules.
// Load method categories. 
var object = require('lodash/fp/object');

var masterOperations = {} ;

masterOperations.getRecord = function(req, res){

    if(Array.isArray(req.id)){

        var primaryValues = req.id.join(',');
    }else{
        
        var primaryValues = req.id
    }

	var condition = "isactive = 'Y' AND DDO_Client_ID=$1 AND DDO_Org_ID=$2";

    var query = "SELECT name,description,"+ primaryValues +" FROM " + req.table + " WHERE " + condition +" ORDER BY updated DESC ";

    db.selectQuery(query, [req.ddo_client_id, req.ddo_org_id], function(err, data) {
        if (err) {

            return res.status(500).json({success: false, data: err, message: 'Failed to get records!'});
        } else {

            return res.json({success: true, totalCount: data.length, data: data});
        }
    });
};


masterOperations.insertRecord = function(req, res){

	if(req.name && req.desc){
        req.desc = masterOperations.escapeMe(req.desc);
        req.name = masterOperations.escapeMe(req.name);
        var columns = "name, description, ddo_client_id, ddo_org_id, createdby, updatedby";
        var values = "('" + req.name + "','" + req.desc + "'," + req.ddo_client_id + "," + req.ddo_org_id + ","+ req.ddo_employee_id +","+ req.ddo_employee_id +")";
    }else if(req.name){
        req.name = masterOperations.escapeMe(req.name);
        var columns = "name, ddo_client_id, ddo_org_id, createdby, updatedby";
        var values = "('" + req.name + "'," + req.ddo_client_id + "," + req.ddo_org_id + ","+ req.ddo_employee_id +","+ req.ddo_employee_id +")";
    }else{

        return res.status(500).json({success: false, data: null, message: 'Missing required data!'});
    }
    
    var query = "INSERT INTO " + req.table + " (" + columns + ") VALUES " + values;

    db.selectQuery(query, [], function(err, data) {
        if (err) {
            
            return res.status(500).json({success: false, data: err, message: 'Failed to create record!'});
        } else {

            return res.json({success: true, message: "Successfully record is created"});
        }
    });
};

masterOperations.updateRecord = function(req, res){

	if(!req.id){
        return res.status(500).json({success: false, data: null, message: 'Missing required data!'});
    }
	var condition = "isactive = 'Y' AND "+req.key+"=$1 AND ddo_client_id=$2 AND ddo_org_id=$3";

    if(req.name && req.desc){
        req.name = masterOperations.escapeMe(req.name);
        req.desc = masterOperations.escapeMe(req.desc);
        var query = "UPDATE " + req.table + " SET name = '" + req.name + "',description = '" + req.desc + "',updated = '" + Util.getCurrentDateAndTime() + "', updatedby = " + req.ddo_employee_id + " WHERE " + condition;
    }else if(!req.name && req.desc){
        req.desc = masterOperations.escapeMe(req.desc);
        var query = "UPDATE " + req.table + " SET description = '" + req.desc + "',updated = '" + Util.getCurrentDateAndTime() + "', updatedby = " + req.ddo_employee_id + " WHERE " + condition;
    }else if(req.name && !req.desc){
        req.name = masterOperations.escapeMe(req.name);
        var query = "UPDATE " + req.table + " SET name = '" + req.name +"',updated = '" + Util.getCurrentDateAndTime() + "', updatedby = " + req.ddo_employee_id + " WHERE " + condition;
    }else{
        
        return res.status(500).json({success: false, data: null, message: 'Nothing you are updating!'});
    }

    db.selectQuery(query, [req.id, req.ddo_client_id, req.ddo_org_id], function(err, data) {
        if (err) {
            
            return res.status(500).json({success: false, data: err, message: 'Failed to update record!'});
        } else {

            return res.json({success: true, message: "Successfully record is updated!"});
        }
    });
};

masterOperations.deleteRecord = function(req, res){

	if(!req.id){

        return res.status(500).json({success: false, data: null, message: 'Missing required data!'});
    }

    var condition = req.key+"=$1 AND ddo_client_id=$2 AND ddo_org_id=$3 AND isreference <> 'Y'";
    
    var jobapplicationstatusDeleteQuery = "DELETE FROM " + req.table + " WHERE " + condition;

    db.selectQuery(jobapplicationstatusDeleteQuery, [req.id, req.ddo_client_id, req.ddo_org_id], function(err, data) {
        if (err) {
            
            return res.status(500).json({success: false, data: err, message: 'Failed to delete record!'});
        } else {
            return res.json({success: true, message: "Successfully record is deleted!"});
        }
    });
};


masterOperations.getOperationalData = function(outputFields, joinTables, req, res){

    var joins = ' ';

    var joinFields = ' ';

    for (var i = 0; i < joinTables.length; i++) {

        joinFields += joinTables[i]+".name as "+joinTables[i]+"_name, "

        joins += " left join " + joinTables[i] + " on " +
            req.table+"."+joinTables[i]+"_id = "+ joinTables[i] +"."+joinTables[i]+"_id AND "+
            joinTables[i]+".isactive='Y' AND "+req.table+".ddo_org_id = "+joinTables[i]+".ddo_org_id "
    }

    var selectFields = Object.keys(outputFields);

    var selectFieldsStr = ' ';
    
    for (var i = 0; i < selectFields.length; i++) {
        
        if(selectFields[i] == "intervieweename"){

            selectFieldsStr += " (SELECT CONCAT(ddo_jobapplications.firstname,' ',ddo_jobapplications.lastname) as intervieweename  FROM ddo_jobapplications WHERE "+req.table+".ddo_jobapplications_id = ddo_jobapplications.ddo_jobapplications_id), "
        
        }else{

            selectFieldsStr += req.table +"."+selectFields[i]+", "
        }

        if(selectFields[i] == "recruitedby" || selectFields[i] == "referredby" || selectFields[i] == "intervieweremployeeid"){

            joinFields += "CONCAT("+selectFields[i]+"_employee.firstname,' ',"+selectFields[i]+"_employee.lastname) "+selectFields[i]+"_name, "
            joins += " left join ddo_employee "+selectFields[i]+"_employee on " +
                req.table+"."+selectFields[i]+" = "+selectFields[i]+"_employee.ddo_employee_id AND " +
                selectFields[i]+"_employee.isactive='Y' AND "+req.table+".ddo_org_id = "+selectFields[i]+"_employee.ddo_org_id "
        }
    }
    var unwantedStrIndex = joinFields.lastIndexOf(',');

    var finalJoinFields = joinFields.substr(" ", unwantedStrIndex)

    var condition = req.table+".isactive = 'Y' AND "+req.table+".DDO_Client_ID=$1 AND "+req.table+".DDO_Org_ID=$2 ";

    var query = "SELECT "+ selectFieldsStr + finalJoinFields +" FROM " + req.table +' '+ joins + " WHERE " + condition +" ORDER BY "+req.table+".updated DESC ";
    
    db.selectQuery(query, [req.ddo_client_id, req.ddo_org_id], function(err, data) {
        if (err) {

            return res.status(500).json({success: false, data: err, message: 'Failed to get records!'});
        } else {

            return res.json({success: true, totalCount: data.length, data: data});
        }
    });
};

masterOperations.insertOperationalData = function(outputFields, req, res){

    for (var key in outputFields) {
        
        outputFields[key] = masterOperations.escapeMe(outputFields[key]);
        
        if(outputFields[key] == ""){
        ///(outputFields[key] == "") ? outputFields[key] = null : console.log(" #### ");
            delete outputFields[key]
        }
    }
    var valuesList =  object.values(outputFields);

    // for(var index=0; index < valuesList.length; index++){
    //     if (typeof valuesList[index] == "string" ){
    //         valuesList[index] = "'"+valuesList[index]+"'";
    //     }
    // }
    valuesList = valuesList.map(function(item,index){
        if (typeof item == "string" ){
            item = "'"+item+"'";
        }
        return item;
    });

    var query = "INSERT INTO " + req.table + " (" + Object.keys(outputFields).join(',') + ", ddo_client_id,ddo_org_id,createdby,updatedby) VALUES (" + valuesList.join(',')+","+req.ddo_client_id+","+req.ddo_org_id+","+req.ddo_employee_id+","+req.ddo_employee_id+")";
    console.log(query);
    db.selectQuery(query, [], function(err, data) {
        if (err) {
            
            return res.status(500).json({success: false, data: err, message: 'Failed to create record!'});
        } else {

            return res.json({success: true, message: "Successfully record is created"});
        }
    });
};

masterOperations.updateOperationalData = function(outputFields, req, res){


    console.log("qqq",req);
     console.log("jjjj",outputFields);
    //   console.log(req.table);
     var obj=outputFields;
    // if(obj.ddo_jobopening_id){
    //     obj.ddo_jobopeningstatus_id=2;
    //     obj.description = obj.job_desc
    //     delete obj.job_desc;
    // }
   
    console.log("dddd",req);
    if(!req.id){

        return res.status(500).json({success: false, data: null, message: 'Missing required data!'});
    }

    var updateKeys = Object.keys(outputFields);

    var setQueryKeyValue = "";

    for (var i = 0; i < updateKeys.length; i++) {
        //if(updateKeys == "comments"){
            outputFields[updateKeys[i]] = masterOperations.escapeMe(outputFields[updateKeys[i]]);
        //}
        (outputFields[updateKeys[i]] == "") ? outputFields[updateKeys[i]] = null : console.log(" #### ");
        (typeof outputFields[updateKeys[i]] == "string") ? setQueryKeyValue += updateKeys[i]+"= '"+outputFields[updateKeys[i]]+"' ," : setQueryKeyValue += updateKeys[i]+"="+outputFields[updateKeys[i]]+","
    }

    var condition = "isactive = 'Y' AND "+req.key+"=$1 AND ddo_client_id=$2 AND ddo_org_id=$3";

    var query = "UPDATE " + req.table + " SET " + setQueryKeyValue + "updated = now(), updatedby = " + req.ddo_employee_id + " WHERE " + condition;
    console.log("uuuuuu",query);
    db.selectQuery(query, [req.id, req.ddo_client_id, req.ddo_org_id], function(err, data) {
        if (err) {
            
            return res.status(500).json({success: false, data: err, message: 'Failed to update record!'});
        } else {

            return res.json({success: true, message: "Successfully record is updated!"});
        }
    });
};

masterOperations.getDataByID = function(req, res) {

    if(!req.id){

        return res.status(400).json({success: false, data: null, message: 'Bad Request'});
    }

    //condition passing to query 
    var condition = "isactive = 'Y' AND ddo_client_id=$1 AND ddo_org_id=$2 AND "+ req.key +"=$3";

    //select query to fetch data from table
    var query = "SELECT * FROM " + req.table + " WHERE " + condition;

    // query execution
    db.selectQuery(query, [req.ddo_client_id, req.ddo_org_id, req.id], function(err, data) {
        if (err) {

            return res.status(500).json({success: false, data: err, message: 'Failed to get record!'});
            
        } else {

            return res.json({success: true, data: data, totalCount: data.length});
        }
    });
};

masterOperations.getOperationalDataByID = function(outputFields, joinTables, req, res){

    var joins = ' ';

    var joinFields = ' ';

    for (var i = 0; i < joinTables.length; i++) {

        joinFields += joinTables[i]+".name as "+joinTables[i]+"_name, "

        joins += " left join " + joinTables[i] + " on " +
            req.table+"."+joinTables[i]+"_id = "+ joinTables[i] +"."+joinTables[i]+"_id AND "+
            joinTables[i]+".isactive='Y' AND "+req.table+".ddo_org_id = "+joinTables[i]+".ddo_org_id "
    }

    var selectFields = Object.keys(outputFields);

    var selectFieldsStr = ' ';
    
    for (var i = 0; i < selectFields.length; i++) {

        selectFieldsStr += req.table +"."+selectFields[i]+", "

        if(selectFields[i] == "recruitedby" || selectFields[i] == "referredby" || selectFields[i] == "intervieweremployeeid"){

            joinFields += "CONCAT("+selectFields[i]+"_employee.firstname,' ',"+selectFields[i]+"_employee.lastname) "+selectFields[i]+"_name, "
            joins += " left join ddo_employee "+selectFields[i]+"_employee on " +
                req.table+"."+selectFields[i]+" = "+selectFields[i]+"_employee.ddo_employee_id AND " +
                selectFields[i]+"_employee.isactive='Y' AND "+req.table+".ddo_org_id = "+selectFields[i]+"_employee.ddo_org_id "
        }
    }
    var unwantedStrIndex = joinFields.lastIndexOf(',');

    var finalJoinFields = joinFields.substr(" ", unwantedStrIndex)

    var condition = req.table+".isactive = 'Y' AND "+req.table+".DDO_Client_ID=$1 AND "+req.table+".DDO_Org_ID=$2 AND "+ req.table+"."+req.key +"=$3";

    var query = "SELECT "+ selectFieldsStr + finalJoinFields +" FROM " + req.table +' '+ joins + " WHERE " + condition ;
    
    db.selectQuery(query, [req.ddo_client_id, req.ddo_org_id, req.id], function(err, data) {
        if (err) {

            return res.status(500).json({success: false, data: err, message: 'Failed to get records!'});
        } else {

            return res.json({success: true, totalCount: data.length, data: data});
        }
    });
};

masterOperations.escapeMe = function(value){
    if(typeof value == "string" ){
         value = value.replace(/'/g, "''");
         return value;
    }else{
        return value;
    }
};

module.exports = masterOperations;