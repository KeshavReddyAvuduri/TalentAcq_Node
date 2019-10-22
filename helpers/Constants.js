var messages = {
    getCreateFailed: function(recordName) {
        return 'Failed to create ' + recordName;
    },
    getCreateSuccess: function(recordName) {
        return 'Successfully created ' + recordName;
    }
};

var httpStatusCodes = {
    UNAUTHORIZED: 401 /*403*/,
    INTERNAL_SERVER_ERROR: 500
}

var dbStatusCodes = {
    alreadyExists: "23505"
};

module.exports = {
    messages: messages,
    httpStatusCodes: httpStatusCodes,
    dbStatusCodes: dbStatusCodes
};