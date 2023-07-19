// Setup Express
const express = require("express");
const session = require('express-session');  
const app = express();
const port = 3000;

// Setup Handlebars
const handlebars = require("express-handlebars");
app.engine("handlebars", handlebars({
    defaultLayout: "main"
}));
app.set("view engine", "handlebars");

// Setup body-parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'your secret',
    resave: false,
    saveUninitialized: false
}));

// Setup cookie-parser
const cookieParser = require("cookie-parser");
app.use(cookieParser());

// Make the "public" folder available statically
const path = require("path");
app.use(express.static(path.join(__dirname, "public")));

// Use the middleware
app.use(require("./middleware/toaster-middleware.js"));

// Here we add the authMiddleware.addUserToLocals middleware to the app.
// This should be before the routes are setup.
const authMiddleware = require('./middleware/auth-middleware');
app.use(authMiddleware.addUserToLocals);

// Setup routes
app.use(require("./routes/application-routes.js"));
app.use(require("./routes/auth-route.js"));
app.use(require("./routes/articleView-route.js"));
app.use(require("./routes/create-article-routes.js"));
app.use(require("./routes/edit-article-routes.js"));
app.use(require("./routes/marie-routes.js"));
app.use(require("./routes/notification-routes.js"));
app.use(require("./routes/follows-routes.js"));
app.use(require("./routes/subscribers-routes.js"));
app.use(require("./routes/api-routes.js"));

// Start the server running.
app.listen(port, function () {
    console.log(`App listening on port ${port}!`);
});
