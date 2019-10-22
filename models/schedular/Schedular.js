var Q = require("q");

//an object being exported
var scheduleModel = {};

//(#pre-includes)
//db usage file like connection, query passage, etc...,
var db = require("../../helpers/db/Postgres.js");

//transaction for PG
var Transaction = require('pg-transaction');
var Util = require('../../helpers/Util.js');

//sequences names are being initialized in json
var tables = require("../../helpers/Tables.json");

var messages = require("../../helpers/Messages.json");

//For error or success or anything else response color
var chalk = require('chalk');

//for error response color
var error = chalk.red;

//for success response color
var response = chalk.green;

//for query/no data/extra purpose color
var fetchcolor = chalk.blue;

//file reader
var fs = require('fs');

//hbs file for html content
var hbs =require('nodemailer-express-handlebars');

var DDO_URL_LINK_NAME = "http://ddo.walkingtree.in";

//default wallet points for admin
var DEFAULT_WALLET_POINTS;

var DEFAULT_WALLET_EMP_PERCENT;
var DEFAULT_WALLET_MANAGER_PERCENT;
var DEFAULT_WALLET_MANAGER_MANAGER_PERCENT;

var DEFAULT_EMAIL_TEMPLATE_ID = 7;

var DDO_REG_TABLE_NAME = tables['ddoreg'];

var DDO_APP_ACCESS_TABLE_NAME = tables['ddoappviews'];

var DDO_EMAIL_TEMPLATE_TABLE_NAME = tables['ddoemailtemplate'];

var DDO_WALLET_SETTINGS_TABLE_NAME = tables['ddowalletsettings'];

/**
* ### Initial need values ###
*/
var roles = ['Admin', 'Employee'];

var categoryNames = ['Activity', 'Feedback', 'Project'];

var ratingNames = ['Dull', 'Lazy', 'Good', 'Superb', 'Amazing'];

var karmaActivityNames = ['Ideate Like', 'Social Activity', 'Goal Achieved'];

var imagePaths = [
	'userPics/FeedsTempUploadImages/414cf2cdbb136eb9879114d9fba15b59',
	'userPics/FeedsTempUploadImages/e143a9e5f63184f3613df43de25367b7',
	'userPics/FeedsTempUploadImages/07a04694cc7cd65ef540e16660c57c48',
	'userPics/FeedsTempUploadImages/00fb5fa6954f96cc161e68f0ac0f0fc2',
	'userPics/FeedsTempUploadImages/85213671d0f2912c67e17ecbc429aa46'
];
/**
*  -------- ##### -------
*/


//Fetches the records from ddo_registration table only if isprocessed is 'N'
scheduleModel.onStartProcess = function() {
	var promises = [];

	//Check for isprocessed='N' in ddo_registration table
	var conditions = "isactive='Y' and isprocessed='N' and iserror='N'";
	var regSelectQuery = "SELECT * FROM " + DDO_REG_TABLE_NAME + " WHERE " + conditions;

	console.log(fetchcolor("Registration isprocessed N query ->"), regSelectQuery);

	db.selectQuery(regSelectQuery, [], function(err, data) {
 		if (err) {
 			console.log(error("Got an Error while fetching records from DDO_Registration!!"), err);
 		} else {
 			if(data.length > 0) {
 				console.log(response("Fetched the records successfully -> "), data);

	 			var result = Q();

	 			data.forEach(function(rec) {
	 				result = result.then(scheduleModel.processRegistraion(rec));
	 			});

				result
	 				.then(function(data) {
	 					console.log(response('All updates completed!'), data);
	 				})
	 				.catch(function(err) {
	 					console.log(error("Got Error in Promises! %s"),err);
	 				})
	 				.done();
 			} else {
 				console.log(fetchcolor('None to be found for the start process!'));
 			}
 		}
 	});
};

