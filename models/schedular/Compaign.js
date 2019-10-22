var Q = require("q");
var compaignModel = {};
var db = require("../../helpers/db/Postgres.js");
var Transaction = require('pg-transaction');
var Util = require('../../helpers/Util.js');
var messages = require("../../helpers/Messages.json");

//For error or success or anything else response color
var chalk = require('chalk');

//for error response color
var error = chalk.red;

//for success response color
var response = chalk.green;

//for query/no data/extra purpose color
var fetchcolor = chalk.blue;

compaignModel.onStartProcess = function () {

    var promises = [];

    var compaignQuery = "SELECT compaign.compaign_ruleId, compaign.rule, compaign.name, compaign.lastrun, compaign.period from ddo_compaign compaign";

    db.selectQuery(compaignQuery, [], function (err, data) {
        console.log("query for getting the compaing records", compaignQuery);
        if (err) {
            console.log(error("error while getting the compaign"), err);
        } else {
            if (data.length > 0) {
                console.log('data for compaign is', data);

                for (var i = 0; i < data.length; i++) {
                    var lastRun = data[i].lastrun;

                    promises.push(compaignModel.calculateCompaignRules(data[i].compaign_ruleid, lastRun, data[i].rule, data[i].period));
                }

                Q.all(promises).then(function (data) {
                    console.log("successfully Done!!");
                }).catch(function (err) {
                    console.log("Got Error", err);
                }).done();

            } else {
                console.log(fetchcolor('None to be found for the start process!'));
            }
        }
    });
};

