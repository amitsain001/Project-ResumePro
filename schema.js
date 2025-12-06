// validation.js
const Joi = require("joi");
const joiObjectId = require("joi-objectid");

// attach the objectId validator to Joi
Joi.objectId = joiObjectId(Joi);

/**
 * User schemas
 */
// For user creation (signup) 
module.exports.userSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(6).max(128).required(), // passport-local-mongoose uses 'password'
  email: Joi.string().email({ tlds: { allow: false } }).required(),
  // optional: array of resume ids
  resumes: Joi.array().items(Joi.objectId()).optional()
});

/**
 * Resume schemas
 */
const educationItem = Joi.object({
  institution: Joi.string().max(256).allow('', null),
  degree: Joi.string().max(256).allow('', null),
  startYear: Joi.string().pattern(/^\d{4}$/).allow('', null),
  endYear: Joi.string().pattern(/^\d{4}$|^Present$/).allow('', null) // Accept 4-digit year or "Present"
});

const experienceItem = Joi.object({
  company: Joi.string().max(256).allow('', null),
  role: Joi.string().max(256).allow('', null),
  startDate: Joi.string().isoDate().allow('', null),
  endDate: Joi.string().isoDate().allow('', null),
  description: Joi.string().max(2000).allow('', null)
});

const projectItem = Joi.object({
  title: Joi.string().max(256).allow('', null),
  description: Joi.string().max(5000).allow('', null),
  technologies: Joi.string().max(128).optional()
});

// Create resume - user and required fields
module.exports.resumeSchema = Joi.object({
  user: Joi.objectId().optional(),
  fullName: Joi.string().max(256).required(),
  email: Joi.string().email({ tlds: { allow: false } }).required(),
  phone: Joi.string().pattern(/^[+\d][\d\s\-()]{5,20}$/).allow('', null), // simple phone validation
  summary: Joi.string().max(3000).allow('', null),

  education: Joi.array().items(educationItem).optional(),
  experience: Joi.array().items(experienceItem).optional(),
  skills: Joi.array().items(Joi.string().max(100)).optional(),
  projects: Joi.array().items(projectItem).optional(),

  profileImage: Joi.string().uri().allow('', null),
  role: Joi.string().max(128).allow('', null),

  templateType: Joi.string().valid('simple', 'modern', 'classic', 'creative', 'designed').default('classic')
});
