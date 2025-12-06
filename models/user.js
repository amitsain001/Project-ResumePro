const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

let userSchema = new mongoose.Schema ( {

    email : {
        type : String ,
        required : true ,
    },

    username : {
        type: String ,
        required : true ,
        unique : true ,
    } ,

    resumes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
    },
  ],

}, { timestamps: true });

userSchema.plugin(passportLocalMongoose);     // This will automatically defines the username , hash password , salting , hashing

module.exports = mongoose.model('User', userSchema);