compaignModel.callCompaignRules = function (compaignRuleId) {

    console.log("callCompaignRules Promise Function");

    var deferred = Q.defer();
    var compaignRuleQuery;

    //var compaignRuleQuery1 = "select * FROM ddo_current_karmascore_v WHERE karmapoints = 0";
    
    var compaignRuleQuery1 = "SELECT v.ddo_employee_id, v.emp_fullname, v.emp_firstname, v.emp_email, v.karmapoints, v.companylogo, v.companyname,"
                            + " CASE WHEN COALESCE(wallet.updated, fyear.startdate)::date IS NULL THEN de.joiningdate ELSE COALESCE(wallet.updated, fyear.startdate)::date END AS lastupdateddate"
                            + " FROM ddo_current_karmascore_v v"
                            + " LEFT JOIN ddo_wallet wallet ON wallet.ddo_employee_id = v.ddo_employee_id"
                            + " LEFT JOIN ddo_fyear fyear ON fyear.ddo_fyear_id = wallet.ddo_fyear_id"
                            + "  LEFT JOIN ddo_empworkdetails de ON de.ddo_employee_id = v.ddo_employee_id"
                            + " WHERE karmapoints = 0"

    var compaignRuleQuery2 = "SELECT wallet.points AS karmapoints, employee.email as emp_email, CONCAT(employee.firstname, ' ', employee.lastname) as emp_fullname,"
                            + " employee.firstname as emp_firstname, c.logo_url as companylogo, c.name as companyname, fyear.enddate::date as karmawalletenddate,"
                            + " (fyear.enddate - (select now()::date)) as days" 
                            + " FROM ddo_wallet wallet" 
                            + " LEFT JOIN ddo_employee employee ON employee.ddo_employee_id = wallet.ddo_employee_id"
                            + " LEFT JOIN ddo_client c ON c.ddo_client_id = employee.ddo_client_id"
                            + " LEFT JOIN ddo_fyear fyear ON fyear.ddo_fyear_id = wallet.ddo_fyear_id"
                            + " WHERE (fyear.enddate - (select now()::date)) <= 90 AND (fyear.enddate - (select now()::date)) >= 1 AND wallet.points > 0";

    var compaignRuleQuery3 = "select * FROM ddo_previous_karmascore_v WHERE karmapoints = 0";


    var compaignRuleQuery4 = "SELECT row_number() OVER (ORDER BY (k.karmapoints) DESC) AS karmarank, * FROM "
            + " ddo_current_karmascore_v k WHERE k.karmapoints < 160 ORDER BY k.karmapoints Desc";

    /*var compaignRuleQuery5 = "SELECT row_number() OVER (ORDER BY (points) DESC) AS karmarank, wallet.points AS karmapoints, "
                            + " CONCAT(employee.firstname, ' ', employee.lastname) AS emp_fullname, employee.email as emp_email,"
                            + " employee.firstname as emp_firstname, c.name as companyname, COALESCE(c.logo_url, 'resources/images/engazewell_logo_head.png'::character varying) AS companylogo"
                            + " from ddo_wallet wallet"
                            + " LEFT JOIN ddo_employee employee ON employee.ddo_employee_id = wallet.ddo_employee_id"
                            + " LEFT JOIN ddo_client c ON c.ddo_client_id = employee.ddo_client_id"
                            + " ORDER BY points Desc Limit 10";
*/    var compaignRuleQuery5 = "select row_number() OVER (ORDER BY (sum(krw.karma_points)) DESC) AS karmarank, sum(krw.karma_points) as karmapoints,(date_trunc('month', CURRENT_DATE) + interval '1 month - 1 day')::date, date_trunc('month', CURRENT_DATE)::date, CONCAT(employee.firstname, ' ', employee.lastname) AS emp_fullname,employee.email as emp_email,employee.firstname as emp_firstname,c.name as companyname, COALESCE(c.logo_url, 'resources/images/engazewell_logo_head.png'::character varying) AS companylogo"
       +" from ddo_karmarewardhistory krw "
       +" LEFT JOIN ddo_wallet dw ON dw.ddo_wallet_id=krw.ddo_wallet_id"
       +" LEFT JOIN ddo_employee employee ON employee.ddo_employee_id = dw.ddo_employee_id" 
       +" LEFT JOIN ddo_client c ON c.ddo_client_id = employee.ddo_client_id"
       +" where krw.ddo_client_id=11 and krw.ddo_org_id=1000001 and"
       +" krw.created::timestamp::date  between date_trunc('month', CURRENT_DATE)::date AND (date_trunc('month', CURRENT_DATE) + interval '1 month - 1 day')::date GROUP BY employee.ddo_employee_id,c.ddo_client_id LIMIT 10"

    var compaignRuleQuery6 = "SELECT * from ddo_diff_karmascore_v WHERE current_karmarank < previous_karmarank"; 

    if (compaignRuleId == 1) {
        compaignRuleQuery = compaignRuleQuery1;
    } else if (compaignRuleId == 2) {
        compaignRuleQuery = compaignRuleQuery2;
    } else if (compaignRuleId == 3) {
        compaignRuleQuery = compaignRuleQuery3;
    } else if (compaignRuleId == 4) {
        compaignRuleQuery = compaignRuleQuery4;
    } else if (compaignRuleId == 5) {
        compaignRuleQuery = compaignRuleQuery5;
    } else if (compaignRuleId == 6) {
        compaignRuleQuery = compaignRuleQuery6;
    } 
    
    console.log(compaignRuleId, compaignRuleQuery);

    db.selectQuery(compaignRuleQuery, [], function (err, data) {
        console.log("query for dynamic query generation", compaignRuleQuery);
        if (err) {
            console.log(error("error while getting the compaign rule "), err);
            deferred.reject(err);

        } else {
            
            if (data.length > 0) {
                var obj = {};
                if(compaignRuleId == 5){
                 obj.topKarmaData = JSON.stringify(data);
            }else{

                var tolist = [];
                var cclist = [];
                var karmascore = [];
                var karma_rank = [];
                var empfullName = [];
                var empfirstName = [];
                var companyLogo = [];
                var karmaWalletEndDate = [];
                var companyName = [];
                var currentRank = [];
                var previousRank = [];
                var lastUpdateDate = [];

                for (var i = 0; i < data.length ; i++) {//data.length
                    var emp_fullname = data[i].emp_fullname || null;
                    var emp_firstname = data[i].emp_firstname || null;
                    var score = data[i].points || data[i].karmapoints || null;
                    var rank = data[i].karmarank || null;
                    var companylogo = data[i].companylogo || null;
                    var karmawalletenddate = data[i].karmawalletenddate || null;
                    var companyname = data[i].companyname || null;
                    var currentkarmarank = data[i].current_karmarank || null;
                    var previouskarmarank = data[i].previous_karmarank || null;
                    var lastupdatedate = data[i].lastupdateddate || null;
                    
                    tolist.push(data[i].emp_email);
                    karmascore.push(score);
                    karma_rank.push(rank);
                    empfullName.push(emp_fullname);
                    empfirstName.push(emp_firstname);
                    companyLogo.push(companylogo);
                    karmaWalletEndDate.push(karmawalletenddate);
                    companyName.push(companyname);
                    currentRank.push(currentkarmarank);
                    previousRank.push(previouskarmarank);
                    lastUpdateDate.push(lastupdatedate);
                }
                
                
                obj.tolist = tolist;
                obj.cclist = cclist;
                obj.karmascore = karmascore;
                obj.karma_rank = karma_rank;
                obj.empfullname = empfullName;
                obj.empfirstname = empfirstName;
                obj.companylogo = companyLogo;
                obj.karmawalletenddate = karmaWalletEndDate;
                obj.companyname = companyName;
                obj.currentkarmarank = currentRank;
                obj.previouskarmarank = previousRank;
                obj.lastupdatedate = lastUpdateDate;

            }
                deferred.resolve(obj);
            } else {
                console.log(fetchcolor('None to be found for the start process!'));
            }
        }
    });
    return deferred.promise;
};

