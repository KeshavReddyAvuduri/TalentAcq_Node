
module.exports = function (app) {

	//It will enable co90;rs for DEVELOPMENT environment.
	// if(app.get("env") == "development"){
	app.use(function (req, res, next) {
		res.header("Access-Control-Allow-Origin", req.headers.origin);
		res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
		res.header('Access-Control-Allow-Credentials', true);
		res.header("Access-Control-Allow-Headers", "Origin, Authorization, X-Requested-With, Content-Type, Accept, Token, token");
		if (req.method === 'OPTIONS') {
			res.statusCode = 204;
			return res.end();
		}
		else {
			return next();
		}
	});
}