//Registration process starts from this function
scheduleModel.processRegistraion = function(obj) {
	var deferred = Q.defer();

	console.log(fetchcolor("Process Registration Begins:::"));

	db.connect(function(err, client, done){
        if (err) {
            console.log(error("Error produced while connecting to DB -> "), err);
        } else {
        	obj['savepoint'] = "regSavePoint";

        	//Set the transaction for DB connection
	        var tx = new Transaction(client);

	        //begin the transaction process
	        tx.begin();

	        //create a save point
	        tx.savepoint(obj['savepoint']);

	        obj['tx'] = tx;

	        obj['client'] = client;

	        obj['done'] = done;

	        //Ddo_client record insertion
			scheduleModel.insertIntoDdoClient(obj)
				//Ddo_org record insertion
				.then(function(data) {
					return scheduleModel.insertIntoDdoOrg(obj);
				})
				//Ddo_role record insertion
				.then(function(data) {
					return scheduleModel.insertIntoDdoRole(obj);
				})
				//Ddo_employee record insertion
				.then(function(data) {
					return scheduleModel.insertIntoDdoemployee(obj);
				})
				//Ddo_employee record updation for employee_code
				.then(function(data) {
					return scheduleModel.updateIntoDdoemployee(obj);
				})
				//Ddo_user record insertion
				.then(function(data) {
					return scheduleModel.insertIntoDdoUser(obj);
				})
				//Ddo_userrole record insertion
				.then(function(data) {
					return scheduleModel.insertIntoDdoUserRole(obj);
				})
				//Ddo_fyear record insertion
				.then(function(data) {
					return scheduleModel.insertIntoDdoFYear(obj);
				})
				//Ddo_wallet record insertion
				.then(function(data) {
					return scheduleModel.insertIntoDdoWallet(obj);
				})
				//Ddo_walletSettings record insertion
				.then(function(data) {
					return scheduleModel.insertIntoDdoWalletSettings(obj);
				})				
				//Ddo_userviewaccess record insertion
				.then(function(data) {
					return scheduleModel.insertIntoDdoUserAccess(obj);
				})
				//Ddo_karmarating record insertion
				.then(function(data) {
					return scheduleModel.insertIntoDdoKarmaRating(obj);
				})
				//Ddo_karmacategory record insertion
				.then(function(data) {
					return scheduleModel.insertIntoDdoKarmaCategory(obj);
				})
				//Ddo_karma record insertion
				.then(function(data) {
					return scheduleModel.insertIntoDdoKarma(obj);
				})				
				//Ddo_karmaratings_instance record insertion
				.then(function(data) {
					return scheduleModel.insertIntoDdoKarmaRatingsInstance(obj);
				})
				// // DDO_registration record updation
				.then(function(data) {
					return scheduleModel.updateIsProcessed(obj);
				})
				//Success of registration process sending the mail
				// .then(function(data) {
				// 	return scheduleModel.successProcessMail(obj)
				// })
				//commit processed
				.then(function(data) {
					console.log(response("Committed!"));
					scheduleModel.commitProcessed(obj, "Registration process complete!");
					deferred.resolve(data);
				})
				//Exception stackoverflow
				.catch(function(err) {
					console.log(error("Error in SEQUENCE Promise!!"), err);
					scheduleModel.rollback(obj, err, "Error in SEQUENCE Promise!!");
				})
				.done();
        }
	});

	return deferred.promise;
};

//Record insertion into ddo_client table
scheduleModel.insertIntoDdoClient = function(obj) {
	var deferred = Q.defer();

	var columns = "name, firstname, lastname, email, phonenumber, designation, key, createdby, updatedby";

	var values = "('" + obj['company'] + "','" + obj['firstname'] + "','" + obj['lastname'] + "','" + obj['email'] + "','" + obj['phonenumber'] + "','" + obj['designation'] + "','" + obj['email'] + "',0,0)";

	scheduleModel.insertionQuery(obj, 'ddo_client', columns, 'ddo_client_id', 'ddoclient', values, deferred);

	return deferred.promise;
};

//Record insertion into ddo_org table
scheduleModel.insertIntoDdoOrg = function(obj) {
	var deferred = Q.defer();

	var columns = "ddo_client_id, name, key, createdby, updatedby";

	var values = "(" + obj['ddo_client_id'] + ",'" + obj['company'] + "','" + obj['email'] + "',0,0)";

	scheduleModel.insertionQuery(obj, 'ddo_org', columns, 'ddo_org_id', 'ddoorg', values, deferred);

	return deferred.promise;
};

//Record insertion into ddo_role table
scheduleModel.insertIntoDdoRole = function(obj) {
	var deferred = Q.defer();

	var columns = "ddo_client_id, ddo_org_id, name, createdby, updatedby, key";

	var values = "";

	for(var i=0; i<roles.length; i++) {
		values += "(" + obj['ddo_client_id'] + "," + obj['ddo_org_id'] + ",'" + roles[i] + "',0,0,concat('" + roles[i] + "', '_' ,'" + obj['ddo_client_id'] + "')),";
	}

	values = values.slice(0, -1);

	scheduleModel.insertionQuery(obj, 'ddo_role', columns, 'ddo_role_id', 'ddorole', values, deferred);

	return deferred.promise;
};

