var skillsServices;
skillsServices = {};
var express = require("express");
var router = express.Router();
var tables = require("../../helpers/Tables.json");
var Util = require("../../helpers/Util");
var Constants = require("../../helpers/Constants");

var bodyParser = require('body-parser');

/*db usage file like connection, query passage, etc...,*/
var db = require("../../helpers/db/Postgres.js");

var skillsModel = require("../../models/profile/Skills.js");

var SESSION_FALSE_RES_JSON = {
    success: false,
    data: null,
    session: false
};

var RECORD_NAME = 'skills';

/*Inserting data in ddo_empskills*/
skillsServices.createSkills = function(req, res) {
    console.log("Entered createSkills in skillsServices");
    var session = req.session;
    var configObj = {
        session: session,
        res: res
    };
    if (!session) {
        return res.status(Constants.httpStatusCodes.UNAUTHORIZED).json(SESSION_FALSE_RES_JSON);
    } else {

        var reqBody = req.body;

        var skillsobj;

        skillsobj = {};

        skillsobj.skillid = reqBody.skillid;
        skillsobj.skillname = reqBody.skillname;
        skillsobj.rating = reqBody.rating;

        skillsModel.createSkills(skillsobj, configObj, res)
            .then(function(data) {
                if(data == 'Already Exist!') {
                    return res.json({success: true, exist: 'Y', message: 'Skill already exist!'});
                } else {
                    Util.commitFn(configObj, Constants.messages.getCreateSuccess(RECORD_NAME), data,req,res);                    
                }
            })
            .catch(function(err) {
                Util.rollbackFn(configObj, err, Constants.messages.getCreateFailure(RECORD_NAME));
            });
    }
};

/*Fetching data froom ddo_empskills*/
skillsServices.getSkills = function(req, res) {
    console.log("getSkills in skillsServices");

    //verifying session
    var session = req.session;
    if (!session) {
        return res.status(Constants.httpStatusCodes.UNAUTHORIZED).json(sessionFalseResJson);
    } else {
        skillsModel
            .getSkills(req, session)
            .then(function(data) {
                res.json({
                    success: true,
                    data: data
                });
            })
            .catch(function(err) {
                res.status(Constants.httpStatusCodes.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    data: err
                })
            });
    }
};

/*Deleting data from ddo_empskills*/
skillsServices.deleteSkills = function(req, res) {
    console.log("deleteSkills in SkillsServices");

    //verifying session
    var session = req.session;
    if (!session) {
        return res.status(Constants.httpStatusCodes.UNAUTHORIZED).json(SESSION_FALSE_RES_JSON);
    } else {

        var skillsobj;

        var reqBody = req.body;

        skillsobj = {};

        skillsobj.ddo_empskill_id = reqBody.ddo_empskill_id || 1;

        skillsModel
            .deleteSkills(skillsobj, session)
            .then(function(data) {
                res.json({
                    success: true,
                    data: data
                });
            })
            .catch(function(err) {
                res.status(Constants.httpStatusCodes.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    data: err
                });
            });
    };
};

/*Updating data in ddo_empskills*/
skillsServices.updateSkills = function(req, res) {
    console.log("updateSkills in SkillsServices");

    //verifying session
    var session = req.session;
    if (!session) {
        return res.status(Constants.httpStatusCodes.UNAUTHORIZED).json(SESSION_FALSE_RES_JSON);
    } else {
        var skillsobj;

        var reqBody = req.body;

        skillsobj = {};

        skillsobj.ddo_empskill_id = reqBody.ddo_empskill_id || 2;
        skillsobj.skillid = reqBody.skillid;
        skillsobj.skillname = reqBody.skillname;
        skillsobj.rating = reqBody.rating;
        skillsobj.primaryskill = reqBody.primaryskill;

        skillsModel
            .updateSkills(skillsobj, session, res)
            .then(function(data) {
                res.json({
                    success: true,
                    data: data
                });
            })
            .catch(function(err) {
                res.status(Constants.httpStatusCodes.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    data: err
                });
            });
    };
};

/*Fetching data from ddo_skills*/
skillsServices.getSkillsList = function(req, res) {
    console.log("getSkillsList in skillsServices");

    /*verifying session*/
    var session = req.session;
    if (!session) {
        return res.status(Constants.httpStatusCodes.UNAUTHORIZED).json(sessionFalseResJson);
    } else {
        skillsModel
            .getSkillsList(session)
            .then(function(data) {
                console.log("data", data);
                res.json({
                    success: true,
                    data: data
                });
            })
            .catch(function(err) {
                res.status(Constants.httpStatusCodes.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    data: err
                })
            });

    }
};

module.exports = skillsServices;
