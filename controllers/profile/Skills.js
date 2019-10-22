var express = require("express");
var router = express.Router();

var tables = require("../../helpers/Tables.json");
var bodyParser = require('body-parser');

//db usage file like connection, query passage, etc...,
var db = require("../../helpers/db/Postgres.js");

var skillsServices = require("../../services/profile/Skills.js");


/**
 * POST API to generate Skills.
 */

router.post("", function(req, res) {
    console.log("skills create api in SkillsController");
    skillsServices.createSkills(req, res);
});


/**
 *GET api for Skills 
 */
router.get("", function(req, res) {
    console.log("skills get api in SkillsController");
    skillsServices.getSkills(req, res);
});


/**
 *UPDATE api for Skills 
 */
router.put("", function(req, res) {
    console.log("skills update api in SkillsController");
    skillsServices.updateSkills(req, res);
});


/**
 *DELETE api for Skills 
 */
router.delete("", function(req, res) {
    console.log("skills delete api in SkillsController");
    skillsServices.deleteSkills(req, res);
});

/**
 *GET api for SkillsList for combo 
 */
router.get("/combo", function(req, res) {
    console.log("skills get api in SkillsController");
    skillsServices.getSkillsList(req, res);
});

module.exports = router;