compaignModel.insertCompaignData = function (compaignData, compaignId) {

    var deferred = Q.defer();

    console.log("insertCompaignData Promise function");

    var deferred = Q.defer();

    var selectQuery = "select c.ddo_emailtemplate_id, e.body, e.title "
    + " FROM ddo_compaign c "
    + " LEFT JOIN ddo_emailtemplate e ON e.ddo_emailtemplate_id = c.ddo_emailtemplate_id "
    + " WHERE c.compaign_ruleid = " + compaignId;

    db.selectQuery(selectQuery, [], function (err, emaildata) {
        
        if (err) {

        } else {
            console.log(compaignId, compaignData);
            var static_mail = 'suresh.tatikonda@walkingtree.tech';
            var values = '';
            if(compaignData.topKarmaData){
               values = "(" + compaignId + ", '" + static_mail + "', '"+ compaignData.topKarmaData +"')"; 

            }else{



            for (var i = 0; i < compaignData.tolist.length; i++) {//compaignData.tolist.length

                var content = {};
                var endDate = compaignData.karmawalletenddate[i];
                console.log("endDate",endDate)

                content  = {
                    empFullName: compaignData.empfullname[i] || null,
                    empFirstName: compaignData.empfirstname[i] || null,
                    empKarmaPoints: compaignData.karmascore[i] || null,
                    empLastUpdateDate: compaignData.lastupdatedate[i] || null,
                    empCompanyLogo: compaignData.companylogo[i] || null,
                    //empKarmaWalletEndDate: compaignData.karmawalletenddate[i] || null,
                    empKarmaWalletEndDate : (endDate)? ((endDate.getFullYear()) + '-' + (endDate.getMonth() + 1) + '-' +(endDate.getDate())):new Date(),
                    empCompanyName: compaignData.companyname[i] || null,
                    empCurrentRank: compaignData.currentkarmarank[i] || null,
                    empPreviousRank: compaignData.previouskarmarank[i] || null
                };
                
                var formatContent = JSON.stringify(content);
                
                console.log("content data is", formatContent);

                values += "(" + compaignId + ", '" + compaignData.tolist[i] + "', '"+ formatContent +"')";

                if (i != compaignData.tolist.length - 1) {//compaignData.tolist.length - 1
                    values += ', ';
                }
            }
            }
            var insertCompaignQuery = "Insert into ddo_compaignemails_history(ddo_compaign_id, tolist, emailcontent_info) values " + values;

            console.log('query for inserting compaign', insertCompaignQuery);

            db.nonSelectMultipleQuery(insertCompaignQuery, [], function (err, data) {
                if (err) {
                    console.log(error("error while inserting the compaigndata"), err);
                    deferred.reject(err);
                } else {
                    if (data) {
                        deferred.resolve(compaignId);
                    }
                }
            });
        }
    });
            
    return deferred.promise;
};

