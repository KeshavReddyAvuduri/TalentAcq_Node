//for Promise
var Q = require("q");

var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

//New ADD
var reduce = Function.bind.call(Function.call, Array.prototype.reduce);
var isEnumerable = Function.bind.call(Function.call, Object.prototype.propertyIsEnumerable);
var concat = Function.bind.call(Function.call, Array.prototype.concat);
var keys = Object.keys;

//(#pre-includes)
//db usage file like connection, query passage, etc...,
var db = require("../helpers/db/Postgres.js");

var tables = require("../helpers/Tables.json");

var tableviews = require("../helpers/TableViews.json");

var configPackage = require('../package.json');

//For error or success or anything else response color
var chalk = require('chalk');

//for error response color
var error = chalk.red;

//for success response color
var response = chalk.green;

//for query/no data/extra purpose color
var fetchcolor = chalk.blue;

//for Encryption and decryption mechanism
var crypto = require('crypto');

var DDO_WALLET_TABLE_NAME = tables['ddowallet'];

var DDO_PROJECT_TABLE_NAME = tables['ddoproject'];

var DDO_PROJECT_ALLOC_TABLE_NAME = tables['ddoprojectalloc'];

var DDO_WALLET_HISTORY_TABLE_NAME = tables['ddowallethistory'];

var DDO_WALLET_SETTINGS_TABLE_NAME = tables['ddowalletsettings'];

var DDO_EMP_WORK_DETAILS_TABLE_NAME = tables['ddoempworkdetails'];

var DDO_EMP_FULL_DETAILS_VIEW_NAME = tableviews['ddoempfulldetails'];

var KEYCLOAK_HOST = "staging.identity.walkingtree.tech";
var KEYCLOAK_REALM = "master";

