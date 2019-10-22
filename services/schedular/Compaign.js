var compaignService = {};
var compaignModel = require("../../models/schedular/Compaign");

compaignService.beginSchedular = function() {
	//Start process -> on goes in model
	compaignModel.onStartProcess();
};

module.exports = compaignService;