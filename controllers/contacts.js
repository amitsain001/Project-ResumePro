const { validationResult } = require('express-validator');
const ContactMessage = require('../models/ContactMessage.js');
const sgMail = require('@sendgrid/mail');

// Configure SendGrid with API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.warn('SENDGRID_API_KEY is not set. Contact emails will not be sent.');
}

// RENDER CONTACT PAGE
module.exports.rendercontact = (req, res) => {
  res.render('contact', {
    old: {},
    errors: {},
    success: res.locals.success,
    error: res.locals.error,
  });
};

// HANDLE CONTACT POST
module.exports.postcontact = async (req, res) => {
  const errors = validationResult(req);

  const old = {
    name: req.body.name,
    email: req.body.email,
    subject: req.body.subject,
    message: req.body.message,
  };

  if (!errors.isEmpty()) {
    // send back validation errors
    return res.render('contact', {
      old,
      errors: errors.mapped(),
      success: null,
      error: null,
    });
  }

  try {
    // 1) Save message to DB (optional – same as your code)
    if (ContactMessage) {
      await ContactMessage.create({
        name: req.body.name,
        email: req.body.email,
        subject: req.body.subject,
        message: req.body.message,
        ip: req.ip,
      });
    }

    // 2) Build SendGrid email
    const msg = {
      to: process.env.CONTACT_TO_EMAIL,          // where YOU receive the message
      from: process.env.CONTACT_FROM_EMAIL,      // verified sender in SendGrid
      replyTo: req.body.email,                   // so you can reply directly to user
      subject: `[Contact] ${req.body.subject}`,
      text: `
From: ${req.body.name} <${req.body.email}>

Subject: ${req.body.subject}

Message:
${req.body.message}
      `.trim(),
      html: `
        <p><strong>From:</strong> ${req.body.name} &lt;${req.body.email}&gt;</p>
        <p><strong>Subject:</strong> ${req.body.subject}</p>
        <hr />
        <p>${req.body.message.replace(/\n/g, '<br>')}</p>
      `,
    };

    // 3) Send via SendGrid HTTP API
    await sgMail.send(msg);

    req.flash('success', 'Message sent successfully. We will get back to you soon.');
    return res.redirect('/contact');
  } catch (err) {
    console.error('Contact POST error:', err);
    req.flash('error', 'There was an error sending your message. Please try again later.');
    return res.redirect('/contact');
  }
};
