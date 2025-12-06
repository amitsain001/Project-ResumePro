const express = require("express") ;
const router = express.Router() ;
const { isLoggedIn } = require ("../middleware.js") ;
const multer = require("multer");
const { resumeSchema } = require("../schema.js") ;
const buildcontroller = require("../controllers/builds.js") ;
const { cloudstorage } = require("../cloudConfig.js") ;

const upload = multer({ storage: cloudstorage });

// Function for validating joi schema of Resume

const validateResume = (req, res, next) => {
  console.log("DEBUG validateResume - req.body:", req.body); // <- look at terminal
  const { error } = resumeSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errMsg = error.details.map(el => el.message).join(", ");
    console.log("Joi errors:", errMsg);
    // prefer forwarding to your error handler
    return next(new ExpressError(errMsg, 400));
  }
  next();
};

// Build Get Route

router.get ( "/build" , isLoggedIn , buildcontroller.renderbuild ) ;

// Render specific template 

router.get("/build/:templateType", isLoggedIn , buildcontroller.renderspecifictemplate );

// View a single resume by ID
router.get("/resume/view/:id", isLoggedIn , buildcontroller.viewbuildresume );

// Save new resume

router.post("/resume/save", validateResume , upload.single("profileImage"), buildcontroller.savepostroute );

//------------- Download Route -------------------------

router.get("/download/:id", buildcontroller.downloadresume );

module.exports = router ;
