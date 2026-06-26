  const express= require("express");

  const mongoose = require("mongoose");

  const path= require("path");

  const app = express();

  const port = 3000;

  const ejsMate= require("ejs-mate");

  app.set("view engine","ejs");

  app.engine('ejs',ejsMate);

  app.set("views",path.join(__dirname,"views"));

  app.use(express.urlencoded({ extended: true }));


  const methodOverride= require("method-override");

  app.use(methodOverride("_method"));

  app.use(express.static(path.join(__dirname,"/public")));


  const ExpressError= require("./utils/ExpressError.js");


  const User= require("./models/user.js");


  const cookieParser= require("cookie-parser");

  app.use(cookieParser("secratecode"));


  const session= require("express-session");

  app.use(session({

    secret:"mysupersecretcode",

    resave: false,

    saveUninitialized: false,

    cookie:{

        expires: Date.now()+ 7 * 24 * 60 * 60 * 1000,

        maxAge:7 * 24 * 60 * 60 * 1000,

        httpOnly: true,

      }

  }));


  //secratecode is for signed cookies. anyone cannot change
  // koipan req par session add thase in cookes in form session
  // resave:false → unnecessary session save avoid
  // saveUninitialized:true → new session save


  const flash= require("connect-flash");

  app.use(flash());


  app.use(async (req, res, next) => {

      res.locals.success = req.flash("success");

      res.locals.error = req.flash("error");

      if (req.session.userId) {

          try {

              const user = await User.findById(req.session.userId);

              res.locals.currUser = user;

          } catch (err) {

              res.locals.currUser = null;
          }

      } else {

          res.locals.currUser = null;
      }

      next();

  });

require("dotenv").config();

  // mongodb connection
  mongoose.connect("mongodb://localhost:27017/Airbnb")

  .then(()=>{

      console.log("mongodb connected")

  })

  .catch(err=>console.log(err));



  // ROUTES

  const listingRouter = require("./routes/listing.js");

  const reviewRouter = require("./routes/review.js");

  const userRouter = require("./routes/user.js");


  app.use("/listings", listingRouter);

  app.use("/listings/:id/reviews", reviewRouter);

  app.use("/", userRouter);

  // for page not found
  app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
  });
  // ADVANCED
  // app.all("*", (req, res, next) => {
  //   next(new ExpressError(404, "Page Not Found"));
  // });

  // Error handler
  app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("error", { err });
    // res.status(statusCode).send(message);
  });
  // It runs ONLY when you send an error using next(err) or throw an error
  // example:
  // app.get("/test", (req, res, next) => {
  //     next(new Error("Something broke"));
  // });
  // Output
  // Something broke
  // (status: 500)

  // imp if you want to use util's ExpresError
  // you have to write new ExpressError("") 





  app.listen(port,()=>{
      console.log("server is running")
  })