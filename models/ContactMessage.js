// models/ContactMessage.js
const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  subject: String,
  message: String,
  ip: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ContactMessage', contactSchema);
