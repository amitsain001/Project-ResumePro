const User = require ("../models/user.js") ;

module.exports.rendersignup = ( req , res ) => {
    res.render ( "users/signup.ejs") ;
}

module.exports.postsignup = async (req, res, next) => {

    try {

        let { username , email , password } = req.body ;
        const newuser = new User({ email, username })
        const registeruser = await User.register( newuser , password ) ;
        console.log(registeruser) ;

        req.login ( registeruser , (err) => {                   // Automatically login after sign up 
            if ( err ) {
                return next(err) ;
            }
            req.flash ( "success" , "user registered successfully") ;
            res.redirect("/resume") ;
        })

    } catch(err) {

      req.flash( "error" , err.message ) ;
      res.redirect("/resume/signup") ;

    }

}

module.exports.renderlogin = ( req , res ) => {
    res.render ( "users/login.ejs") ;
}

module.exports.postlogin = async ( req , res ) => {
    req.flash ( "success" , "welcome back to ResumePro" ) ;
    let redirectUrl = res.locals.redirectUrl || "/resume" ;
    res.redirect(redirectUrl) ;
}

module.exports.logout = ( req , res , next ) => {

    req.logOut( ( err ) => {
        
        if ( err ) {
            next(err) ;
        }

        req.flash ( "success" , "user logged out successfully") ;
        res.redirect ("/resume") ;
    });

}