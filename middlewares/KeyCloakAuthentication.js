var request = require('request');
var util = require("../helpers/Util.js");

var sessionBypassRoutes = ["/auth"];
var keycloakData = util.getKeycloakData();
var keycloakHost = keycloakData.host;
var realmName = keycloakData.realm;
// var keycloakPort = '8180';

module.exports = function (app) {
    app.use("/", function (req, res, next) {
        console.log('Current Url is : ', req.url);
        var url = req.url,
            queryStringIndex = req.url.indexOf("?"),
            url = queryStringIndex >= 0 ? url.substring(0, queryStringIndex) : url,
            urlIndex = sessionBypassRoutes.indexOf(url);
        
        if (url == '/auth') {
            var userEmail = req.body.email;
        }

        console.log('checking keycloak token authentication ', url);

        if (req.method === 'OPTIONS') {
			res.statusCode = 204;
			return res.end();
		}

        if (req.headers.authorization) {
            // configure the request to your keycloak server
            const options = {
                method: 'GET',
                url: `http://${keycloakHost}/auth/realms/${realmName}/protocol/openid-connect/userinfo`,
                headers: {
                    // add the token you received to the userinfo request, sent to keycloak
                    Authorization: req.headers.authorization
                },
            };

            // send a request to the userinfo endpoint on keycloak
            request(options, (error, response, body) => {
                var jsonBody = body ? JSON.parse(body) : null;
                console.log('Parsed response body is : ', jsonBody);

                if (error) {
                    console.log('Error is ', error);
                    res.status(401).json({
                        error: error,
                    });
                }

                // if the request status isn't "OK", the token is invalid
                if(response) {
                    if (response.statusCode !== 200) {
                        console.log('User not authorized ', error);
                        res.status(401).json({
                            error: body.error_description,
                        });
                    } 
                    // if token user is not matched with request user.
                    else if (jsonBody != null && userEmail && userEmail!= jsonBody.email) {
                        console.log('User is invalid');
                        res.status(401).json({
                            error: `Invalid user`,
                        });
                    }
                    // the token is valid pass request onto your next function
                    else {
                        if (!url 
                            || urlIndex >= 0 
                                || url == '/login/forgotpassword' 
                                    || url == '/registration' 
                                        || url == '/registration/verifystatus' 
                                            || url == '/decrypt'
                                                || url == '/jobapplication/getAppDetailsByMobileNo') {
                            return next();
                        }
                        next();
                    }
                }                
            });
        } else {
            // there is no token, don't process request further
            res.status(401).json({
                error: `unauthorized`,
            });
        }
    });
}