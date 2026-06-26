const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js"); // 1. Import wrapAsync

// signup form
router.get("/signup", (req, res) => {
    res.render("users/signup.ejs");
});

router.get("/", (req, res) => {

    if (req.session.userId) {
        return res.redirect("/listings");
    }

    res.redirect("/login");
});

router.post("/signup", async (req, res) => {

    try {

        let { username, email, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
        });

        await newUser.save();

        req.session.userId = newUser._id;

        req.flash("success", "Welcome to Airbnb!");

        res.redirect("/listings");

    } catch (err) {

        console.log(err);

        req.flash("error", err.message);

        res.redirect("/signup");
    }
});



// login form
router.get("/login", (req, res) => {
    res.render("users/login.ejs");
});

router.post("/login", async (req, res) => {

    let { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) {

        req.flash("error", "Invalid Username");

        return res.redirect("/login");
    }

    const isMatch = await bcrypt.compare(
        password,
        user.password
    );

    if (!isMatch) {

        req.flash("error", "Invalid Password");

        return res.redirect("/login");
    }

    req.session.userId = user._id;

    req.flash("success", "Welcome Back!");

    res.redirect("/listings");
});

// logout
router.get("/logout", (req, res) => {

    req.session.userId = null;

    req.flash("success", "Logged out!");

    res.redirect("/login");
});

module.exports = router;