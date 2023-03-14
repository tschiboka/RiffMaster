const Joi = require("joi");                                        // Use Joi for Validation and Date Formatting
const mongoose = require("mongoose");                              // Database Handling
const schema = new mongoose.Schema({
    name: {                                                        // NAME: STRING, REQUIRED, UNIQUE, MIN: 3, MAX: 20, LOWERCASE
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minlength: 3,
        maxlength: 20
    },
    description: {                                                  // DESCRIPTION: STRING, REQUIRED, MIN: 5, MAX: 255
        type: String,
        requried: true,
        trim: true,
        minlength: 5,
        maxlength: 255
    },
    achievementType: {                                              // ACHIEVEMENT_TYPE: STRING, REQUIRED, MIN: 3, MAX: 20
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 20,
    },
    value: {                                                        // VALUE: NUMBER 1 - 10, DEFAULT 1
        type: Number,
        default: 1,
        min: 1,
        max: 10,
    },
    criteria: {                                                     // CRITERIA: NUMBER 0 - 10000
        type: Number,
        required: true,
        min: 0,
        max: 1000
    }
});
const Achievement = mongoose.model("Achievement", schema);          // Achievement Model



function validate(achievement) {
    const schema = {
        name: Joi.string().required().min(3).max(20),
        description: Joi.string().required().min(5).max(255),
        achievementType: Joi.string().required().min(3).max(20),
        value: Joi.number().min(1).max(10),
        criteria: Joi.number().required().min(0).max(1000)
    };
    return Joi.validate(achievement, schema);
}



module.exports.Achievement = Achievement;
module.exports.validate = validate;