var express = require('express');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var package = require("./package.json");
// var swagger = require("swagger-node-express");
var argv = require('minimist')(process.argv.slice(2));

// var swaggerJSDoc = require('swagger-jsdoc');

//Create subpath for api documentation
var subpath = express();

var app = express();

// swagger definition
// var swaggerDefinition = {
//     info: {
//         title: 'DDO Node Swagger API',
//         version: '1.0.0',
//         description: 'Demonstrating how to describe a RESTful API with Swagger in DDO',
//     },
//     host: 'localhost:3400',
//     basePath: '/'
// };

// options for the swagger docs
var options = {
    // import swaggerDefinitions
    // swaggerDefinition: swaggerDefinition,
    // path to the API docs
    apis: [
        './controllers/auth/*.js'
    ],
};

// initialize swagger-jsdoc
// var swaggerSpec = swaggerJSDoc(options);

// serve swagger
// app.get('/swagger.json', function(req, res) {
//     res.setHeader('Content-Type', 'application/json');
//     res.send(swaggerSpec);
// });

// Subpath for swagger ui
app.use("/v1", subpath);

// Swagger UI configuration
// swagger.setAppHandler(subpath);

// swagger.setApiInfo({
//     title: "DDO API",
//     description: "API Doc for showing DDO backend operations",
//     termsOfServiceUrl: "ddo.walkingtree.in",
//     contact: "stevenson.nelli@walkingtree.tech",
//     license: "WalkingTree",
//     licenseUrl: "walkingtree.tech"
// });

var cluster = require('cluster');
//Restart the node Server on an uncaughtException/exit is occured
var workers = 1;
//var workers = require('os').cpus().length;

if (cluster.isMaster) {
    // Test commit

    console.log('start cluster with %s workers', workers);

    for (var i = 0; i < workers; ++i) {
        var worker = cluster.fork().process;
        console.log('worker %s started.', worker.pid);
    }

    cluster.on('exit', function (worker) {
        console.log('worker %s died. restart...', worker.process.pid);
        cluster.fork();
    });

} else {

    var app = express();
    var server = require('http').createServer(app);

    app.set("env", package.config.env);
    app.set("port", package.config.port);
    app.use(logger('dev'));
    app.use(bodyParser.json({limit: '50mb'}));
    app.use(bodyParser.urlencoded({limit: '50mb',
        extended: true
    }));
    app.use(cookieParser());

    // app.use('/assets', express.static('assets'));
    // app.use('/', express.static('views'));
    // app.use('/appResumes', express.static('appResumes'));
    // app.use('/projectImages', express.static(__dirname + '/projectImages'));
    // app.use('/userPics', express.static(__dirname + '/userPics'));
    // app.use('/userPics/FeedsTempUploadImages', express.static(__dirname + '/userPics/FeedsTempUploadImages'));
    //Attaching swagger ui dist
    // app.use(express.static('api_docs/dist'));

    // app.use('/companyLogoUrlPath', express.static(__dirname + '/companyLogoUrlPath'));
    // app.use('/companyLogoPath/logos', express.static(__dirname + '/companyLogoPath/logos'));
    //For schedular process
    // require("./schedular/Schedular.js")(app);
    // require("./schedular/Compaign.js")(app);
    //
    // require("./schedular/Email.js")(app);

    /** Uncomment below only to reset wallet and update
    * require("./schedular/ResetWallet.js")(app);
    * require("./schedular/UpdateWallet.js")(app);
    **/

    //require("./schedular/LeaveSetting.js")(app);

    //For schedular process
    // require("./schedular/RegSchedular.js")(app);

    //For schedular process
    // require("./schedular/RegSchedular.js")(app);

    require("./middlewares/CorsIntercepter")(app);
    require("./middlewares/Session")(app);
    // require("./middlewares/SocketIO")(app, server);
    // require("./middlewares/LdapAuthenticator")(app);
    // require("./middlewares/SessionInterceptor")(app);
    // require("./middlewares/KeyCloakAuthentication")(app);

    require("./middlewares/Router")(app);


    //For project API's
    // require("./middlewares/ProjectAPI")(app);


// catch 404 and forward to error handler
    app.use(function (err, req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

// error handlers

// development error handler
// will print stacktrace
    if (app.get('env') === 'development') {
        app.use(function (err, req, res, next) {
            res.status(err.status || 500).end();
            console.log(err);
        });
    }

// production error handler
// no stacktraces leaked to user
    app.use(function (err, req, res, next) {
        res.status(err.status || 500).end();
    });

    server.listen(app.get("port"), function (err) {
        if (err) {
            throw err;
        }
        console.log("Server listening on port : " + app.get("port") + " !!!");
    });

    // Serve swagger ui
    // subpath.get('/', function (req, res) {
    //     res.sendfile(__dirname + '/api_docs/dist/index.html');
    // });

    // swagger.configureSwaggerPaths('/modules/talentacquisition', 'api-docs', '');

    var domain = 'localhost';

    if(argv.domain !== undefined)
        domain = argv.domain;
    else
        console.log('No --domain=xxx specified, taking default hostname "localhost".');

    // var applicationUrl = 'http://' + domain + ':' + app.get('port');
    var applicationUrl = 'http://' + domain;

    // swagger.configure(applicationUrl, '1.0.0');
}

module.exports = {
    app: app
};

