const { Router } = require("express");
const { v4: uuid } = require("uuid");
const router = Router();
const userDao = require("../modules/users-dao.js");
const commentDao = require("../modules/comment-dao.js");
const articleDao = require("../modules/article-dao.js");
const passwordSec = require("../modules/passwordSec.js");
const { apiVerifyAuthenticated } = require("../middleware/auth-middleware.js");

/*
API general route
Can be tested from powershell with Invoke-WebRequest 'http://localhost:3000/api'
*/

router.get("/api", async function (req, res) {
    res.status(200).send('this is the 200 request page for API');
});


/*
* API for logging in
* Can be tested from powershell with 
* Invoke-WebRequest 'http://localhost:3000/api/user_login' -SessionVariable 'Session' -Body @{username = 'enigmaCracker'; password = 'password'} -Method 'POST'
*/
router.post("/api/user_login", async function (req, res) {
    const username = req.body.username;
    const password = req.body.password;

    console.log(`Login attempt with username: ${username} and password: ${password}`);

    const passwordCorrect = await passwordSec.checkHashPassword(username, password);
    
    console.log(`Password check result2: ${passwordCorrect}`);

    if (passwordCorrect) {
        const user = await userDao.retrieveUserByUsername(username);
        const authToken = uuid();
        user.authToken = authToken;
        console.log("User retrieved4: ", user);
        await userDao.updateUser(user);
        console.log("User updated1: ", user);
        res.cookie("authToken", authToken);
        console.log("Cookie set: ", authToken);
        res.status(204).send();
        console.log("Status 2041 sent");
    } else {
        res.status(401).send();
        console.log("Status 4012 sent");
    }
});

/*
* Gets a list of users and number of articles if the user is an administrator.
* Invoke-WebRequest -uri "http://localhost:3000/api/users?userID=4&authToken=a9e846b2-8ecd-4f0f-8467-f2db57e48c3c"
*/

router.get("/api/users", apiVerifyAuthenticated, async function (req, res) {    
    const user = res.locals.user; 
    console.log("User retrieved3: ", user);   
    const isAdmin = user.Is_Admin;
    console.log("Is Admin: ", isAdmin);
    if (isAdmin) {
        const userReport = await userDao.userReport();
        console.log("User report: ", userReport);
        res.json(userReport)
    } else {
        res.status(401).send("error, users could not be retrieved");
    }    
});


/*
* Logs a user out, requires the userID and authToken to match in Get request, see example below
* Invoke-WebRequest -uri "http://localhost:3000/api/logout?userID=4&authToken=a9e846b2-8ecd-4f0f-8467-f2db57e48c3c"
*/
router.get("/api/logout", apiVerifyAuthenticated,  async function (req, res) {  
    const user = res.locals.user; 
    console.log("User to logout: ", user);
    user.authToken = "";
    await userDao.updateUser(user);
    console.log("User updated2: ", user);    
    res.status(204).send();   
    console.log("Status 2042 sent");          
});

/*API For deletion of a user
* Invoke-WebRequest -uri "http://localhost:3000/api/users/1?userID=4&authToken=a9e846b2-8ecd-4f0f-8467-f2db57e48c3c" -Method 'DELETE'
*/

router.delete("/api/users/:userID", apiVerifyAuthenticated, async function (req, res) {
    const user = res.locals.user;
    console.log("User making the request: ", user);
    const targetUser = req.params.userID;
    console.log("Target user to delete: ", targetUser);
    if (user.User_ID != parseInt(targetUser)) {
        const isAdmin = user.Is_Admin;
        console.log("Is Admin: ", isAdmin);
        if (isAdmin) {
            await commentDao.removeUsersAllComments(targetUser);
            console.log("Comments1 updated");
            await commentDao.removeArticlesAllComments(targetUser);
            console.log("Comments2 updated");
            await commentDao.removeArticlesAllNotifications(targetUser);
            console.log("Notifications updated");
            await articleDao.deleteAllArticlesForOneUser(targetUser);
            console.log("Articles updated");
            await articleDao.deleteArticle(targetUser);
            console.log("Article deleted");
            await userDao.deleteUser(targetUser);
            console.log("User deleted");
            res.status(204).send("user deleted");
            console.log("Status 204 sent");
        } 
    } 
});


//this must be the last to prevent blocking desired pages as it 
//forwards all requests to 404
router.get('*', function (req, res) {
    res.status(404);
    console.log("404 error");
    res.locals.badurl = req.url;
    console.log("Bad url: ", res.locals.badurl);
    res.render("./404-page-not-found")
    console.log("404 page rendered");
});

router.post('*', function (req, res) {
    res.status(404);
    console.log("404 error");
    res.locals.badurl = req.url;
    console.log("Bad url: ", res.locals.badurl);
    res.render("./404-page-not-found")
    console.log("404 page rendered");
});

module.exports = router;