//Record insertion into ddo_employee table
scheduleModel.insertIntoDdoemployee = function(obj) {
	var deferred = Q.defer();

	var columns = "ddo_client_id, ddo_org_id, firstname, lastname, email, employee_code, key, createdby, updatedby";

	var values = "(" + obj['ddo_client_id'] + "," + obj['ddo_org_id'] + ",'" + obj['firstname'] + "','" + obj['lastname'] + "','" + obj['email'] + "','" + obj['ddo_client_id'] + "','" + obj['email'] + "',0,0)";

	scheduleModel.insertionQuery(obj, 'ddo_employee', columns, 'ddo_employee_id', 'ddoemp', values, deferred);

	return deferred.promise;
};

//Record updation for employee_code into ddo_employee table
scheduleModel.updateIntoDdoemployee = function(obj) {
	var deferred = Q.defer();

	var conditions = "isactive='Y' and ddo_client_id=" + obj['ddo_client_id'] + " and ddo_org_id=" + obj['ddo_org_id'] + " and ddo_employee_id=" + obj['ddo_employee_id'];

	Util.getEmpCodeValue(obj['ddo_employee_id'], function(empcode) {
		var updateQuery = "UPDATE " + tables['ddoemp'] + " SET employee_code=" + empcode + " WHERE " + conditions;

		scheduleModel.updationQuery(obj, 'ddo_employee', updateQuery, deferred);
	});

	return deferred.promise;
};

//Record insertion into ddo_user table
scheduleModel.insertIntoDdoUser = function(obj) {
	var deferred = Q.defer();

	var columns = "ddo_client_id, ddo_org_id, ddo_employee_id, username, password, email, key, isadmin, createdby, updatedby";

	var password = Math.random().toString(36).substr(2, 10);

	obj['password'] = password;

	password = Util.encryptPassword(password);

	var username = obj['firstname'].split(" ")[0] + "." + obj['lastname'];

	obj['username'] = username;

	var values = "(" + obj['ddo_client_id'] + "," + obj['ddo_org_id'] + "," + obj['ddo_employee_id'] + ",'" + username + "','" + password + "','" + obj['email'] + "','" + obj['email'] + "','Y',0,0)";

	scheduleModel.insertionQuery(obj, 'ddo_user', columns, 'ddo_user_id', 'ddouser', values, deferred);

	return deferred.promise;
};

//Record insertion into ddo_userrole table
scheduleModel.insertIntoDdoUserRole = function(obj) {
	var deferred = Q.defer();

	var columns = "ddo_client_id, ddo_org_id, ddo_user_id, ddo_role_id, createdby, updatedby";

	var values = "";

	for(var i=0; i<2; i++) {
		values += "(" + obj['ddo_client_id'] + "," + obj['ddo_org_id'] + "," + obj['ddo_user_id'] + "," + ((obj['ddo_role_id']+i)) + ",0,0),";
	}

	values = values.slice(0, -1);

	scheduleModel.insertionQuery(obj, 'ddo_userrole', columns, 'ddo_userrole_id', 'ddouserrole', values, deferred);

	return deferred.promise;
};

//Record insertion into ddo_fyear table
scheduleModel.insertIntoDdoFYear = function(obj) {
	var deferred = Q.defer();

	var columns = "ddo_client_id, ddo_org_id, createdby, updatedby, startdate, enddate, name";

	var currentFullYear = new Date().getFullYear();

	var values = "";

	for(var i=0; i<5; i++) {
		var fyearName = "Jan-" + (currentFullYear+i) + ":Dec-" + (currentFullYear+i);

		values += "(" + obj['ddo_client_id'] + "," + obj['ddo_org_id'] + ",0,0,'" + (currentFullYear+i) + "-01-01'::date,'" + (currentFullYear+i) + "-12-31'::date,'" + fyearName + "'),";
	}

	values = values.slice(0, -1);

	console.log('values: ', values);

	scheduleModel.insertionQuery(obj, 'ddo_fyear', columns, 'ddo_fyear_id', 'ddofyear', values, deferred);

	return deferred.promise;
};

