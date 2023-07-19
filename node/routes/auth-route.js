const { v4: uuid } = require("uuid");
const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 10;
const userDao = require("../modules/users-dao.js");
const { generateauthToken } = require('../modules/users-dao.js');
const { retrieveUserByUsername } = require("../modules/users-dao.js");
const { addUserToLocals } = require("../middleware/auth-middleware.js");


router.get("/user_login", async function (req, res) {
    console.log("GET /user_login triggered");
    // res.clearCookie("toastMessage");
    res.render("user_login");
});

router.post("/user_login", async function (req, res) {
    console.log("POST /user_login triggered");
    // Get the username and password submitted in the form
    console.log("has entered password");
    const username = req.body.username;
    const password = req.body.password;

    // Find a matching user in the database
    const user = await retrieveUserByUsername(username);
    console.log("Retrieved user: ", user);
    // Check if there's a matching user
    if (!user) {
        // res.setToastMessage("Username does not exist!");
        console.log("Username does not exist!");
        res.render("user_login", { toastMessage: "Username does not exist!" });
        return;
    }

    // Check if the password matches
    if (!(await bcrypt.compare(password, user.Password))) {
        // res.setToastMessage("Incorrect password entered!");
        console.log("Incorrect password entered!");
        res.render("user_login", { toastMessage: "Incorrect password entered!" });
        return;
    }

    const authToken = generateauthToken();
    console.log("Generated authToken: ", authToken);

    // Update user in database with new authToken
    user.authToken = authToken;
    console.log("Assigned authToken to user: ", user);
    await userDao.updateUser(user);
    console.log("Updated user in database: ", user);

    // Set the authToken cookie
    res.cookie("authToken", user.authToken);
    console.log("Set authToken cookie: ", user.authToken);
    res.setToastMessage("Login successful!");

    res.locals.user = user;
    console.log("Assigned user to res.locals.user: ", user);
    res.redirect("/");

});

// Logout route - GET
router.get("/logout", function (req, res) {
    res.clearCookie("authToken");
    res.locals.user = null;
    res.redirect("/");
});

// Create account route - GET
router.get("/create-account", function (req, res) {
    res.render("create_account");
})

// Create account route - POST
router.post("/create_account", async function (req, res) {
    const user = {
        Username: req.body.username,
        Brief_Description: req.body.Brief_Description,
        Password: req.body.password,
        repassword: req.body.repassword,
        Date_Of_Birth: req.body.birthdate,
        Real_Name: req.body.idname,
        Avatar: req.body.icon,
        Is_Admin: false,
    };

    if (user.Password !== user.repassword) {
        res.render("create_account", { toastMessage: "Passwords do not match!" });
        return;
    }

    try {
        const hashedPassword = await bcrypt.hash(user.Password, saltRounds);
        user.Password = hashedPassword;

        const createdUser = await userDao.createUser(user);
        res.setToastMessage("User was successfully created");

        res.redirect("/user_login");
    } catch (err) {
        console.error(err);
        res.setToastMessage(err.message);
        res.render("create_account", { toastMessage: err.message });
    }
});

// Check username existence route - GET
router.get("/check_username/:username", async function (req, res) {
    const username = req.params.username;

    const existingUser = await userDao.retrieveUserByUsername(username);
    if (existingUser) {
        res.send('Username already exists, please choose another');
    } else {
        res.send('Username is available');
    }
});

// Check username existence for edit operation route - GET
router.get("/edit_check_username/:username", addUserToLocals, async function (req, res) {
    const username = req.params.username;
    const originalUsername = res.locals.user.Username;

    const existingUser = await userDao.retrieveUserByUsername(username);
    if (existingUser) {
        if (username === originalUsername) {
            res.send('This is your current username');
        } else {
            res.send('Username already exists, please choose another');
        }
    } else {
        res.send('Username is available');
    }
});



module.exports = router;
