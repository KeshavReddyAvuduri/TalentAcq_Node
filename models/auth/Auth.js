//To use promises module
var Q = require("q");

//an object being exported
var authmodel = {};

//(#pre-includes)
//db usage file like connection, query passage, etc...,
var db = require("../../helpers/db/Postgres.js");

//To use database Tables 
var tables = require("../../helpers/Tables.json");
var Util = require("../../helpers/Util.js");

var DDO_EMP_TABLE_NAME = tables['ddoemp'];

var DDO_ROLE_TABLE_NAME = tables['ddorole'];

var DDO_USER_TABLE_NAME = tables['ddouser'];

var DDO_KARMA_TABLE_NAME = tables['ddokarma'];

var DDO_WALLET_TABLE_NAME = tables['ddowallet'];

var DDO_USER_ROLE_TABLE_NAME = tables['ddouserrole'];

var DDO_EMP_IMAGES_TABLE_NAME = tables['ddoempimages'];

var DDO_KARMA_CATEGORY_TABLE_NAME = tables['ddokarmacategory'];

authmodel.validateEmail = function(emailid) {
    console.log("validateEmail promise in AuthModel!");

    var deferred = Q.defer();

    var conditions = "email = $1";
    var validateEmailQuery = "SELECT EXISTS(SELECT email FROM " + DDO_USER_TABLE_NAME + " WHERE " + conditions + ")";

    db
        .selectPromise(validateEmailQuery, [emailid])
        .then(function(data) {
            data = data[0].exists;
            deferred.resolve(data);
        })
        .catch(function(err) {
            console.log('validating email catch blok!!', err);
            deferred.reject(err);
        });

    return deferred.promise;
};

authmodel.login = function(obj, req, res) {
    console.log("login in AuthModel");

    var session = req.session;

    //req.passport.authenticate('ldapauth', {session: false}, function (err, ldapUser, info) {
        // if (err) {
        //     console.log('error in ldap authentication: ', err);
        //     return res.status(500).json({success: false, data: err, message: 'Authentication failed!'});
        // } else {
        //     console.log('ldapUser details: ', ldapUser);

        //     if (!ldapUser) {
        //         return res.status(400).json({success: false, session: false, message: "No User found!"});
        //     } else {
        //         obj.useremail = ldapUser.mail;
    
    authmodel.getSession(req, obj.email.toLowerCase(), session)
            .then(function(data) {
                return res.json({success: true, data: data, session: true});
            })
            .catch(function(err) {
                console.log('Auth model error: ', err);
                return res.status(500).json({success: false, data: err, message: 'Authentication failed!'});
            })
            .done();            
    //}
    // })(req, res);

     //new add
    // var conditions = "lower(email) = lower($1)" ;
    // var selectQuery = "SELECT password FROM " + DDO_USER_TABLE_NAME + " where " + conditions;
    // var responseStatus = 500;
    // var isEmailMatch = false;
    // var isPasswordMatch = false;

    // db.selectQuery(selectQuery, [obj.useremail], function (err, data) {
    //     if (err) {
    //         console.log('Error while retrieving password from db!! ', err);

    //         return res.status(500).json({success: false, data: "Failed to retrive password from db!!"});
    //     }

    //     var dbPassword = data[0] && data[0].password;
    //     var emailid = obj.useremail.toLowerCase(obj.useremail);

    //     authmodel
    //     .validateEmail(emailid)
    //     .then(function(matchEmail) {
    //         console.log("matchEmail",matchEmail);
    //         if (matchEmail) {
    //             isEmailMatch = matchEmail;
    //             console.log('compare password', obj.password, dbPassword);
    //             var decryptedPassword = Util.decryptPassword(dbPassword);
                
    //             if(decryptedPassword === obj.password) {
    //                 return true;
    //             } else {
    //                 return false;
    //             }
    //         } else {
    //             //wrong user email
    //             console.log("Invalid username");
    //             responseStatus = 400;
    //             throw new Error("Invalid username");
    //         }
    //     })
    //     .then(function(matchPassword) {
    //         isPasswordMatch = matchPassword;

    //         if (!isPasswordMatch) {
    //             //wrong password
    //             console.log("Invalid password")
    //             responseStatus = 400;
    //             throw new Error("Invalid password");
    //         } else {
    //             console.log("Allowed for login");
    //             return authmodel.getSession(req, emailid, session);
    //         }
    //     })
    //     .then(function(data) {
    //         if (data) {
    //             return res.json({success: true, data: data, session: true});
    //         } else {
    //             responseStatus = 401;
    //             throw new Error("Unauthorized access");
    //         }
    //     })
    //     .catch(function(err) {
    //         if(typeof err === 'object' && Util.isEmptyObject(err)) {
    //             err = err.message || '';
    //         }
    //         return res.status(responseStatus).json({success: false, data: err});
    //     })
    //     .done();
    // });
}