compaignModel.updateCompaignRecord = function (compaignId) {

    console.log("updateCompaignRecord Promise function");

    var deferred = Q.defer();

    var updateCompaignQuery = "UPDATE ddo_compaign SET lastrun = '" + Util.getCurrentDateAndTime() + "' WHERE compaign_ruleId = " + compaignId;

    console.log("Query for update the compaign record", updateCompaignQuery);

    db.nonSelectQuery(updateCompaignQuery, [], function (err, data) {
        if (err) {
            console.log(error("error while updating the compaign record"), err);
            deferred.reject(err);

        } else {
            console.log('compaign record updated successfully');
            var success = true;
            deferred.resolve(success);
        }
    });
    return deferred.promise;
};

compaignModel.calculateCompaignRules = function (compaignRuleId, lastRun, rule, period) {

    console.log("calculateCompaignRules Promise Function", compaignRuleId);

    var deferred = Q.defer();
    var currentDate = new Date();
    var diff = Math.floor(currentDate.getTime() - lastRun.getTime());
    var day = 1000 * 60 * 60 * 24;
    var days = Math.floor(diff / day);
    var weeks = Math.floor(days / 7);
    var months = Math.floor(days / 31);
    var years = Math.floor(months / 12);

    console.log("months@@@@@@@@@@@@@@@@",months);

    if (rule === 'Monthly') {
        if (months >= period) {
            console.log('compaign rule id for monthly is', compaignRuleId)
            compaignModel.callCompaignRules(compaignRuleId).then(function (data) {
                return compaignModel.processCompaign(data, compaignRuleId);
            }).then(function (data) {
                deferred.resolve(data);
            }).catch(function (err) {
                deferred.reject(err);
            }).done();
        }
    } else if (rule === 'Weekly') {
        console.log('compaing for weekly');
        if (weeks >= period) {
            console.log('compaign rule id for weekly is', compaignRuleId)
            compaignModel.callCompaignRules(compaignRuleId).then(function (data) {
                return compaignModel.processCompaign(data, compaignRuleId);
            }).then(function (data) {
                deferred.resolve(data);
            }).catch(function (err) {
                deferred.reject(err);
            }).done();
        }
    } else if (rule >= 'Yearly') {
        if (years == period) {
            console.log('compaign rule id for yearly is', compaignRuleId)
            compaignModel.callCompaignRules(compaignRuleId).then(function (data) {
                return compaignModel.processCompaign(data, compaignRuleId);
            }).then(function (data) {
                deferred.resolve(data);
            }).catch(function (err) {
                deferred.reject(err);
            }).done();
        }
    }
    return deferred.promise;
};

compaignModel.processCompaign = function (compaignData, id) {

    var deferred = Q.defer();

    compaignModel.insertCompaignData(compaignData, id).then(function (data) {
        return compaignModel.updateCompaignRecord(id);
    }).then(function (data) {
        var success = true;
        deferred.resolve(success);
    }).catch(function (err) {
        deferred.reject(err);
    }).done();

    return deferred.promise;
};

module.exports = compaignModel;