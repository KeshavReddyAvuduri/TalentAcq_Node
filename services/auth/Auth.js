//an object being exported
var authService = {};

var tables = require("../../helpers/Tables.json");

var authmodel = require("../../models/auth/Auth.js");

//authService.loginFn(req, res);
authService.login = function(req, res) {

    console.log("login in AuthService");  

    var reqBody = req.body;

    authmodel.login(reqBody, req, res);
};

module.exports = authService;
