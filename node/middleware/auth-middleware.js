const userDao = require("../modules/users-dao.js");

//called by app.js to authenticate the user on every route
async function addUserToLocals(req, res, next) {
    console.log("addUserToLocals started");
    const user = await userDao.retrieveUserWithAuthToken(req.cookies.authToken);
    console.log("User retrieved1: ", user);
    res.locals.user = user;
    console.log("User added to locals: ", res.locals.user);
    next();
}

async function apiVerifyAuthenticated(req, res, next) {
    if (res.locals.user) {
        console.log("User is logged in");
        next();
    }
    else {
        res.status(401).send();
        console.log("Status 4011 sent");
    }
}

//call this to identify whether user is logged in
//if user is not logged in it will redirect to 'permission denied' page. 
function verifyAuthenticated(req, res, next) {
    if (res.locals.user) {
        console.log("User is logged in");
        //log permission granted
        next();
    }
    else {
        //log access denied
        res.render("permission-denied");
        console.log("User is not logged in");
    }
}

//if user is not logged in it will alert the user. 
function verifyAuthenticatedWithAlertOnly(req, res, next) {
    if (res.locals.user) {
        console.log("User is logged in");
        //log permission granted
        next();
    }
    else {
        console.log("User is not logged in");
        //log access denied
        res.status(403).send();
    }
}

module.exports = {
    addUserToLocals,
    verifyAuthenticated,
    verifyAuthenticatedWithAlertOnly,
    apiVerifyAuthenticated
}