//Record insertion into ddo_wallet table
scheduleModel.insertIntoDdoWallet = function(obj) {
	var deferred = Q.defer();

	var columns = "ddo_client_id, ddo_org_id, createdby, updatedby, ddo_employee_id, ddo_fyear_id, points, reward_points, karma_points, sharable";

	Util.getWalletCalcPercent(0, 0, obj['client'], function(err, data) {
		if(err) {
			deferred.reject(new Error(err));
		} else {
			DEFAULT_WALLET_POINTS = data.defaultPoints;

			DEFAULT_WALLET_EMP_PERCENT = data.empPercent;
			DEFAULT_WALLET_MANAGER_PERCENT = data.managerPercent;
			DEFAULT_WALLET_MANAGER_MANAGER_PERCENT = data.managerManagerPercent;

			var values = "(" + obj['ddo_client_id'] + "," + obj['ddo_org_id'] + ",0,0," + obj['ddo_employee_id'] + "," + obj['ddo_fyear_id'] + "," + data.points + ",0,0,'Y')";

			scheduleModel.insertionQuery(obj, 'ddo_wallet', columns, 'ddo_wallet_id', 'ddowallet', values, deferred);
		}		
	});

	return deferred.promise;
};

//Record insertion into ddo_walletsettings table
scheduleModel.insertIntoDdoWalletSettings = function(obj) {
	var deferred = Q.defer();

	var columns = "ddo_client_id, ddo_org_id, createdby, updatedby, default_points, emp_percent, manager_percent, manager_manager_percent";

	var values = "(" + obj['ddo_client_id'] + "," + obj['ddo_org_id'] + ",0,0," + DEFAULT_WALLET_POINTS + "," + DEFAULT_WALLET_EMP_PERCENT + "," + DEFAULT_WALLET_MANAGER_PERCENT + "," + DEFAULT_WALLET_MANAGER_MANAGER_PERCENT + ")";

	scheduleModel.insertionQuery(obj, 'ddo_walletsettings', columns, 'ddo_walletsettings_id', 'ddowalletsettings', values, deferred);

	return deferred.promise;
};

//Record insertion into ddo_useraccess table
scheduleModel.insertIntoDdoUserAccess = function(obj) {
	var deferred = Q.defer();

	var columns = "ddo_client_id, ddo_org_id, ddo_role_id, appviewid, appviewname, allow, createdby, updatedby";

	var fetchAppViewsQuery = "SELECT * FROM " + DDO_APP_ACCESS_TABLE_NAME + " WHERE isactive='Y'";

    db.selectQuery(fetchAppViewsQuery, [], function(err, data) {
    	if(err) {
    		console.log(error("Fetch query for ddo_userviewaccess table -> "), err);
			deferred.reject(new Error(err));
    	} else {
    		var values = "";

    		for(var i=0; i<roles.length; i++) {
    			for(var j=0; j<data.length; j++) {
    				if(roles[i] == 'Admin') {
    					values += "(" +  + obj['ddo_client_id'] + "," + obj['ddo_org_id'] + "," + (obj['ddo_role_id']+i)  + "," + data[j]['app_view_id'] + ",'" + data[j]['app_view_name'] + "','Y',0,0),";
    				} else {
    					if(data[j]['app_view_name'] == 'Home' || data[j]['app_view_id'] == 1) {
    						values += "(" +  + obj['ddo_client_id'] + "," + obj['ddo_org_id'] + "," + (obj['ddo_role_id']+i)  + "," + data[j]['app_view_id'] + ",'" + data[j]['app_view_name'] + "','Y',0,0),";
    					}
    				}
    			}
    		}

    		values = values.slice(0, -1);

    		scheduleModel.insertionQuery(obj, 'ddo_userviewaccess', columns, 'ddo_userviewaccess_id', 'ddouserviewaccess', values, deferred);
    	}
    });	

	return deferred.promise;
};

//Record insertion into ddo_karmarating table
scheduleModel.insertIntoDdoKarmaRating = function(obj) {
	var deferred = Q.defer();

	var columns = "ddo_client_id, ddo_org_id, createdby, updatedby, name, imagepath";

	var values = "";

	for(var i=0,len=ratingNames.length; i<len; i++) {
		values += "(" + obj['ddo_client_id'] + "," + obj['ddo_org_id'] + ",0,0,'" + ratingNames[i] + "','" + imagePaths[i] + "'),";
	}

	values = values.slice(0, -1);

	scheduleModel.insertionQuery(obj, 'ddo_karmarating', columns, 'ddo_karmarating_id', 'ddokarmarating', values, deferred);

	return deferred.promise;
};