authmodel.getSession = function(req, emailid, session) {
    var deferred = Q.defer();

    var categoryActName = "Activity";
    var categoryFeedbackName = "Feedback";

    var karmaLikeName = "Ideate Like";
    var karmaGoalName = "Goal Achieved";
    var karmaShareName = "Social Activity";

    var paramRows = [categoryActName, emailid, karmaLikeName, karmaShareName, categoryFeedbackName, karmaGoalName];

    var loginAuthQuery = "SELECT du.ddo_org_id, du.ddo_client_id, du.email, du.ddo_employee_id, de.firstname, de.lastname, "
    + "concat(de.firstname,' ',de.lastname) fullname, " 

    + "(SELECT dkc.ddo_karmacategory_id from "+ DDO_KARMA_CATEGORY_TABLE_NAME + " dkc WHERE dkc.ddo_client_id=du.ddo_client_id and dkc.isactive='Y' "
    + "and dkc.ddo_org_id=du.ddo_org_id and dkc.name=$1) as karmacatid_act, "

    + "(SELECT dkc.ddo_karmacategory_id from "+ DDO_KARMA_CATEGORY_TABLE_NAME + " dkc WHERE dkc.ddo_client_id=du.ddo_client_id and dkc.isactive='Y' "
    + "and dkc.ddo_org_id=du.ddo_org_id and dkc.name=$5) as karmacatid_feedback, "

    + "(SELECT dka.ddo_karma_id from " + DDO_KARMA_TABLE_NAME + " dka WHERE "
    + "dka.isactive='Y' and dka.ddo_client_id=du.ddo_client_id and dka.ddo_org_id=du.ddo_org_id and dka.name=$3 and isreference='Y') as karmalike_id, "

    + "(SELECT dk.ddo_karma_id from " + DDO_KARMA_TABLE_NAME + " dk WHERE "
    + "dk.isactive='Y' and dk.ddo_client_id=du.ddo_client_id and dk.ddo_org_id=du.ddo_org_id and dk.name=$4 and isreference='Y') as karmashare_id, "

    + "(SELECT dk.ddo_karma_id from " + DDO_KARMA_TABLE_NAME + " dk WHERE "
    + "dk.isactive='Y' and dk.ddo_client_id=du.ddo_client_id and dk.ddo_org_id=du.ddo_org_id and dk.name=$6) as karmagoal_id "

    + "FROM " + DDO_USER_TABLE_NAME + " du JOIN " + DDO_EMP_TABLE_NAME + " de ON de.ddo_employee_id = du.ddo_employee_id "
    + "WHERE LOWER(du.email)=LOWER($2) AND du.isactive = 'Y'";
    console.log('loginAuthQuery: ', loginAuthQuery);

    db.selectQuery(loginAuthQuery, paramRows, function (err, data) {
        if (err) {
            console.log("Error in Login Authentication!!",err);

            deferred.reject(err);
        }
        if (data.length > 0) {
            authmodel.getKarmaDetails(req, data[0]).
                then(function (karmadetails) {
                    authmodel.getUserDetails(req, data[0])
                        .then(function (userDetails) {
                            if(userDetails.roles && userDetails.roles.length === 0) {
                                message = 'No roles does exist!'
                                deferred.reject(message);
                            } else {
                                session.user = data[0];

                                session.userDetails = userDetails;

                                session.cbpid = userDetails.cbpid;
                                session.email = userDetails.email;
                                session.useremail = userDetails.email;

                                session.logourl = userDetails.logourl;

                                session.empcode = userDetails.employeecode;

                                session.karmalike_id = data[0].karmalike_id;
                                session.karmagoal_id = data[0].karmagoal_id;
                                session.karmashare_id = data[0].karmashare_id;

                                session.karmacatid_act = data[0].karmacatid_act;
                                session.karmacatid_feedback = data[0].karmacatid_feedback;

                                if(karmadetails.length > 0) {
                                    session.karma_likerating = karmadetails[0];
                                    session.karma_sharerating = karmadetails[1].karma_sharerating;                                    
                                }


                                console.log('session: ', session);

                                deferred.resolve(userDetails);
                            }
                        })
                        .catch(function(err) {
                            console.log("Error in getUserDetails Promise", err);
                            deferred.reject(err);
                        }).done();
                })
                .catch(function(err) {
                    console.log("Error in getUserDetails Promise", err);
                    deferred.reject(err);
                }).done();

        } else {
            console.log("No Data Found!!");

            message = 'No Data Found!!'
            deferred.resolve(message);
        }
    });
    return deferred.promise;
};

