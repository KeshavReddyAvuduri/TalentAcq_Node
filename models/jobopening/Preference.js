var preferenceModel = {};

var db = require("../../helpers/db/Postgres.js");

var tables = require("../../helpers/Tables.json");

preferenceModel.getPreferenceDetails = function( req, res ){
		console.log("GET PREFERENCE DETAILS Models");
        var columns = "ddo_preference_id as id, name, tablename", userInfo = req.session.userDetails;
       // var condition= `isactive = 'Y' AND ddo_client_id = ${userInfo.ddo_client_id} AND ddo_org_id = ${userInfo.ddo_org_id}`;
       //updated this condition  because preference table is using as shared table  for the  @multi-tenant feature //
        var condition= `isactive = 'Y'`;
		var query = `SELECT ${columns} FROM ddo_preference where ${condition}`;
        var query = `SELECT ${columns} FROM ddo_preference`;
        console.log(query);
		db.selectQuery( query , [], function ( err, data ) {
            if (err) {
                console.log("Error in getting preference details", err);
                return res.status(500).json({
                    success: false,
                    data: err
                });
            } else {
            	return res.json({
                    success: true,
                    totalCount: data.length,
                    data: data
                });
            }
        });
};

preferenceModel.getPreferenceData = function( req, res ){
        console.log("GET PREFERENCE Data Model", req.body);
        var tablename = req.query.tablename;
        if( !tablename ){
            return res.status(400).json({ success: false, data:{ message: 'Insufficient query parameters required tablename' }});
        }
        var columns = `${tablename}_id as id, name, description`;
        // var condition= `isactive = 'Y' AND ddo_client_id = ${userInfo.ddo_client_id} AND ddo_org_id = ${userInfo.ddo_org_id}`;        
        var condition= `isactive = 'Y' AND ddo_client_id = 11 AND ddo_org_id = 1000001`;
        var query = `SELECT ${columns} FROM ${tablename} WHERE ${condition}` ;
                db.selectQuery( query , [], function ( err, data ) {
                    if (err) {
                        console.log("Error in getting preference data details", err);
                        return res.status(500).json({     success: false,     data: err });
                    } else {
                        console.log("Successfully completed", data);
                        return res.json({    success: true,     totalCount: data.length,     data: data });
                    }
                });
};

preferenceModel.createPreferenceData = function( req, res ){
        console.log("Create PREFERENCE Data Model");
        var obj = {};
    /*fetching data from session*/
        var userInfo = req.session.userDetails;
        var reqBody = req.body;
        //console.log("uuuuu", userInfo);
        obj.createdby = userInfo.ddo_employee_id,
        obj.updatedby = userInfo.ddo_employee_id;
        obj.ddo_client_id = userInfo.ddo_client_id;
        obj.ddo_org_id = userInfo.ddo_org_id;
        // obj.createdby = 1001498;
        // obj.updatedby = 1001498;
        // obj.ddo_client_id = 11;
        // obj.ddo_org_id = 1000001;
        obj.name = reqBody.name;
        obj.description = reqBody.description;
        obj.isActive = reqBody.isActive || 'Y';
        if( !( reqBody.tablename && reqBody.name ) ){
            // console.log(reqBody.tablename, reqBody.name , reqBody.description)
            return res.status(400).json({ success: false, data:{ message: 'Insufficient data required tablename,name' }});
        }
        var columns, values;

        columns = "(ddo_client_id,ddo_org_id,createdby,updatedby,isactive,name,description)";

        values = `( ${obj.ddo_client_id},${obj.ddo_org_id},${obj.createdby},${obj.updatedby},'${obj.isActive}','${obj.name}','${obj.description}')`;

        var query = `INSERT INTO ${reqBody.tablename} ${columns} VALUES  ${values}` ;
        
        db.nonSelectQuery( query , [], function ( err, data ) {
            if (err) {
                console.log("Error in creating preference data details", err,query);
                return res.status(500).json({
                    success: false,
                    data: err
                });
            } else {
                console.log("Successfully completed", data);
                return res.json({
                    success: true,
                    totalCount: data.length,
                    data: data
                });
            }
        });
};

preferenceModel.updatePreferenceData = function( req, res ){
        console.log("Update PREFERENCE Data Model");

        var reqBody = req.body, userInfo = req.session.userDetails;
        var updatedName = reqBody.updatedName, updatedDesc = reqBody.updatedDesc, id = reqBody.id;
        updatedName = updatedName ? updatedName : reqBody.name,updatedDesc = updatedDesc ? updatedDesc : reqBody.description;
        var org_id = userInfo.ddo_org_id, client_id = userInfo.ddo_client_id, recname = reqBody.name, updatedby=userInfo.ddo_employee_id;
        if( !(reqBody.tablename && reqBody.name && id) ){
            // console.log(reqBody.tablename ,reqBody.name, reqBody.description , id);
            return res.status(400).json({ success: false, data:{ message: 'Insufficient data required tablename,name,id' }});
        }
        condition = `ddo_org_id = ${org_id} AND ddo_client_id = ${client_id} AND ${reqBody.tablename}_id = ${id}`;
        
        var query = `UPDATE ${reqBody.tablename} SET name='${updatedName}', description='${updatedDesc}', updated=now(), updatedby=${updatedby} WHERE ${condition}`;
                    db.nonSelectQuery( query , [], function ( err, data ) {
                        if (err) {
                            console.log("Error in updating preference data details", err, query);
                            return res.status(500).json({
                                success: false,
                                data: err
                            });
                        } else {
                            console.log("Successfully completed", data);
                            return res.json({
                                success: true,
                                totalCount: data.length,
                                data: data
                            });
                        }
                    });
};

preferenceModel.deletePreferenceData = function( req, res ){
        console.log("Delete PREFERENCE Data Model");
        var reqBody = req.body;
        var userInfo = req.session.userDetails, id = reqBody.id;
        var org_id = userInfo.ddo_org_id, client_id = userInfo.ddo_client_id, recname = reqBody.name, updatedby = userInfo.ddo_employee_id;
        if( !(reqBody.tablename && recname && id) ){
            return res.status(400).json({ success: false, data:{ message: 'Insufficient data required tablename,name,id' }});
        }
        condition = `ddo_org_id = ${org_id} AND ddo_client_id = ${client_id} AND ${reqBody.tablename}_id = ${id} AND name = '${recname}'` ;
        
        var query = `UPDATE ${reqBody.tablename} SET isactive='N', updated=now(), updatedby=${updatedby} WHERE ${condition}`;
        
        db.nonSelectQuery( query , [], function ( err, data ) {
            if (err) {
                console.log("Error in deleting preference data details", err, query);
                return res.status(500).json({ 
                    success: false,
                    data: err
                });
            } else {

                console.log("Successfully completed", data);
                return res.json({
                    success: true,
                    totalCount: data.length,
                    data: data
                });
            }
        });
};

module.exports = preferenceModel;