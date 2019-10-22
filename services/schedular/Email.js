var emailService = {};
var emailModel = require("../../models/schedular/Email");

emailService.beginSchedular = function() {
	console.log("emailService function in schedular Services")
	//Start process -> on goes in model
	emailModel.onStartProcess();
};

module.exports = emailService;