const express = require("express") ;
const router = express.Router() ;
const wrapAsync = require ("../public/utils/WrapAsync") ;
const { saveRedirectUrl } = require ("../middleware.js") ;
const passport = require('passport');
const { userSchema } = require("../schema.js") ;
const ExpressError = require ("../public/utils/ExpressError") ;
const usercontroller = require("../controllers/users.js") ;

// Function for validating joi schema of User

const validateUser = (req, res, next) => {
  // console.log("DEBUG validateUser - req.body:", req.body); // <- look at terminal
  const { error } = userSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errMsg = error.details.map(el => el.message).join(", ");
    console.log("Joi errors:", errMsg);
    // prefer forwarding to your error handler
    return next(new ExpressError(errMsg, 400));
  }
  next();
};

//-------------------------------------- signup route --------------------------------------

// signup get route 

router.get ( "/resume/signup" , usercontroller.rendersignup ) ;

// signup post route 

router.post("/resume/signup", validateUser , wrapAsync ( usercontroller.postsignup ) ) ;

//-------------------------------------- login route --------------------------------------

// login get route

router.get ( "/resume/login" , usercontroller.renderlogin) ;

// login post route 

router.post ( "/login" , 
    saveRedirectUrl , 
    passport.authenticate('local', 
        { failureRedirect: '/resume/login' , 
            failureFlash : true 
        }), 
    
    wrapAsync ( usercontroller.postlogin )

) ;

//--------------------------------------- logout route ------------------------------------------

router.get ( "/resume/logout" , usercontroller.logout ) ;

module.exports = router ;