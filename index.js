const express = require("express"),
    app = express(),
    mongoose = require("mongoose"),
    passport = require("passport"),
    //   bodyParser            =  require("body-parser"),
    LocalStrategy = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose"),
    session = require("express-session"),
    User = require("./models/user");

//Connecting database
mongoose.connect("mongodb://127.0.0.1:27017/AuthenDB");
app.use(
    session({
        secret: "Any normal Word", //decode or encode session
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 2 * 60 * 1000,
        },
    })
);
passport.serializeUser(User.serializeUser()); //session encoding
passport.deserializeUser(User.deserializeUser()); //session decoding
passport.use(new LocalStrategy(User.authenticate()));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());
//current User
app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    next();
});
//MIDDLEWARE
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

//Auth Routes
app.get("/login", (req, res) => {
    res.render("loginForm");
});
app.get("/", (req, res) => {
    res.render("home");
});

app.post(
    "/login",
    passport.authenticate("local", {
        successRedirect: "/userprofile",
        failureRedirect: "/login",
    }),
    async function(req, res) {
        const currentUser = await User.findOne({
            username: req.body.username,
        }).lean();
        res.render("home", currentUser);
    }
);

app.get("/userprofile", async(req, res) => {
    res.render("userProfile");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", (req, res) => {
    User.register(
        new User({
            username: req.body.username,
            phone: req.body.phone,
            telephone: req.body.telephone,
        }),
        req.body.password,
        function(err, user) {
            if (err) {
                console.log(err);
                res.render("register");
            }
            passport.authenticate("local")(req, res, function() {
                res.redirect("/login");
            });
        }
    );
});

app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});

app.post(
    "/login",
    passport.authenticate("local", {
        successRedirect: "/userprofile",
        failureRedirect: "/login",
    }),
    function(req, res) {}
);

app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});

app.listen(process.env.PORT || 3000, function(err) {
    if (err) {
        console.log(err);
    } else {
        console.log("Server Started At Port 3000");
    }
});