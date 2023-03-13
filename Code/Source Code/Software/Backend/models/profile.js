const Joi = require("joi");                                        // Use Joi for Validation and Date Formatting
const mongoose = require("mongoose");                              // Database Handling
const GENDER = ["male", "female", "X"];                            // Gender Enum
const ACCOUNT_TYPES = ["trial", "free", "standard", "premium"];    // Accoutn Types Enum
const schema = new mongoose.Schema({
    userID: {                                                      // USERID: Foreign Key
        type: String,
        required: true,
        trim: true,
    },
    firstName: {                                                   // FIRSTNAME: STRING REQUIRED, MIN: 1, MAX: 50
        type: String,   
        required: true,
        maxlength: 50,
        minlength: 1,
        trim: true,
        validate: /^[\w\-\s]+$/                                    // Alpha Numeric and Space and Dashes
    },
    lastName: {                                                    // FIRSTNAME: STRING REQUIRED, MIN: 1, MAX: 50
        type: String,   
        required: true,
        maxlength: 50,
        minlength: 1,
        trim: true,
        validate: /^[\w\-\s]+$/                                    // Alpha Numeric and Space and Dashes
    },
    dateOfBirth: { type: Date, required: true },                   // DATEOFBIRTH: DATE REQUIRED
    gender: {                                                      // GENDER: ENUM REQIURED, LOWERCASE
        type: String,
        enum: GENDER,
        required: true,
        lowercase: true,
        trim: true
    },
    country: {                                                     // COUNTRY: STRING REQUIRED, MIN: 2, MAX: 50
        type: String,   
        required: true,
        maxlength: 50,
        minlength: 2,
        trim: true,
        validate: /^[\w\-\s]+$/                                    // Alpha Numeric and Space and Dashes
    },
    province: {                                                    // PROVINCE: STRING, MIN: 2, MAX: 50
        type: String,   
        maxlength: 50,
        minlength: 2,
        trim: true,
        validate: /^[\w\-\s]+$/                                    // Alpha Numeric and Space and Dashes
    },
    city: {                                                        // CITY: STRING REQUIRED, MIN: 2, MAX: 50
        type: String,   
        required: true,
        maxlength: 50,
        minlength: 2,
        trim: true,
        validate: /^[\w\-\s]+$/                                    // Alpha Numeric and Space and Dashes
    },
    addressLine1: {                                                // ADDRESSLINE1: STRING REQUIRED, MIN: 5, MAX: 100
        type: String,   
        required: true,
        maxlength: 100,
        minlength: 5,
        trim: true,
    },
    addressLine2: {                                                // ADDRESSLINE2: STRING, MIN: 5, MAX: 100
        type: String,   
        maxlength: 100,
        minlength: 5,
        trim: true,
    },
    phone: {                                                       // PHONE: STRING REQUIRED, MIN: 8, MAX: 20
        type: String,   
        required: true,
        maxlength: 20,
        minlength: 8,
        trim: true,
        validate: /^[\d\-\s]+$/                                    // Numeric and Space and Dashes
    },
    about: {                                                       // ABOUT: STRING MAX: 10,000
        type: String,   
        maxlength: 10000,
        trim: true,
    },
    avatar: {                                                      // AVATAR: STRING MAX: 255
        type: String,   
        maxlength: 255,
        trim: true,
    },
    accountType: {                                                 // ACCOUNTTYPE: ENUM REQIURED, LOWERCASE
        type: String,
        enum: ACCOUNT_TYPES,
        default: "free",                                           // Accounts Default Free
        lowercase: true,
        trim: true
    },
});
const Profile = mongoose.model("Profile", schema);



function validate(profile) {
    const schema = {
        userID: Joi.objectId().required(),
        firstName: Joi.string().required().min(1).max(50),
        lastName: Joi.string().required().min(1).max(50),
        dateOfBirth: Joi.date(),
        gender: Joi.string().required(),
        country: Joi.string().required().min(2).max(50),
        province: Joi.string().min(2).max(50),
        city: Joi.string().required().min(2).max(50),
        addressLine1: Joi.string().required().min(5).max(100),
        addressLine2: Joi.string().min(5).max(100),
        phone: Joi.string().required().min(8).max(20),
        about: Joi.string().max(10000),
        avatar: Joi.string().max(255),
        accountType: Joi.string()
    }
    return Joi.validate(profile, schema);
}



exports.Profile = Profile;
exports.validate = validate;