//Record insertion into ddo_karmacategory table
scheduleModel.insertIntoDdoKarmaCategory = function(obj) {
	var deferred = Q.defer();

	var columns = "ddo_client_id, ddo_org_id, createdby, updatedby, name";

	var values = "";

	for(var i=0,len=categoryNames.length; i<len; i++) {
		values += "(" + obj['ddo_client_id'] + "," + obj['ddo_org_id'] + ",0,0,'" + categoryNames[i] + "'),";
	}

	values = values.slice(0, -1);

	scheduleModel.insertionQuery(obj, 'ddo_karmacategory', columns, 'ddo_karmacategory_id', 'ddokarmacategory', values, deferred);

	return deferred.promise;
};

//Record insertion into ddo_karma table
scheduleModel.insertIntoDdoKarma = function(obj) {
	var deferred = Q.defer();

	var columns = "ddo_client_id, ddo_org_id, createdby, updatedby, name, ddo_karmacategory_id, ddo_wallet_id, isratingbased, autoapproval, isreference, ddo_karmarule_id";

	var values = "";

	var likeWalletId = 0;
	var categoryId = obj['ddo_karmacategory_id'];

	for(var i=0,len=karmaActivityNames.length; i<len; i++) {
		if(karmaActivityNames[i] == 'Ideate Like') {
			values += "(" + obj['ddo_client_id'] + "," + obj['ddo_org_id'] + ",0,0,'" + karmaActivityNames[i] + "'," + categoryId + ",0,'Y','N','Y',0),";
		} else if(karmaActivityNames[i] == 'Goal Achieved') {
			values += "(" + obj['ddo_client_id'] + "," + obj['ddo_org_id'] + ",0,0,'" + karmaActivityNames[i] + "'," + (Number(categoryId)+1) + ",0,'Y','N','N',0),";
		} else {
			values += "(" + obj['ddo_client_id'] + "," + obj['ddo_org_id'] + ",0,0,'" + karmaActivityNames[i] + "'," + categoryId + "," + obj['ddo_wallet_id'] + ",'Y','Y','Y',0),";
		}
	}

	values = values.slice(0, -1);

	scheduleModel.insertionQuery(obj, 'ddo_karma', columns, 'ddo_karma_id', 'ddokarma', values, deferred);

	return deferred.promise;
};

//Record insertion into ddo_karmaratings_instance table
scheduleModel.insertIntoDdoKarmaRatingsInstance = function(obj) {
	var deferred = Q.defer();

	var columns = "ddo_client_id, ddo_org_id, createdby, updatedby, ddo_karma_id, ddo_karmarating_id, karma_points, reward_points";

	var values = "";

	var karmaId = obj['ddo_karma_id'];
	var karmaRatingId = obj['ddo_karmarating_id'];

	for(var i=0,len=karmaActivityNames.length; i<len; i++) {
		for(var j=0,ln=ratingNames.length; j<ln; j++) {
			if(i == 0) {
				var points = 0;

				if(j>1) {
					points = (j-1);
				}

				values += "(" + obj['ddo_client_id'] + "," + obj['ddo_org_id'] + ",0,0," + (Number(karmaId)+Number(i)) + "," + (Number(karmaRatingId)+Number(j)) + "," + points + "," + points + "),";			
			} else if((i == (len-1)) && (j == (ln-1))) {
				values += "(" + obj['ddo_client_id'] + "," + obj['ddo_org_id'] + ",0,0," + (Number(karmaId)+Number(i)) + "," + (Number(karmaRatingId)+Number(j)) + "," + (j-1) + "," + (j-1) + "),";
			} else {
				//do nothing
			}
		}
	}

	values = values.slice(0, -1);

	scheduleModel.insertionQuery(obj, 'ddo_karmaratings_instance', columns, 'ddo_karmaratings_instance_id', 'ddokarmaratingsinstance', values, deferred);

	return deferred.promise;
};

//To update the isprocessed 'N' to 'Y' value from ddo_registration table
scheduleModel.updateIsProcessed = function(obj) {
	var deferred = Q.defer();

	var updateQuery = "UPDATE " + DDO_REG_TABLE_NAME + " SET isprocessed='Y' WHERE ddo_registration_id=" + obj['ddo_registration_id'];

	scheduleModel.updationQuery(obj, 'ddo_registration', updateQuery, deferred);

	return deferred.promise;
};

