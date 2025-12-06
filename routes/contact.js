const express = require("express") ;
const router = express.Router() ;
const { isLoggedIn } = require ("../middleware.js") ;
const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');
const contactcontroller = require("../controllers/contacts.js") ;

// Simple rate limiter to prevent spam
const contactLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: "Too many messages sent. Please try again later."
});

//---------------------------------------------- CONTACT ROUTE --------------------------------

router.route("/contact")

.get(isLoggedIn , contactcontroller.rendercontact )     // GET /contact
.post(contactLimiter,           // POST /contact

  // validations
  body('name').trim().isLength({ min: 2 }).withMessage('Please enter your name'),
  body('email').trim().isEmail().withMessage('Please enter a valid email'),
  body('subject').trim().isLength({ min: 3 }).withMessage('Subject is too short'),
  body('message').trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters'),

  contactcontroller.postcontact 
);

module.exports = router ;