//an object being exported
var skillsModel;
var Q = require("q");

skillsModel = {}

//db usage file like connection, query passage, etc...,
var db = require("../../helpers/db/Postgres.js");

//transaction for PG
var Transaction = require('pg-transaction');
var Util = require("../../helpers/Util");
var tables = require("../../helpers/Tables.json");
var SKILLS_TABLE_NAME = tables['ddoempskills'];

skillsModel.createSkills = function(skillsobj, configObj, res) {
    console.log("createSkills  in SkillsModel");
    var deferred = Q.defer();
    var session = configObj.session;
    var userInfo = session.userDetails;
    var ddo_client_id = userInfo.ddo_client_id;
    var ddo_org_id = userInfo.ddo_org_id;
    var createdby = userInfo.ddo_employee_id;
    var updatedby = userInfo.ddo_employee_id;
    var ddo_employee_id = userInfo.ddo_employee_id;

    var fetchQuery = "SELECT * FROM " + SKILLS_TABLE_NAME +  " WHERE ddo_client_id=$1 AND ddo_org_id=$2 AND ddo_employee_id=$3 AND skillid=$4"

    db.selectQuery(fetchQuery, [ddo_client_id, ddo_org_id, ddo_employee_id, skillsobj.skillid], function(err, data) {
        if(err) {
            deferred.reject(err);
        } else {
            if(data.length > 0) {
                deferred.resolve('Already Exist!');
            } else {
                var columns = "ddo_client_id, ddo_org_id, ddo_employee_id, skillid, skillname, rating, createdby, updatedby";

                var values = "(" +
                    ddo_client_id + "," +
                    ddo_org_id + "," +
                    ddo_employee_id + "," +
                    skillsobj.skillid + ", '" +
                    skillsobj.skillname + "'," +
                    skillsobj.rating + "," +
                    createdby + "," +
                    updatedby +
                    ")";

                
                var query = "INSERT INTO " + SKILLS_TABLE_NAME + " (" + columns + " ) VALUES " + values;

                db.connect(function(err, client, done) {
                    if (err) {
                        console.log("Error in Connection!!!", err);
                        deferred.reject(err);
                    } else {

                        var tx = new Transaction(client);

                        configObj['tx'] = tx;
                        configObj['done'] = done;
                        configObj['client'] = client;
                        configObj['savepoint'] = "skillsSavePoint"

                        tx.begin();
                        tx.savepoint(configObj['savepoint']);

                        tx.query(query, function(err, result) {
                            done();
                            if (err) {
                                deferred.reject(err);
                            } else {
                                deferred.resolve(result);
                            }

                        });
                    }

                });
            }
        }
    });
    
    return deferred.promise;
};

skillsModel.getSkills = function(req, session) {
    console.log("getSkills  in SkillsModel");

    var deferred = Q.defer();
    var userInfo = session.userDetails;
    var ddo_client_id = userInfo.ddo_client_id;
    var ddo_org_id = userInfo.ddo_org_id;
    var ddo_employee_id = req.query.employeeid || userInfo.ddo_employee_id;


    var condition = "isactive = 'Y' AND ddo_client_id = " + ddo_client_id + " AND ddo_org_id = " + ddo_org_id + " AND ddo_employee_id = " + ddo_employee_id;

    var selectQuery = " SELECT * FROM " + SKILLS_TABLE_NAME + " WHERE " + condition;

    db.selectQuery(selectQuery, [], function(err, result) {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(result);
        }
    });
    return deferred.promise;
};

skillsModel.deleteSkills = function(skilsobj, session) {
    console.log("deleteSkills in  SkillssModel");
    var deferred = Q.defer();
    var userInfo = session.userDetails;
    var ddo_client_id = userInfo.ddo_client_id;
    var ddo_org_id = userInfo.ddo_org_id;
    var ddo_employee_id = userInfo.ddo_employee_id;

    var condition = "ddo_client_id = " + ddo_client_id + " AND ddo_org_id = " + ddo_org_id + " AND ddo_employee_id = " + ddo_employee_id + " AND ddo_empskill_id = " + skillsobj.ddo_empskill_id;

    var deleteQuery = " DELETE FROM " + SKILLS_TABLE_NAME + " WHERE " + condition;

    db.selectQuery(deleteQuery, [], function(err, result) {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(result);
        }
    });
    return deferred.promise;
};

skillsModel.updateSkills = function(skillsobj, session, res) {
    console.log("updateSkills  in SkillsModel");
    var deferred = Q.defer();
    var userInfo = session.userDetails;
    var ddo_client_id = userInfo.ddo_client_id;
    var ddo_org_id = userInfo.ddo_org_id;
    var ddo_employee_id = userInfo.ddo_employee_id;

    var condition = "ddo_client_id = " + ddo_client_id + " AND ddo_org_id = " + ddo_org_id + " AND ddo_empskill_id = " + skillsobj.ddo_empskill_id + " AND ddo_employee_id = " + ddo_employee_id;

    var updateQuery = "UPDATE " + SKILLS_TABLE_NAME + " SET updated = '" + Util.getCurrentDateAndTime() + "' ,skillid = " + skillsobj.skillid + ", skillname = '" + skillsobj.skillname + "' ,rating = " + skillsobj.rating + ", primaryskill = '" + skillsobj.primaryskill + "' WHERE " + condition;



    db.nonSelectQuery(updateQuery, [], function(err, result) {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(result);
        }
    });
    return deferred.promise;
};

skillsModel.getSkillsList = function(session) {
    console.log("getSkillsList  in SkillsModel");
    var deferred = Q.defer();
    var userInfo = session.userDetails;
    
    var ddo_employee_id = userInfo.ddo_employee_id;

    var selectQuery = "SELECT ddo_skills_id,name FROM ddo_skills ";
    
    db.selectQuery(selectQuery, [], function(err, result) {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(result);
        }
    });
    return deferred.promise;
};

module.exports = skillsModel;
