if ( process.env.NODE_ENV != "production" ) {
  require('dotenv').config() ;
}

const express = require ("express") ;
const app = express() ;

// If you're behind a proxy (Render, Heroku, etc.)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1); // trust first proxy
}

const mongoose = require ("mongoose") ;
const path = require("path") ;
const methodOverride = require("method-override");
const dburl = process.env.ATLASDB_URL ;
const ejsMate = require ("ejs-mate");
const session = require('express-session') ;
const MongoStoreImport = require("connect-mongo");
const MongoStore = MongoStoreImport.default || MongoStoreImport;
const flash = require('connect-flash');
const ExpressError = require ("./public/utils/ExpressError") ;
const User = require ("./models/user.js") ;
const passport = require('passport');
const LocalStrategy = require('passport-local');

const user = require("./routes/user.js") ;
const resume = require("./routes/resume.js") ;
const build = require("./routes/build.js") ;
const contact = require("./routes/contact.js") ;

app.set ( "view engine", "ejs");                                // Setting ejs
app.set ( "views" , path.join ( __dirname , "views" )); 
app.use ( express.json() ) ;
app.use ( express.urlencoded ({ extended : true }));            // Body Parser Middleware  
app.use ( methodOverride("_method") ) ;
app.engine ("ejs" , ejsMate ) ;           
app.use ( express.static ( path.join ( __dirname , "/public" ))) ;
app.use("/uploads", express.static(path.join(__dirname, "uploads"))) ;

const store = MongoStore.create({
  mongoUrl: dburl ,
  crypto: {
    secret: process.env.SECRET ,
  },
  touchAfter: 24*3600 ,
});

store.on('error' , (err) => {
  console.log("ERROR IN MONGO SESSION STORE" , err) ;
});


// Express Sessions 

const sessionoptions = { 
    store ,
    secret : process.env.SECRET , 
    resave: false , 
    saveUninitialized : true,
    cookie : {
        expires : Date.now() + 7 * 24 * 60 * 60 * 1000 ,
        maxAge : 7 * 24 * 60 * 60 * 1000 ,
        httpOnly : true ,
    } ,

}  ;

app.use(session (sessionoptions)) ;
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

// Passport configuration
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Making flash available in responses 

app.use ( ( req , res , next ) => {                 // Middleware for flash 
    res.locals.success = req.flash("success") ;
    res.locals.error = req.flash("error") ;
    res.locals.currUser = req.user ;                // for using currUser in navbar.ejs directly for Login and Logout hiding procedure
    next() ;
});

async function main() {
    await mongoose.connect (dburl) ;
}

main()
.then( () => {
    console.log("connected to database") ;
})
.catch ( (err) => {
    console.log(err) ;
}) ;

app.get ( "/" , (req , res) => {
    res.render ( "./layouts/boilerplate.ejs") ;
}); 

app.use("/" , resume) ;
app.use("/" , user) ;
app.use("/" , build) ;
app.use("/" , contact) ;

//----------------------------------------------------------------------------------------------------------

app.use ( ( req , res , next ) => {
    next( new ExpressError(404 , "page not found" ) ) ;
})

app.use((err, req, res, next) => {
  // safe numeric status
  const status = Number(err && err.status) || 500;
  const message = err && err.message ? err.message : "Something went wrong";

  // If this is a validation-like error (400) and a normal browser request, flash + redirect
const wantsHtml = req.headers.accept && req.headers.accept.includes("text/html");
if (status === 400 && wantsHtml) {
  // split messages (validateResume was joining messages with commas)
  let msgs = [];
  if (typeof message === "string") {
    msgs = message.split(/\r?\n|,/).map(s => s.trim()).filter(Boolean);
  } else {
    msgs = [String(message)];
  }

  // store each message as a flash entry
  msgs.forEach(m => req.flash("error", m));

  // Prefer redirecting back to the correct resume build page when possible:
  // Use templateType from the failed POST body (most reliable when save fails),
  // otherwise fall back to referer or a default.
  const templateType = req.body && req.body.templateType;
  const buildUrl = templateType ? `/build/${templateType}` : null;
  const backUrl = buildUrl || req.headers.referer || "/resume/signup";

  return res.redirect(backUrl);
}

  // For AJAX/JSON clients, return JSON error
  if (req.xhr || (req.headers.accept && req.headers.accept.includes("application/json"))) {
    return res.status(status).json({ error: message });
  }

  // default: render error page
  res.status(status).render("error.ejs", { message });
});


app.listen ( 8080 , ( req , res ) => {
    console.log ( "app is listening to port 8080" ) ;
});