authmodel.getKarmaDetails = function(req, config) {
    var deferred = Q.defer();

    var query = "SELECT dki.ddo_karmarating_id AS karma_likerating, "

    +"(SELECT dkai.ddo_karmarating_id FROM ddo_karmaratings_instance dkai WHERE dkai.ddo_client_id=$1 and dkai.ddo_org_id=$2 "
    +"and dkai.ddo_karma_id=$4 and dkai.isactive='Y') AS karma_sharerating "

    +"FROM ddo_karmaratings_instance dki "
    +"WHERE dki.ddo_client_id=$1 and dki.ddo_org_id=$2 and dki.ddo_karma_id=$3";
console.log(query, config['ddo_client_id'], config['ddo_org_id'], config['karmalike_id'], config['karmashare_id']);
    db.selectQuery(query, [config['ddo_client_id'], config['ddo_org_id'], config['karmalike_id'], config['karmashare_id']], function(err, data) {
        if (err) {
            console.log("Error in getKarmaDetails method in AuthModel!!");

            deferred.reject(new Error(err));
        } else {
            var result = [];

            var karmaLikeObj = {};

            if(data.length > 0) {
                var likeValues = [-2, -1, 1, 2, 3];

                for(var i=0; i<data.length; i++) {
                    karmaLikeObj[likeValues[i]] = data[i].karma_likerating;
                }

                result.push(karmaLikeObj);
                result.push({karma_sharerating: data[0].karma_sharerating})
            }
            console.log('result: ', result);

            deferred.resolve(result);
        }
    });

    return deferred.promise;
};

authmodel.getUserDetails = function(req, config) {
    var deferred = Q.defer();

    var promises = [authmodel.getUserInformation(req, config), authmodel.getUserRoles(req, config)];

    Q.all(promises).then(function(data) {
        var userData = {},
            o, promiseData;

        for (var i = 0, ln = data.length; i < ln; i++) {
            promiseData = data[i];
            o = promiseData.data;
            if (promiseData.type === "user") {
                var score = {};
                o = promiseData.data[i];

                score.karmapoints = o.karmapoints || 0;
                score.walletpoints = o.walletpoints || 0;
                score.rewardpoints = o.rewardpoints || 0;

                userData.ddo_org_id = o.ddo_org_id;
                userData.ddo_client_id = o.ddo_client_id;
                userData.ddo_employee_id = o.ddo_employee_id;
                userData.ddo_user_id = o.ddo_user_id;
                userData.fullname = o.fullname;
                userData.email = o.email;
                userData.userid = req.body.username;
                userData.user_profile_pic_url = o.user_profile_pic_url;
                userData.user_cover_pic_url = o.user_cover_pic_url;
                userData.logo_url = o.logo_url;
                userData.reportingto = o.reportingto;
                userData.designation = o.designation;
                userData.score = score;
                userData.isadmin = o.isadmin;
            } else if (promiseData.type === "role") {
                userData.roles = o;
            }
        }

        userData.user_id = config.user_id;
        deferred.resolve(userData);
    }).catch(function(err) {

        console.log("Error in getUserDetails Promise", err);

        deferred.reject(err);
    }).done();

    return deferred.promise;
};

