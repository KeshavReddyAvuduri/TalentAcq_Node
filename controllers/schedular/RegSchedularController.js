var Q = require("q");

//an object being exported
var regScheduleLogic = {};

//(#pre-includes)
//db usage file like connection, query passage, etc...,
var db = require("../../helpers/db/Postgres.js");

//get and update the nextvalue for given sequence name/id
var dbSeq = require("../../models/pgSeq.js");
var dbSequence = require("../../models/PgSequence.js");

//transaction for PG
var Transaction = require('pg-transaction');
var Util = require('../../helpers/Util.js');

//sequences names are being initialized in json
var jsonPackage = require("../../package.json");
var tables = require("../../helpers/Tables.json");

var sequences = require("../../helpers/Messages.json");
var karmaSetup = require("../../helpers/KarmaSetup.json");

//For error or success or anything else response color
var chalk = require('chalk');

//for error response color
var error = chalk.red;

//for success response color
var response = chalk.green;

//for query/no data/extra purpose color
var fetchcolor = chalk.blue;


/**
* ### Initial need values ###
*/
var roles = ['Admin', 'Employee'];

var ratingNames = ['Dull', 'Lazy', 'Good', 'Superb', 'Amazing'];

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
regScheduleLogic.onStartProcess = function() {
	var promises = [];

	//Check for isprocessed='N' in ddo_registration table
	var conditions = "isprocessed='N'";
	var regSelectQuery = "SELECT * FROM " + tables['ddoreg'] + " WHERE " + conditions;

	console.log(fetchcolor("Registration isprocessed N query ->"), regSelectQuery);

	db.select("engazewell", regSelectQuery, [], function(err, data) {
 		if (err) {
 			console.log(error("Got an Error while fetching records from DDO_Registration!!"), err);
 		} else {
 			if(data.length > 0) {
 				console.log(response("Fetched the records successfully -> "), data);

	 			var result = Q();

	 			data.forEach(function(rec) {
	 				result = result.then(regScheduleLogic.processRegistraion(rec));
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
regScheduleLogic.processRegistraion = function(obj) {
	var deferred = Q.defer();

	console.log(fetchcolor("Process Registration Begins:::"));

	db.connect('engazewell', function(err, client, done){
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
			regScheduleLogic.insertIntoDdoClient(obj)
				//Ddo_org record insertion
				.then(function(data) {
					return regScheduleLogic.insertIntoDdoOrg(obj);
				})
				//Ddo_role record insertion
				.then(function(data) {
					return regScheduleLogic.insertIntoDdoRole(obj);
				})
				//Ddo_employee record insertion
				.then(function(data) {
					return regScheduleLogic.insertIntoDdoemployee(obj);
				})
				//Ddo_user record insertion
				.then(function(data) {
					return regScheduleLogic.insertIntoDdoUser(obj);
				})
				//Ddo_userrole record insertion
				.then(function(data) {
					return regScheduleLogic.insertIntoDdoUserRole(obj);
				})
				/**
				* Need to be added at further
				* Further tables are let out operations to be performed
				* (#) -> ddo_karmarating, ddo_karmacategory, ddo_karma, ddo_karmaratinginstance
				*/
				// // DDO_registration record updation
				.then(function(data) {
					return regScheduleLogic.updateIsProcessed(obj);
				})
				//commit processed
				.then(function(data) {
					console.log(response("Committed!"));
					regScheduleLogic.commitProcessed(obj, "Registration complete!");
					deferred.resolve(data);
					return deferred.promise;
				})
				//Exception stackoverflow
				.catch(function(err) {
					console.log(error("Error in SEQUENCE Promise!!"), err);
					regScheduleLogic.rollback(obj, err, "Error in SEQUENCE Promise!!");
				})
				.done();
        }
	});

	return deferred.promise;
};

//Record insertion into ddo_client table
regScheduleLogic.insertIntoDdoClient = function(obj) {
	var deferred = Q.defer();

	var columns = "name, firstname, lastname, email, designation, key, createdby, updatedby";

	var values = "('" + obj['company'] + "','" + obj['firstname'] + "','" + obj['lastname'] + "','" + obj['email'] + "','" + obj['designation'] + "','" + obj['email'] + "',0,0)";

	regScheduleLogic.insertionQuery(obj, deferred, 'ddo_client', columns, 'ddoclient', values);

	return deferred.promise;
};

//Record insertion into ddo_org table
regScheduleLogic.insertIntoDdoOrg = function(obj) {
	var deferred = Q.defer();

	var columns = "ddo_client_id, name, key, createdby, updatedby";

	Util.getNextSeqValue('ddo_client_id', tables['ddoclient'], obj['client'], function(err, nextvalue) {
		if(err) {
			console.log(error("Failed to get next value for ddoclient insertion!"), err);
            regScheduleLogic.rollback(obj, err, "Failed to get next value for ddoclient insertion!");
		} else {
			obj['ddo_client_id'] = nextvalue;

			var values = "(" + nextvalue + ",'" + obj['company'] + "','" + obj['email'] + "',0,0)";

			regScheduleLogic.insertionQuery(obj, deferred, 'ddo_org', columns, 'ddoorg', values);
		}
	});

	return deferred.promise;
};

//Record insertion into ddo_role table
regScheduleLogic.insertIntoDdoRole = function(obj) {
	var deferred = Q.defer();

	var columns = "ddo_client_id, ddo_org_id, name, createdby, updatedby";

	Util.getNextSeqValue('ddo_org_id', tables['ddoorg'], obj['client'], function(err, nextvalue) {
		if(err) {
			console.log(error("Failed to get next value for ddo_org insertion!"), err);
            regScheduleLogic.rollback(obj, err, "Failed to get next value for ddo_org insertion!");
		} else {
			obj['ddo_org_id'] = nextvalue;

			var values = "";

			for(var i=0; i<roles.length; i++) {
				values += "(" + obj['ddo_client_id'] + "," + nextvalue + ",'" + roles[i] + "',0,0),";
			}

			values = values.slice(0, -1);

			regScheduleLogic.insertionQuery(obj, deferred, 'ddo_role', columns, 'ddorole', values);
		}
	});

	return deferred.promise;
};

//Record insertion into ddo_employee table
regScheduleLogic.insertIntoDdoemployee = function(obj) {
	var deferred = Q.defer();

	var columns = "ddo_client_id, ddo_org_id, firstname, lastname, email, employee_code, key, createdby, updatedby";

	Util.getEmpCodeValue(obj['client'], function(err, nextvalue) {
		if(err) {
			console.log(error("Failed to get next value for ddo_employee insertion!"), err);
            regScheduleLogic.rollback(obj, err, "Failed to get next value for ddo_employee insertion!");
		} else {
			obj['ddo_employee_code'] = nextvalue;

			var values = "(" + obj['ddo_client_id'] + "," + obj['ddo_org_id'] + ",'" + obj['firstname'] + "','" + obj['lastname'] + "','" + obj['email'] + "','" + nextvalue + "','" + obj['email'] + "',0,0)";

			regScheduleLogic.insertionQuery(obj, deferred, 'ddo_employee', columns, 'ddoemp', values);
		}		
	});

	return deferred.promise;
};

//Record insertion into ddo_user table
regScheduleLogic.insertIntoDdoUser = function(obj) {
	var deferred = Q.defer();

	var columns = "ddo_client_id, ddo_org_id, ddo_employee_id, username, password, email, key, isadmin, createdby, updatedby";

	var password = Math.random().toString(36).substr(2, 10);

	Util.getNextSeqValue('ddo_employee_id', tables['ddoemp'], obj['client'], function(err, nextvalue) {
		if(err) {
			console.log(error("Failed to get next value for ddo_employee insertion!"), err);
            regScheduleLogic.rollback(obj, err, "Failed to get next value for ddo_employee insertion!");
		} else {
			obj['ddo_employee_id'] = nextvalue;

			var username = obj['firstname'].split(" ")[0] + "." + obj['lastname'];

			var values = "(" + obj['ddo_client_id'] + "," + obj['ddo_org_id'] + "," + nextvalue + ",'" + username + "','" + password + "','" + obj['email'] + "','" + obj['email'] + "','Y',0,0)";

			regScheduleLogic.insertionQuery(obj, deferred, 'ddo_user', columns, 'ddouser', values);
		}
	});

	return deferred.promise;
};

//Record insertion into ddo_userrole table
regScheduleLogic.insertIntoDdoUserRole = function(obj) {
	var deferred = Q.defer();

	var columns = "ddo_client_id, ddo_org_id, ddo_user_id, ddo_role_id, createdby, updatedby";

	Util.getNextSeqValue('ddo_user_id', tables['ddouser'], obj['client'], function(err, nextvalue) {
		if(err) {
			console.log(error("Failed to get next value for ddo_user insertion!"), err);
            regScheduleLogic.rollback(obj, err, "Failed to get next value for ddo_user insertion!");
		} else {
			obj['ddo_user_id'] = nextvalue;

			Util.getNextSeqValue('ddo_role_id', tables['ddorole'], obj['client'], function(err, valuenext) {
				if(err) {
					console.log(error("Failed to get next value for ddorole insertion!"), err);
		            regScheduleLogic.rollback(obj, err, "Failed to get next value for ddorole insertion!");
				} else {
					obj['ddo_role_id'] = valuenext;

					var values = "";

					for(var i=0; i<2; i++) {
						values += "(" + obj['ddo_client_id'] + "," + obj['ddo_org_id'] + "," + obj['ddo_user_id'] + "," + ((obj['ddo_role_id']+i)-1) + ",0,0),";
					}

					values = values.slice(0, -1);

					regScheduleLogic.insertionQuery(obj, deferred, 'ddo_userrole', columns, 'ddouserrole', values);
				}
			});
		}
	});

	return deferred.promise;
};

//To update the isprocessed 'N' to 'Y' value from ddo_registration table
regScheduleLogic.updateIsProcessed = function(obj) {
	var updateQuery = "update " + tables['ddoreg'] + " set isprocessed='Y' where ddo_registration_id=" + obj['ddo_registration_id'];

	regScheduleLogic.updationQuery(obj, 'ddo_registration', updateQuery);
};

//To update the iserror 'Y' value from ddo_registration table
//When error occurs in registration
regScheduleLogic.updateIsError = function(obj, err) {
	var updateQuery = "update " + tables['ddoreg'] + " set iserror='Y' and error_message=" + err + " where ddo_registration_id=" + obj['ddo_registration_id'];

	regScheduleLogic.updationQuery(obj, 'ddo_registration', updateQuery);
};

//Common insert query for schedular process
regScheduleLogic.insertionQuery = function(obj, deferred, table, columns, tablename, values) {
	console.log(fetchcolor("Entered into " + table + " insertion fn!"));

	var insertionQuery = "INSERT INTO " + tables[tablename] + " (" + columns + ") VALUES " + values;

    console.log(fetchcolor(table + " insert query: %s"), insertionQuery);

	db.select('engazewell', insertionQuery, [], obj['client'], function(err, data) {
		if(err) {
			console.log(error("Failed to insert " + table + " query -> "), err);
    		regScheduleLogic.rollback(obj, err, "Failed to insert " + table + " query");
		} else {
			console.log(fetchcolor(table + " data: "), data);
			deferred.resolve(data);    				
		}
	});
};

//Common update query for schedular process
regScheduleLogic.updationQuery = function(obj, table, updationQuery) {
	var deferred = Q.defer();

	console.log(fetchcolor("Entered into " + table + " updation fn!"));

	console.log(fetchcolor('Update query for ddo_registration isprocessed -> '), updationQuery);

	db.select('engazewell', updationQuery, [], obj['client'], function(err, data) {
		if(err) {
			console.log(error("Failed to update isprocessed in " + table + " table -> "), err);
            regScheduleLogic.rollback(obj, err, "Failed to update isprocessed in " + table + " table");
		} else {
			deferred.resolve(data);
		}
	});

    return deferred.promise;
};

//Commit the transaction
regScheduleLogic.commitProcessed = function(obj, message) {
	console.log(fetchcolor('Commit Processed Complete!'));
    obj['tx'].commit(function(err) {

    	if(err) {
    		console.log(error(err));
    	} else {
        	console.log(response(message));  		
    	}
    	obj['done']();
    });
};

//Rollback the transaction
regScheduleLogic.rollback = function(obj, err, message) {
	obj['tx'].rollback(obj['savepoint']);
    obj['tx'].release(obj['savepoint']);

    //If any error does exist,
    //updating error message in ddo_registration table
    regScheduleLogic.updateIsError(obj, err);
};

module.exports = regScheduleLogic;