var utilExports = {
    /**
     * ### To get the employee_code
     * MMYYYY(4-digit -> max of employee_code from ddo_employee table)
     * params -> 
     * (1#) - id | employee id
     * (2#) - cb | callback
     */
    getEmpCodeValue: function(id, cb) {
        var currentDate = new Date();

        var currentYear = new Date().getFullYear().toString().slice(-2);

        var currentMonth = ('0' + (currentDate.getMonth() + 1)).slice(-2);

        var currentMonYear = currentYear.concat(currentMonth);

        var emp_code = currentMonYear.concat(('000' + id).slice(-4));

        cb(emp_code);
    },

    /**
     * ### To get the current date
     * since DB date not matched correctly
     * YYYY-MM-DD HH:MM:SS -> to produce output
     * params -> 
     * (1#) - date | if certain date needs(optional)
     */
    getCurrentDateAndTime: function(date) {
        date = (!date) ? new Date() : new Date(date);

        var day = date.getDate();
        var month = date.getMonth() + 1;
        var year = date.getFullYear();

        var hours = date.getHours();
        var minutes = date.getMinutes();
        var seconds = date.getSeconds();

        return year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
    },

    /**
     * To send the mail with the provided content and subject
     * params -> 
     * (1#) - toemail | Email of receiver
     * (2#) - subject | Subject of the mail
     * (3#) - content | Content of the mail
     * (4#) - res | Response to display
     * (5#) - cb | callback function
     */
    sendMail: function(toemail, subject, content, res, cb) {
        if (typeof toemail != 'string') {
            toemail = toemail.toString();
        }
        console.log('Entered into sendMail in Util file');
        var transporter = nodemailer.createTransport(smtpTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: true,
            service: 'Gmail',
            auth: {
                user: configPackage.config.req_mail,
                pass: configPackage.config.req_mail_pass
            }
        }));

        var mailOptions = {
            from: configPackage.config.req_mail,
            to: toemail,
            subject: subject,
            html: content
        };

        transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                console.log(error);
                cb(error, info);
            } else {
                cb(null, info);
            };
        });
    },

    /**
     * ### Transaction rollback action function
     * Purpose -> To rollback the savepoint
     * params -> 
     * (1#) - obj | object to be passed
     *   $ tx | transaction(if DB connected)
     *   $ savepoint | name of the savepoint(if DB connected)
     *   $ done | stating done with the transaction(if DB connected)
     *   $ res | to send the failed response
     * (2#) - err | error statement produced
     * (3#) - message | message to be displayed(optional)
     * (4#) - errmsg | extra error message(optional)
     */
    rollbackFn: function(obj, err, message, errmsg) {
        console.log(error("Rollback in Util -> "), err);

        obj['tx'].rollback(obj['savepoint']);
        obj['tx'].release(obj['savepoint']);

        if (!message) {
            message = "Operation failed!";
        }

        obj['done']();

        if(obj['res']) {
            if (errmsg) {
                return obj['res'].json({
                    success: false,
                    data: err,
                    message: message,
                    err_msg: errmsg
                });
            } else {
                return obj['res'].status(500).json({
                    success: false,
                    data: err,
                    message: message
                });
            }
        }
    },

    /**
     * ### Transaction commit action function
     * Purpose -> To commit the transaction queries
     * params -> 
     * (1#) - obj | object to be passed
     *   $ tx | transaction(if DB connected)
     *   $ done | stating done with the transaction(if DB connected)
     *   $ res | to send the failed response
     * (2#) - message | message to be displayed(optional)
     * (3#) - info | only used for mail sent(optional)
     */
    commitFn: function(obj, message, info, req, res, amazons3) {
        console.log(response("Commit in Util -> "), message);

        obj['tx'].commit(function(err) {
            if (!message) {
                message = "Committed successfully!";
            }

            if (err) {
                utilExports.rollbackFn(obj, err, 'Commit failed!');
            } else {
                obj['done']();

                if (obj['res']) {
                    if (obj && obj.EMP_REPORTING_TO && !info) {
                        return obj['res'].json({
                            success: true,
                            message: message,
                            reportingto: obj.EMP_REPORTING_TO
                        });
                    }
                    /*else if(obj && obj.reportingto && !info) {
                                       return obj['res'].json({success: true, message: message, ddo_employee_id: obj.ddo_employee_id, ddo_role_id: obj.ddo_role_id, ddo_empworkdetails_id: obj.ddo_empworkdetails_id, reportingto: obj.reportingto});
                                   }*/
                    else if (obj && obj.ddo_employee_id && obj.ddo_role_id && !info) {
                        return obj['res'].json({
                            success: true,
                            message: message,
                            ddo_employee_id: obj.ddo_employee_id,
                            ddo_role_id: obj.ddo_role_id
                        });
                    } else if (obj && obj.ddo_employee_id && obj.ddo_employeegoal_id && !info) {
                        return obj['res'].json({
                            success: true,
                            message: message,
                            ddo_employeegoal_id: obj.ddo_employeegoal_id,
                            ddo_role_id: obj.ddo_role_id,
                            ddo_employee_id: obj.ddo_employee_id
                        });
                    } else if (!info) {
                        return obj['res'].json({
                            success: true,
                            message: message
                        });
                    } else {
                        //obj['res'].setHeader("Content-Type", "text/html");
                        //obj['res'].setHeader("domain", document.domain);
                        //    console.log('reqPrams'+req.domain)
                        //    console.log('reqPramsdomaian'+req.params.domain)
                        // console.log('reqbody'+req.body.domain)
                        //  console.log('imgpath  '+obj['imgPath'])
                        //   console.log('data '+info)
                        if (amazons3) {
                            return res.json({ success: true, data: { "imageUrl": obj['imgPath'] }, message: "Successfully Image" });

                        } else {
                            if (req.body.domain) {
                                var domain = req.body.domain,
                                    script = '<script type="text/javascript">document.domain = "' + domain + '";</script>';
                                bodyText = JSON.stringify({ success: true, data: info, imgPath: obj['imgPath'] });
                                bodyText = bodyText.replace(/\\/g, "/")

                                body = '<body>' + bodyText + '</body>';
                                res.setHeader('Content-Type', 'text/html');
                                res.send('<html><head>' + script + '</head>' + body + '</html>');
                        		console.log('response is ' +res.body)
                                return res;
                            }

                            return res.json({
                                success: true,
                                data: info,
                                message: message
                                //contentType:'text/html'
                            });
                        }
                    }
                }
            }
        });
    },

    /**
     * To pick the random values
     * params ->
     * (1#) - min | minimum value
     * (2#) - max | maximum value
     */
    getRandomArbitrary: function(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    },

    /**
     * To unlink/remove the image from dir
     * params ->
     * (1#) - fs | filestream 
     * (2#) - imgPath | path of an image
     */
    imgUnlink: function(fs, imgPath) {
        if (typeof imgPath == 'string') {
            imgPath = imgPath.split(',');
        }
        for (var i = 0, ln = imgPath.length; i < ln; i++) {
            fs.unlink(imgPath[i]);
        }
    },

    isEmptyObject: function(obj) {
        for (var key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                return false;
            }
        }
        return true;
    },

    /**
     * To extract only values from a key : value paire type object.
     */
    getObjectValues: function values(O) {
        return reduce(keys(O), (v, k) => concat(v, typeof k === 'string' && isEnumerable(O, k) ? [O[k]] : []), []);
    },

    /**
     * To convert into tree data structure
     */
    getTreeData: function (data, treekey, idkey, parentFields, childFields, fieldsMap) {
        var root = {
            // "employee_name": 'WTC',
            // 'employee_code': 'root'
        },
            tree = [],
            children = [],
            obj = {},
            map = {},
            len = data.length,
            i, parentfield, node, parent, addToChildren;

        // create a node map
        for (i = 0; i < len; i++) {
            node = data[i];
            node.leaf = node.leaf || true;
            map[node[idkey]] = node;
        }
        for (i = 0; i < len; i++) {
            node = data[i];
            // add to parent

            parent = map[node[treekey]];
            if (parent) {
                parent.leaf = false;
                // create child array if it doesn't exist
                (parent.children || (parent.children = []))
                    // add node to child array.push(node);
                    .push(node);
            } else {
                // parent is null or missing
                tree.push(node);
            }
        }

        for (i = 0, ln = tree.length; i < ln; i++) {
            obj = {};

            for (parentfield in fieldsMap) {
                obj[fieldsMap[parentfield]] = tree[i][parentfield];
            }
            (obj.children || (obj.children = [])).push(tree[i]);

            addToChildren = true;
            for (var k = 0; k < children.length; k++) {

                if (children[k][idkey] == obj[idkey]) {
                    children[k].children.push(obj.children[0]);
                    addToChildren = false;
                    break;
                }

            }
            if (addToChildren) {
                children.push(obj);
            }
        }
        // set the root children
        root.children = children;
        return children[0];
    },

    encryptPassword: function(text) {
        var cipher = crypto.createCipher('aes-256-cbc', 'ddosuperkey');
        var crypted = cipher.update(text, 'utf-8', 'hex');
        crypted += cipher.final('hex');
        return crypted;
    },

    decryptPassword: function(text) {
        var decipher = crypto.createDecipher('aes-256-cbc', 'ddosuperkey');
        var decrypted = decipher.update(text.trim(), 'hex', 'utf-8');
        decrypted += decipher.final('utf-8');
        return decrypted;
    },
    /**
     * To convert an array of data to a map with specified key
     */
    getMap: function(data, key) {
        var map = {},
            ln, i;
        if (data) {
            ln = data.length,
                i;

            for (i = 0; i < ln; i++) {
                if (map[data[i][key]]) {
                    if (!Array.isArray(map[data[i][key]])) {
                        var tmp = map[data[i][key]];
                        map[data[i][key]] = [tmp]
                    }
                    map[data[i][key]].push(data[i])
                } else {
                    map[data[i][key]] = data[i];
                }
            }
        }
        return map;
    },

    /**
     * Fetches the project resources based on 
     * provided projectId
     * params ->
     * (1#) - ddo_client_id | client id
     * (2#) - ddo_org_id | org id
     * (3#) - projectId | project id
     * (4#) - cb | callback function
     */
    getProjectEmployees: function(ddo_client_id, ddo_org_id, projectId, cb) {
        if (projectId) {
            var conditions = "dp.isactive='Y' and dp.ddo_client_id=$1 and dp.ddo_org_id=$2 and dp.ddo_project_id=$3";
            var projectResourceFetchQuery = "select DISTINCT dpa.ddo_employee_id from " + DDO_PROJECT_TABLE_NAME + " dp JOIN " + DDO_PROJECT_ALLOC_TABLE_NAME + " dpa ON dpa.ddo_project_id=dp.ddo_project_id where " + conditions;
            console.log('projectResourceFetchQuery: ', projectResourceFetchQuery);

            db.selectQuery(projectResourceFetchQuery, [ddo_client_id, ddo_org_id, projectId], function (err, data) {
                var resourceCbpids = [];

                if (!err && data.length > 0) {
                    for (var i = 0; i < data.length; i++) {
                        resourceCbpids.push(data[i].ddo_employee_id);
                    }
                }

                console.log('resourceCbpids: ', resourceCbpids);

                cb(err, resourceCbpids.toString());
            });
        } else {
            cb('No ProjectID is provided!');
        }
    },

    /**
     * Fetches the employee details based on 
     * session clientId and orgId
     * params ->
     * (1#) - obj | object which is being passed
     *    $ - ddo_client_id | client id
     *    $ - ddo_org_id | org id
     *    $ - empids | employee ids(it can be multiple as well)
     *    $ - all | if true all records else top 10 rec(optional)
     * (2#) - cb | callback function
     */
    getEmployeeDetails: function (obj, cb) {
        var conditions,
            designation = obj.designation;

        if (obj['empids']) {
            conditions = "ddo_client_id=" + obj['ddo_client_id'] + " AND ddo_org_id=" + obj['ddo_org_id'] + " AND c_bpartner_id IN(" + obj['empids'] + ")";
        } else {
            conditions = "ddo_client_id=" + obj['ddo_client_id'] + " AND ddo_org_id=" + obj['ddo_org_id'];
        }

        var selectQuery = "SELECT *, (select count(dev.*) from ddo_emp_fulldetails_v dev where defcv.ddo_client_id=dev.ddo_client_id and dev.ddo_org_id=defcv.ddo_org_id) as totalcount, (select sum(de.karmapoints)/count(de.*) from ddo_emp_fulldetails_v de where defcv.ddo_client_id=de.ddo_client_id and de.ddo_org_id=defcv.ddo_org_id) as average FROM " + DDO_EMP_FULL_DETAILS_VIEW_NAME + " defcv WHERE defcv." + conditions;
        if (obj['designationFilter'] == 'true') {
            
            selectQuery = selectQuery + " AND hr_designation_id =" + designation;
        } else {
            var selectQuery = selectQuery;
        }
        
       if (obj['all'] == 'true') {
            selectQuery = selectQuery;
        } else {
            selectQuery = selectQuery + " ORDER BY karmapoints DESC LIMIT 10";
        }

        console.log('To get all employee details: ', selectQuery);

        db.selectQuery(selectQuery, [], function(err, data) {
            if (err) {
                cb(err);
            } else {
                cb(null, data);
            }
        });
    },

    /**
     * Fetches the project details based on 
     * session clientId and orgId
     * params ->
     * (1#) - obj | object which is being passed
     *    $ - ddo_client_id | client id
     *    $ - ddo_org_id | org id
     * (2#) - cb | callback function
     */
    getProjectDetails: function(obj, cb) {
        var conditions = "ddo_client_id=$1 AND ddo_org_id=$2";

        var selectQuery = "SELECT ddo_project_id as project_id, name FROM " + DDO_PROJECT_TABLE_NAME + " WHERE " + conditions;
        console.log('To get all project details: ', selectQuery);

        db.selectQuery(selectQuery, [obj['ddo_client_id'], obj['ddo_org_id']], function (err, data) {
            if (err) {
                cb(err);
            } else {
                cb(null, data);
            }
        });
    },

    /**
     * To replace the comments text
     */
    getTextWithReplaceSpecialChar: function(text) {
        if (text.indexOf("'") > -1) {
            var text = text.replace(/'/g, "''");
        } else if (text.indexOf("/'") > -1) {
            var text = text.replace("/'", "//'");
        } else {
            var text = text;
        }

        return text;
    },

    /**
     * Fiscal year month count
     */
    fiscalYearMonthCountFn: function(monthNum, indexDate) {
        var miniMonthNames = ["Jan", "Feb", "Mar", "Apr", "May", "June", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        var newExecuteMonth = (miniMonthNames.slice(monthNum)).concat(miniMonthNames.slice(0, monthNum));

        var currentMonth = (indexDate) ? new Date(indexDate).getMonth() : new Date().getMonth();

        console.log('newExecuteMonthnewExecuteMonth: ', newExecuteMonth, newExecuteMonth.indexOf(miniMonthNames[currentMonth]));

        return newExecuteMonth.indexOf(miniMonthNames[currentMonth]);
    },

    /**
     * To get the month basis wallet default points
     */
    getMonthBasisDefaultPoints: function(default_points, date, indexDate) {
        date = (date) ? new Date(date) : new Date();

        var monthNum = utilExports.fiscalYearMonthCountFn(date.getMonth(), indexDate);

        var points = Math.round(((12 - monthNum) / 12) * (default_points));
        console.log('getMonthBasisDefaultPoints: ', points);

        return points;
    },

    /**
     * To calculate the percent to insert/update the wallet points 
     * for employee => manager => manager-manager
     */
    getWalletCalcPercent: function(clientId, orgId, client, date, cb) {
        if (typeof date === 'function') {
            date = (date) ? date : new Date();
            cb = date;
        }

        utilExports.fetchWalletPercentFn(clientId, orgId, client, function (err, data) {
            if (err) {
                cb(err);
            } else {
                if (data.length > 0) {
                    var obj = {};

                    var rec = data[0];

                    obj.defaultPoints = rec.default_points;

                    obj.points = utilExports.getMonthBasisDefaultPoints(rec.default_points, date);

                    obj.empPercent = rec.emp_percent;
                    obj.managerPercent = rec.manager_percent;
                    obj.managerManagerPercent = rec.manager_manager_percent;

                    obj.empCalPercent = Math.round((obj.points) * (rec.emp_percent / 100));
                    obj.managerCalcPercent = Math.round((obj.points) * (rec.manager_percent / 100));
                    obj.managerManagerCalcPercent = Math.round((obj.points) * (rec.manager_manager_percent / 100));

                    console.log('getWalletCalcPercent: ', obj);

                    cb(null, obj);
                } else {
                    cb('No data found');
                }
            }
        });
    },

    /**
     * To fetch the ddo_walletsettings table record based on
     * clientId and orgId
     */
    fetchWalletPercentFn: function(clientId, orgId, client, cb) {
        console.log('fetchWalletPercentFn in Util');
        if (typeof client === 'function') {
            cb = client;
            client = undefined;
        }

        var conditions = "ddo_client_id=$1 AND ddo_org_id=$2";
        var columns = "default_points, emp_percent, manager_percent, manager_manager_percent";

        var selectQuery = "SELECT " + columns + " FROM " + DDO_WALLET_SETTINGS_TABLE_NAME + " WHERE " + conditions;
        console.log('To get client wallet percent details: ', selectQuery);

        if (client) {
            db.selectQuery(selectQuery, [clientId, orgId], client, function (err, data) {
                if (err) {
                    cb(err);
                } else {
                    cb(null, data);
                }
            });
        } else {
            db.selectQuery(selectQuery, [clientId, orgId], function (err, data) {
                if (err) {
                    cb(err);
                } else {
                    cb(null, data);
                }
            });
        }
    },

    /**
     * To calculate and update the values as per the percent to be added to the wallet points
     * for an employee/manager/manager_manager individually
     */
    updateWalletProrateActionFn: function(obj, managerId, isManager) {
        console.log('updateWalletProrateActionFn in Util ');
        var deferred = Q.defer();

        utilExports.fetchWalletPercentFn(obj.clientId, obj.orgId, obj.client, function (err, data) {
            if(err) {
                deferred.reject(new Error(err));
            } else {
                console.log('data::', data);
                if(data.length > 0) {
                    data = data[0];

                    var defaultPoints = data.default_points;

                    var points = utilExports.getMonthBasisDefaultPoints(defaultPoints, obj.yearStartDate, obj.date);

                    var empPercCalc, managerPercCalc,
                        managerManagerPercCalc, headManagerId;

                    empPercCalc = Math.round((points)*(data.emp_percent/100));
                    managerPercCalc = Math.round((points)*(data.manager_percent/100));
                    managerManagerPercCalc = Math.round((points)*(data.manager_manager_percent/100));

                    var selectQuery = "SELECT ded.reportingto as manager_id FROM " + DDO_EMP_WORK_DETAILS_TABLE_NAME + " ded WHERE ded.ddo_employee_id=" + managerId;

                    console.log('Calculated empPercCalc: managerPercCalc: managerManagerPercCalc', empPercCalc, managerPercCalc, managerManagerPercCalc);

                    db.selectQuery(selectQuery, [], obj.client, function(err, rec) {
                        if(err) {
                            deferred.reject(new Error(err));
                        } else {
                            headManagerId = 0;

                            if(rec.length > 0) {
                                headManagerId = rec[0].manager_id;
                            }

                            var updateQuery = "UPDATE " + DDO_WALLET_TABLE_NAME + " AS dw SET points = dw.points+c.points FROM (values (" + managerId + ", " + managerPercCalc + "), (" + headManagerId + ", " + managerManagerPercCalc + ")) AS c(ddo_employee_id, points) WHERE c.ddo_employee_id = dw.ddo_employee_id AND ddo_client_id=" + obj.clientId + " AND ddo_org_id=" + obj.orgId;
                            console.log('updateQuery: ', updateQuery);

                            db.nonSelectQuery(updateQuery, [], obj.client, function (err, result) {
                                if(err) {
                                    deferred.reject(new Error(err));
                                } else {
                                    console.log('resultresultresultresult: ', result);
                                    deferred.resolve(result);
                                }
                            });
                        }
                    });
                } else {
                    deferred.resolve(data);
                }
            }
        });

        return deferred.promise;
    },

    /**
     * To calculate and update the values as per the percent to be added to the wallet points
     */
    newEmpWalletOperationFn: function(obj, employeeId) {
        console.log('newEmpWalletOperationFn in Util ');
        var deferred = Q.defer();

        obj.orgId = (obj.ddo_org_id) ? obj.ddo_org_id : obj.orgId;
        obj.clientId = (obj.ddo_client_id) ? obj.ddo_client_id : obj.clientId;

        utilExports.fetchWalletPercentFn(obj.clientId, obj.orgId, obj.client, function (err, data) {
            if (err) {
                deferred.reject(new Error(err));
            } else {
                if (data.length > 0) {
                    var selectQuery = "SELECT ded.reportingto as manager_id, (SELECT reportingto FROM " + DDO_EMP_WORK_DETAILS_TABLE_NAME + " WHERE ddo_employee_id=ded.reportingto) as manager_manager_id FROM " + DDO_EMP_WORK_DETAILS_TABLE_NAME + " ded WHERE ded.ddo_employee_id=" + employeeId;
                    console.log('get query for emp, emp_manager, emp_manager_manager: ', selectQuery);

                    db.selectQuery(selectQuery, [], obj.client, function (err, rec) {
                        if (err) {
                            deferred.reject(new Error(err));
                        } else {
                            if (rec.length > 0) {
                                data = data[0];

                                var defaultPoints = data.default_points;

                                var points = utilExports.getMonthBasisDefaultPoints(defaultPoints, obj.yearStartDate);

                                var empCalPercent = Math.round((points) * (data.emp_percent / 100));
                                var managerCalcPercent = Math.round((points) * (data.manager_percent / 100));
                                var managerManagerCalcPercent = Math.round((points) * (data.manager_manager_percent / 100));

                                var updateQuery = "UPDATE " + DDO_WALLET_TABLE_NAME + " AS dw SET points = dw.points+c.points, ddo_fyear_id = " + obj.fyearId + " FROM (values (" + employeeId + ", " + empCalPercent + "), (" + rec[0].manager_id + ", " + managerCalcPercent + "), (" + rec[0].manager_manager_id + ", " + managerManagerCalcPercent + ")) AS c(ddo_employee_id, points) WHERE c.ddo_employee_id = dw.ddo_employee_id";
                                console.log('updateQuery: ', updateQuery);

                                db.selectQuery(updateQuery, [], obj.client, function (err, result) {
                                    if (err) {
                                        deferred.reject(new Error(err));
                                    } else {
                                        var trx_type = 'CR';

                                        var columns = "(ddo_client_id, ddo_org_id, createdby, updatedby, ddo_wallet_id, points, trx_type)";

                                        var managerId = rec[0].manager_id;
                                        var man_man_id = rec[0].manager_manager_id;

                                        var values;

                                        if (managerId && man_man_id) {
                                            values = "(" + obj.clientId + "," + obj.orgId + ",0,0,(SELECT ddo_wallet_id FROM " + DDO_WALLET_TABLE_NAME + " WHERE ddo_employee_id=" + employeeId + ")," + empCalPercent + ",'" + trx_type + "'),(" + obj.clientId + "," + obj.orgId + ",0,0,(SELECT ddo_wallet_id FROM " + DDO_WALLET_TABLE_NAME + " WHERE ddo_employee_id=" + rec[0].manager_id + ")," + managerCalcPercent + ",'" + trx_type + "'),(" + obj.clientId + "," + obj.orgId + ",0,0,(SELECT ddo_wallet_id FROM " + DDO_WALLET_TABLE_NAME + " WHERE ddo_employee_id=" + rec[0].manager_manager_id + ")," + managerManagerCalcPercent + ",'" + trx_type + "')";
                                        } else if (managerId) {
                                            values = "(" + obj.clientId + "," + obj.orgId + ",0,0,(SELECT ddo_wallet_id FROM " + DDO_WALLET_TABLE_NAME + " WHERE ddo_employee_id=" + employeeId + ")," + empCalPercent + ",'" + trx_type + "'),(" + obj.clientId + "," + obj.orgId + ",0,0,(SELECT ddo_wallet_id FROM " + DDO_WALLET_TABLE_NAME + " WHERE ddo_employee_id=" + rec[0].manager_id + ")," + managerCalcPercent + ",'" + trx_type + "')";
                                        } else {
                                            values = "(" + obj.clientId + "," + obj.orgId + ",0,0,(SELECT ddo_wallet_id FROM " + DDO_WALLET_TABLE_NAME + " WHERE ddo_employee_id=" + employeeId + ")," + empCalPercent + ",'" + trx_type + "')";
                                        }

                                        var insertQuery = "INSERT INTO " + DDO_WALLET_HISTORY_TABLE_NAME + " " + columns + " values" + values;
                                        console.log('Wallet history insrtion query: ', insertQuery);

                                        db.selectQuery(insertQuery, [], obj.client, function (err, res) {
                                            if (err) {
                                                deferred.reject(new Error(err));
                                            } else {
                                                deferred.resolve(res);
                                            }
                                        });
                                    }
                                });
                            } else {
                                deferred.resolve(rec);
                            }
                        }
                    });
                } else {
                    deferred.resolve(data);
                }
            }
        });

        return deferred.promise;
    },

    getKeycloakData: function () {
        return { host: KEYCLOAK_HOST, realm: KEYCLOAK_REALM };
    }
};

module.exports = utilExports;