authmodel.getUserRoles = function(req, config) {
    var deferred = Q.defer();

    var query = "SELECT DISTINCT "
        + " dr.name AS rolename, "
        + " dur.ddo_role_id AS roleid" 
        + " FROM "+ DDO_ROLE_TABLE_NAME +" AS dr "
        + " JOIN "+ DDO_USER_ROLE_TABLE_NAME +" AS dur ON dur.ddo_role_id = dr.ddo_role_id "
        + " WHERE dur.isactive = 'Y'"
        + " AND dur.ddo_user_id IN"
        + " (SELECT ddo_user_id FROM "+ DDO_USER_TABLE_NAME +" WHERE isactive = 'Y' AND ddo_employee_id = $1)";

    db.selectQuery(query, [config.ddo_employee_id], function(err, data) {
        if (err) {
            console.log("Error in getUserRoles method!!");

            deferred.reject(new Error(err));
        } else {
            deferred.resolve({ data: data, type: "role" });
        }
    });

    return deferred.promise;
};

authmodel.getUserInformation = function(req, config) {
    var deferred = Q.defer();

    var query = " SELECT "
    + " du.ddo_user_id AS ddo_user_id,"
    + " du.isadmin,"
    + " dew.reportingto,"
    + " du.ddo_client_id AS ddo_client_id,"
    + " du.ddo_org_id AS ddo_org_id,"
    + " du.username AS username,"
    + " du.email AS email,"
    + " du.ddo_employee_id AS ddo_employee_id,"
    + " de.firstname,"
    + " de.lastname,"
    + " dw.points as walletpoints,"
    + " dw.karma_points as karmapoints,"
    + " c.logo_url as logo_url,"
    + " dw.reward_points as rewardpoints,"
    + " concat(de.firstname,' ',de.lastname) fullname,"
    + " COALESCE(dei.profileimage_url, (('http://www.gravatar.com/avatar/'::text || md5(de.email::text)) || '.jpg?s200&d=identicon'::text)::character varying) AS user_profile_pic_url,"
    + " dei.coverimage_url AS user_cover_pic_url,"
    + " dew.designation "
    + " FROM "+ DDO_USER_TABLE_NAME +"  du "
    + " LEFT JOIN "+ DDO_EMP_TABLE_NAME +" de ON de.ddo_employee_id = du.ddo_employee_id"
    + " LEFT JOIN "+ DDO_EMP_IMAGES_TABLE_NAME + " dei ON dei.ddo_employee_id = du.ddo_employee_id"
    + " LEFT JOIN " + DDO_WALLET_TABLE_NAME + " dw ON dw.ddo_employee_id = du.ddo_employee_id"
    + " LEFT JOIN ddo_client c ON c.ddo_client_id = du.ddo_client_id"
    + " LEFT JOIN ddo_empworkdetails dew ON dew.ddo_employee_id = du.ddo_employee_id"
    + " WHERE du.ddo_employee_id = $1";

    db.selectQuery(query, [config.ddo_employee_id], function(err, data) {
        if (err) {
            console.log("Error in getUserInformation method!!");

            deferred.reject(new Error(err));
        } else {
            deferred.resolve({ data: data, type: "user" });
        }
    });

    return deferred.promise;
};

module.exports = authmodel;