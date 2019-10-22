//an object being exported
var scheduleService = {};

//control functionalities
var scheduleModel = require("../../models/schedular/Schedular");

scheduleService.beginSchedular = function() {
	//Start process -> on goes in model
	scheduleModel.onStartProcess();
};

module.exports = scheduleService;