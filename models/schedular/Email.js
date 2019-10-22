var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var configPackage = require('../../package.json');

var Q = require("q");
var emailModel = {};
var db = require("../../helpers/db/Postgres.js");
var Transaction = require('pg-transaction');
var Util = require('../../helpers/Util.js');
var messages = require("../../helpers/Messages.json");

var hbs = require('nodemailer-express-handlebars');
var fs = require('fs');
var os = require("os");

//For error or success or anything else response color
var chalk = require('chalk');

//for error response color
var error = chalk.red;

//for success response color
var response = chalk.green;

//for query/no data/extra purpose color
var fetchcolor = chalk.blue;

var transporter;

emailModel.onStartProcess = function() {

    console.log("onStartProcess function for SendMail Process in SchedularModel");

    var promises = [];
    var doc;
    var email;
    var title;
    var body;
    var errorcount;
    var condition = "ch.processed = 'N' AND ch.errorcount >0";

    var query = "SELECT " + " ch.errorcount, ch.ddo_compaignemails_history_id AS compaignhistoryid, ch.ddo_compaign_id AS compaignid, ch.tolist AS toemailid," + " ch.cclist, c.ddo_emailtemplate_id AS templateid, t.title, t.body, ch.emailcontent_info" + " FROM ddo_compaignemails_history ch " + " LEFT JOIN ddo_compaign c ON c.compaign_ruleid = ch.ddo_compaign_id" + " LEFT JOIN ddo_emailtemplate t ON t.ddo_emailtemplate_id = c.ddo_emailtemplate_id" + " WHERE " + condition;
    
    console.log('email query is', query);

    db.selectQuery(query, [], function(err, data) {
        if (err) {
            console.log(error("error while fetching emailids!!"), err);
        } else {
            var ln = data.length;
            if (ln > 0) {
                console.log("*********",data);
                
                transporter= nodemailer.createTransport(smtpTransport({
                    host: 'smtp.gmail.com',
                    port: 587,
                    secure: true,
                    service: 'Gmail',
                    pool:true,
                    auth: {
                        user: configPackage.config.req_mail,
                        pass: configPackage.config.req_mail_pass
                    }
                }));
                transporter.use('compile', hbs({
                    viewPath: './templates',
                    extName: '.hbs'
                }));

                for (var i = 0; i < ln; i++) {
                    doc = data[i];
                    email = doc.toemailid;
                    title = doc.title;
                    body = doc.body;
                    errorcount = doc.errorcount;
                    promises.push(emailModel.sendMail(email, title, body, doc, errorcount));

                }

                Q.all(promises).then(function(data) {
                    if(transporter) transporter.close();
                    console.log("Successfully Sent Emails and updated compaignHistory!!");
                }).catch(function(err) {
                    if(transporter) transporter.close();
                    console.log("Got Error!!", err);
                }).done();
            } else {
                console.log(fetchcolor('None to be found for the start process!'));
            }
        }
    });
};