//Success of registration then proceeding with the forward mail
scheduleModel.successProcessMail = function(obj) {
	var deferred = Q.defer();

	var templateQuery = "SELECT body FROM " + DDO_EMAIL_TEMPLATE_TABLE_NAME + " WHERE ddo_emailtemplate_id=" + DEFAULT_EMAIL_TEMPLATE_ID;

	db.selectQuery(templateQuery, [], obj['client'], function(err, data) {
		if(err) {
			console.log(error("Failed to fetch email template in ddo_emailtemplate table -> "), err);
            deferred.reject(new Error(err));
		} else {
			if(data.length > 0) {
				var templateFilePath = data[0].body;

				fs.readFile(templateFilePath, 'utf8', function(err, contents) {     
	                var body = contents;

	                if (body.indexOf("{empname}") >= 0) {
	                    body = body.replace("{empname}", obj['firstname'] + " " + obj['lastname']);
	                }

	                if (body.indexOf("{ddo_url}") >= 0) {
	                    body = body.replace("{ddo_url}", DDO_URL_LINK_NAME);
	                }

	                if (body.indexOf("{username}") >= 0) {
	                    body = body.replace("{username}", obj['email']);
	                }
	                
	                if (body.indexOf("{password}") >= 0) {
	                    body = body.replace("{password}", obj['password']);
	                }

	                Util.sendMail(obj['email'], messages['confirmsubject'], body, null, function(err, data) {
				    	if(err) {
				    		scheduleModel.rollback(obj, err, "Failed to send confirmation mail!");
				    	} else {
				    		deferred.resolve(data);
				    	}
				    });
	            });
			} else {
				console.log(error("No records found in ddo_emailtemplate table "));
            	scheduleModel.rollback(obj, err, "No records found in ddo_emailtemplate table");
			}		
		}
	});

	return deferred.promise;
};

//To update the iserror 'Y' value from ddo_registration table
//When error occurs in registration
scheduleModel.updateIsError = function(obj, err) {
	var deferred = Q.defer();

	var updateQuery = "UPDATE " + DDO_REG_TABLE_NAME + " SET iserror='Y', error_message='" + err + "' WHERE ddo_registration_id=" + obj['ddo_registration_id'];

	obj['delsavepoint'] = true;

	obj['tx'].savepoint(obj['savepoint']);

	scheduleModel.updationQuery(obj, 'ddo_registration', updateQuery, deferred);

	return deferred.promise;
};

//Common insert query for schedular process
scheduleModel.insertionQuery = function(obj, table, columns, tablekeyid, tablename, values, deferred) {
	console.log(fetchcolor("Entered into " + table + " insertion fn!"));

	var insertionQuery = "INSERT INTO " + tables[tablename] + " (" + columns + ") VALUES " + values;

    console.log(fetchcolor(table + " insert query: %s"), insertionQuery);

	db.nonSelectQuery(insertionQuery, [], obj['client'], function(err, data) {
		if(err) {
			console.log(error("Failed to insert " + table + " query -> "), err);
    		deferred.reject(new Error(err));
		} else {
			if(data.length > 0) {
				obj[tablekeyid] = data[0][tablekeyid];				
			}

			console.log(fetchcolor(table + " data: "), data);
			deferred.resolve(data);		
		}
	});
};

//Common update query for schedular process
scheduleModel.updationQuery = function(obj, table, updationQuery, deferred) {
	console.log(fetchcolor("Entered into " + table + " updation fn!"));

	console.log(fetchcolor('Update query for ddo_registration isprocessed -> '), updationQuery);

	db.selectQuery(updationQuery, [], obj['client'], function(err, data) {
		if(err) {
			console.log(error("Failed to update isprocessed in " + table + " table -> "), err);
            deferred.reject(new Error(err));
		} else {
			deferred.resolve(data);

			if(obj['delsavepoint']) {
				scheduleModel.commitProcessed(obj, "Registration complete!");
			}
		}
	});
};

//Commit the transaction
scheduleModel.commitProcessed = function(obj, message) {
	console.log(fetchcolor('Commit Processed Complete!'));
    obj['tx'].commit(function(err) {

    	if(err) {
    		console.log(error(err));
    		scheduleModel.rollback(obj, err, "Failed to commit using schedular");
    	} else {
    		obj['done']();
        	console.log(response(message));  		
    	}
    });
};

//Rollback the transaction
scheduleModel.rollback = function(obj, err, message) {
	obj['tx'].rollback(obj['savepoint']);
    obj['tx'].release(obj['savepoint']);

    if(!obj['delsavepoint']) {
	    //If any error does exist,
	    //updating error message in ddo_registration table
	    scheduleModel.updateIsError(obj, err);    	
    } else {
    	obj['done']();
    }
};

module.exports = scheduleModel;