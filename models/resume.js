const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const resumeSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  fullName: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
  },

  email: {
    type: String,
    required: true,
    match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
  },

  phone: {
    type: String,
    required: true,
    match: [/^[0-9]{10}$/, "Phone must be 10 digits"],
  },

  summary: {
    type: String,
    required: true,
    minlength: 50,
    maxlength: 500,
  },

  education: [
    {
      institution: {
        type: String,
        required: true,
      },
      degree: {
        type: String,
        required: true,
      },

      // Use Number type for years so min/max validators work as expected
      startYear: {
        type: Number,
        required: true,
        min: 1950,
        max: new Date().getFullYear(),
      },

      endYear: {
        type: Number,
        required: true,
        min: 1900,
        max: new Date().getFullYear(),
        validate: {
          validator: function (value) {
            // inside a subdocument `this` is the subdoc — compare numbers
            return value >= this.startYear;
          },
          message: "Ending year must be greater than or equal to starting year",
        },
      },
    },
  ],

  experience: [
    {
      company: String,
      role: String,
      startDate: String,
      endDate: String,
      description: String,
    },
  ],

  skills: {
    type: [String],
    required: true,
    validate: {
      validator: function (arr) {
        return Array.isArray(arr) && arr.length > 0;
      },
      message: "At least one skill is required",
    },
  },

  projects: [
    {
      title: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      technologies: {
        type: [String],
        required: true,
      },
    },
  ],

  profileImage: String,
  role: String,

  templateType: {
    type: String,
    enum: ["simple", "modern", "classic", "creative", "designed"],
    default: "classic",
  },
}, { timestamps: true });

module.exports = mongoose.model("Resume", resumeSchema);
