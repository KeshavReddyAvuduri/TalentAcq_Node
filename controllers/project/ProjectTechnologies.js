var express = require('express');
var router = express.Router();
//(#pre-include) project technology controller
var projectTechnologies = require("../../models/project/ProjectTechnologies.js");
var Util = require("../../helpers/Util");

router.post("", function(req, res) {
    console.log("ProjectTechnology Post API call");
 
    var session = req.session;
 
    if (!session.useremail) {
        return res.json({ success: false, data: null, session: false });
    }
 
    var obj = {};
 
    //INPUT PARAMETERS
    var reqBody = req.body;
 
    obj.technology_id = reqBody.technology_id;
    obj.projectId = reqBody.projectId;
    obj.name = reqBody.name;
    obj.description = reqBody.description;
 
    //controller function, to insert technology record
    projectTechnologies.createRecord(obj, res, session);
 });

 router.get("", function(req, res) {
    console.log("ProjectTechnologies  Get API call");


   var session = req.session;

   if (!session.useremail) {
       return res.json({ success: false, data: null, session: false });
   }

   //INPUT PARAMETERS
   var projectId = req.query.projectId;
   console.log("piiiiiid",projectId);
   //controller function, to fetch the tech records
   projectTechnologies.getRecord(session, projectId, res);  
});

router.delete("", function(req, res) {
    console.log("ProjectTechnology Delete API call");


   var session = req.session;

   if (!session.useremail) {
       return res.json({ success: false, data: null, session: false });
   }

   //INPUT PARAMETERS
   var technologyId = req.body.technologyId;

   //controller function, to delete a tech record
   projectTechnologies.deleteRecord(session, res, technologyId);
});
router.get("/projectclients", function(req, res) {
    console.log("ProjectClients  Get API call");


   var session = req.session;

   if (!session.useremail) {
       return res.json({ success: false, data: null, session: false });
   }

   //INPUT PARAMETERS
   var projectId = req.query.projectId;
   console.log("piiiiiid",projectId);
   //controller function, to fetch the clients records
   projectTechnologies.getClientsDetails(session, projectId, res);  
});

module.exports = router;