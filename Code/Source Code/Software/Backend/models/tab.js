const Joi = require("joi");                                        // Use Joi for Validation and Date Formatting
const mongoose = require("mongoose");                              // Database Handling
const schema = new mongoose.Schema({                               // Tab Schema
    userID: {                                                      // USERID: FOREIGN KEY
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    title: {                                                       // TITLE: STRING, REQUIRED, MIN: 1, MAX: 255, UNIQUE
        type: String,
        required: true,
        minlength: 1,
        maxlength: 255,
        unique: true,
        trim: true,
    },
    artist: {                                                      // ARTIST: STRING, MIN: 1, MAX: 50
        type: String,
        minlength: 1,
        maxlength: 50,
        trim: true,
    },
    tuning: {                                                      // TUNING: STRING, DEFAULT: EADGBe, LENGTH: 6
        type: String,
        minlength: 6,
        maxlength: 6,
        default: "EADGBe",
        trim: true,
    },
    difficulty: {                                                  // DIFFICULTY: SHORT 1 - 10 DEFAULT: 1
        type: Number,
        min: 1,
        max: 10,
        default: 1,
    },
    tempo: {                                                       // TEMPO: (Beat / Minutes) NUMBER, 1 - 1000 ,DEFAULT: 120
        type: Number,
        min: 1,
        max: 1000,
        default: 120
    },
    content: {
        type: String,
        required: true,
        trim: true,
    },
    created: {
        type: Date, default: Date.now(),                           // CREATED: DATE DEFAULT NOW
    },
    updated: {
        type: Date, default: Date.now(),                           // UPDATED: DATE DEFAULT NOW
    }
});
const Tab = mongoose.model("Tab", schema);



function validateTab(tab) {
    const schema = {
        userID: Joi.objectId().required(),
        title: Joi.string().required().min(1).max(255),
        artist: Joi.string().min(1).max(50),
        tuning: Joi.string().min(6).max(6),
        difficulty: Joi.number().min(1).max(10),
        tempo: Joi.number().min(1).max(1000),
        content: Joi.string().required(),
        created: Joi.date(),
        updated: Joi.date()
    }

    return Joi.validate(tab, schema);
}



exports.Tab = Tab;
exports.validate = validateTab;