const express = require("express") ;
const router = express.Router() ;
const { isLoggedIn } = require ("../middleware.js") ;
const { resumeSchema } = require("../schema.js") ;
const multer = require("multer");
const ExpressError = require ("../public/utils/ExpressError") ;
const resumecontroler = require("../controllers/resumes.js") ;
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

// Index Route

router.get ( "/resume" , resumecontroler.renderresume ) ;

//-------------------- GET /myresume → show all resumes of logged-in user---------------------------

router.get("/myresume", isLoggedIn, resumecontroler.rendermyresumeroute );

//------------------------------ GET /resumes/:id  -> view a single resume----------------------------

router.get('/resumes/:id', isLoggedIn, resumecontroler.viewresume );

//---------------------------------------- GET Edit --------------------------------------------------
router.get('/resumes/:id/edit', isLoggedIn, resumecontroler.editresume );


//----------------------------------- Update Resume ---------------------------------------------------
router.post('/resumes/:id/update', validateResume , 
            isLoggedIn, 
            upload.single('profileImage'), 
            resumecontroler.updateresume 
          );

//----------------------------------------- Delete Route ----------------------------------------

// Delete Individually 

router.post('/resumes/:id/delete', isLoggedIn, resumecontroler.singledestroy );

// Delete All Route 

router.post('/resumes/delete-all', isLoggedIn, resumecontroler.alldestroy );

module.exports = router ;