emailModel.sendMail = function(toemail, subject, emailbody, doc, errorcount) {

    console.log('Entered into sendMail Promise Function');

    var deferred = Q.defer();
    var updateobj = {};
    // var transporter= nodemailer.createTransport(smtpTransport({
    //         host: 'smtp.gmail.com',
    //         port: 587,
    //         secure: true,
    //         service: 'Gmail',
    //         // pool:true,
    //         auth: {
    //             user: configPackage.config.req_mail,
    //             pass: configPackage.config.req_mail_pass
    //         }
    //     }));

    


    db.connect(function(err, client, done) {
        if (err) {
            console.log("Error while connection!!", err);
        }
        var tx = new Transaction(client);

        tx.begin();

        //Initializing an object
        var txobj = {};

        txobj['tx'] = tx;


        txobj['done'] = done;

        txobj['client'] = client;

        txobj['savepoint'] = 'employeegoal';

        tx.savepoint(txobj['savepoint']);

        fs.readFile(emailbody, 'utf8', function(err, contents) {
            if (err) {
                console.log("Error reading templates!!", err);
            } else {

                if(doc.templateid == 6){
                    var arr =[],
                        i=0;
                        arr =  doc.emailcontent_info;

                        var str = "<table><tbody><tr><th>Karma Rank</th><th>Name</th><th>Karma Points</th></tr>";
                    for(i=0;i<arr.length;i++){
                        console.log(" reading templates!!", arr[i]); 
                      str +="<tr><td>"+arr[i].karmarank+"</td><td>"+arr[i].emp_fullname+"</td><td>"+arr[i].karmapoints+"</td></tr>";
                    }
                    str +="</tbody></table>";

                }


                var body = contents;

                if(body.indexOf("{topTen}")){
                   body = body.replace("{topTen}",str); 
                }

                if (body.indexOf("{empfirstname}") >= 0) {
                    body = body.replace("{empfirstname}", doc.emailcontent_info.empFirstName);
                }

                if (body.indexOf("{empkarmascore}") >= 0) {
                    body = body.replace("{empkarmascore}", doc.emailcontent_info.empKarmaPoints);
                }

                if (body.indexOf("{empkarmapointsexpiredate}") >= 0) {
                    body = body.replace("{empkarmapointsexpiredate}", doc.emailcontent_info.empKarmaWalletEndDate);
                }

                if (body.indexOf("{empcompanyname}") >= 0) {
                    body = body.replace("{empcompanyname}", doc.emailcontent_info.empCompanyName);
                }

                if (body.indexOf("{empcurrentrank}") >= 0) {
                    body = body.replace("{empcurrentrank}", doc.emailcontent_info.empCurrentRank);
                }

                if (body.indexOf("{emppreviousrank}") >= 0) {
                    body = body.replace("{emppreviousrank}", doc.emailcontent_info.empPreviousRank);
                }

                if (body.indexOf("{empkarmadifference}") >= 0) {
                    body = body.replace("{empkarmadifference}", (doc.emailcontent_info.empPreviousRank - doc.emailcontent_info.empCurrentRank));
                }

                if (body.indexOf("{emplastupdatedate}") >= 0) {
                    body = body.replace("{emplastupdatedate}", doc.emailcontent_info.empLastUpdateDate);
                }

                if (body.indexOf("{pathurl}") >= 0) {

                    body = body.replace("{pathurl}", (configPackage.config.host + doc.emailcontent_info.empCompanyLogo));
                }
                if (body.indexOf("{appreciatedempname}") >= 0) {
                    body = body.replace("{appreciatedempname}", doc.emailcontent_info.appreciatedempname);
                }
                 if (body.indexOf("{selectedkarma}") >= 0) {
                    body = body.replace("{selectedkarma}", doc.emailcontent_info.selectedkarma);
                }
                if (body.indexOf("{addedscore}") >= 0) {
                    body = body.replace("{addedscore}", doc.emailcontent_info.addedscore);
                }
                if (body.indexOf("{karmamessage}") >= 0) {
                    body = body.replace("{karmamessage}", doc.emailcontent_info.karmamessage);
                }

                var mailOptions = {
                    from: configPackage.config.req_mail,
                    to: toemail,
                    subject: subject,
                    html: body
                };

                transporter.sendMail(mailOptions, function(error, info) {
                    if (error) {

                        console.log("Error while sending mail!!", error);
                        updateobj.error = error;

                    } else {
                        // transporter.close();
                        updateobj.success = true;

                        emailModel.updateCompaignHistory(toemail, errorcount, txobj, updateobj).then(function(data) {
                            var success = true;
                            deferred.resolve(success);

                        }).catch(function(err) {
                            deferred.reject(err);
                        }).done();
                    }
                });
            }
        });

    });
    return deferred.promise;
};



emailModel.updateCompaignHistory = function(toemail, errorcount, txobj, updateobj) {

    console.log("updateCompaignHistory Promise Function!!");

    var deferred = Q.defer();

    var table = "ddo_compaignemails_history";

    var updateQuery;

    if (updateobj.error) {

        console.log("Error!!");

        updateQuery = "UPDATE " + table + " SET updated = '" + Util.getCurrentDateAndTime() + "'," + " iserror = 'Y'," + " errmessage = '" + updateobj.error + "'," + " errorcount = " + Number(errorcount - 1) + " WHERE tolist = '" + toemail + "'";

    } else if (updateobj.success) {

        console.log("Success!!");

        updateQuery = "UPDATE " + table + " SET updated = '" + Util.getCurrentDateAndTime() + "'," + " processed = 'Y'" + " WHERE tolist = '" + toemail + "'";

    }
    console.log("updateQuery: ", updateQuery);

    db.nonSelectQuery(updateQuery, [], txobj['client'], function(err, goalData) {
        if (err) {
            console.log("Error while updating Compaign History!!", err);
            deferred.reject(err);
            Util.rollbackFn(txobj, err, 'Fail to update Compaign History!!');
        }
        //obj.ddo_employeegoal_id = goalData[0].ddo_employeegoal_id;
        var message = "Successfully Compaign History is updated!";
        Util.commitFn(txobj, "Successfully Compaign History is updated!");

        var success = true;
        deferred.resolve(success);

    });
    return deferred.promise;
};

module.exports = emailModel;
