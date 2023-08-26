const Joi = require("joi");                                        // Use Joi for Validation and Date Formatting
const mongoose = require("mongoose");                              // Database Handling
const schema = new mongoose.Schema({                               // Tab Schema
    userID: {                                                      // USERID: FOREIGN KEY
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    tabID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tab",
        required: true,
    },
    score: {                                                  
        type: Number,
    },
    accuracy: {                                                  
        type: Number,
    },
    precision: {
        type: Number,
    },
    tempo: {                                                       
        type: Number,
        min: 1,
        max: 1000,
        default: 120
    },
    created: {
        type: Date, default: Date.now(),                           // CREATED: DATE DEFAULT NOW
    }
});
const Play = mongoose.model("Play", schema);



function validatePlay(play) {
    const schema = {
        userID: Joi.objectId().required(),
        tabID: Joi.objectId().required(),
        score: Joi.number().required(),
        accuracy: Joi.number().required(),
        precision: Joi.number().required(),
        tempo: Joi.number().min(1).max(1000),
        created: Joi.date(),
    }

    return Joi.validate(play, schema);
}



exports.Play = Play;
exports.validate = validatePlay;