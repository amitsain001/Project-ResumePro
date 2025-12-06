const { validationResult } = require('express-validator');
const ContactMessage = require('../models/ContactMessage.js');
const nodemailer = require('nodemailer');

// nodemailer transporter (use env variables)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,      // e.g. smtp.gmail.com
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for others
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

module.exports.rendercontact = (req, res) => {
  res.render('contact', { old: {}, errors: {}, success: res.locals.success, error: res.locals.error });
}

module.exports.postcontact = async (req, res) => {
    const errors = validationResult(req);
    const old = { 
                  name: req.body.name, 
                  email: req.body.email, 
                  subject: req.body.subject, 
                  message: req.body.message 
                };

    if (!errors.isEmpty()) {
      // send back validation errors
      return res.render('contact', { old, errors: errors.mapped(), success: null, error: null });
    }

    try {
      // Save message to DB (optional)
      if (ContactMessage) {
        await ContactMessage.create({
          name: req.body.name,
          email: req.body.email,
          subject: req.body.subject,
          message: req.body.message,
          ip: req.ip
        });
      }

      // Send email to site owner
      const mailOptions = {
        from: `"${req.body.name}" <${req.body.email}>`,
        to: process.env.CONTACT_TO_EMAIL || process.env.SMTP_USER,
        subject: `[Contact] ${req.body.subject}`,
        text: `From: ${req.body.name} <${req.body.email}>\n\n${req.body.message}`,
        html: `<p><strong>From:</strong> ${req.body.name} &lt;${req.body.email}&gt;</p>
               <p><strong>Subject:</strong> ${req.body.subject}</p>
               <hr />
               <p>${req.body.message.replace(/\n/g, '<br/>')}</p>`
      };

      await transporter.sendMail(mailOptions);

      req.flash("success", "Message sent successfully. We will get back to you soon.");
      console.log('POST after set, session.flash =', req.session.flash); // debug only
      return res.redirect('/contact');

    } catch (err) {

      console.error('Contact POST error:', err);
      req.flash('error', 'There was an error sending your message. Please try again later.');
      return res.redirect('/contact');

    }
  }