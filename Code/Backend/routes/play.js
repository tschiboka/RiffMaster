const express = require("express");                                // RESTful Middleware
const mongoose = require("mongoose");                              // Database Handling
const router = express.Router();                                   // Router Middleware
const { User } = require("../models/user")                         // Get Profile Model
const { Play, validate } = require("../models/play");              // Get Tab Model



router.get("/", async (req, res) => {                               // GET: ALL
    const plays = await Play.find();
    res.status(200).json({ success: true, plays });                 // Return 200 Success
});



router.get("/user/:id", async (req, res) => {                      // GET: ID
    // Validate ID
    const id = req.params.id;                                      // Id Parameter
    const isValidID = mongoose.Types.ObjectId.isValid(id);         // Validate ID Casting
    const messageID = `Couldn't Cast ${ id } to DB _id`;           // ID Cast Error Message
    const jsonCastErr = { success: false, error: messageID };      // JSON Cast Error Object
    if (!isValidID) return res.status(400).json(jsonCastErr);      // Return 400 ID Cast Error

    // Find If User Exists with UserID
    const user = await User.findById(id);                          // Existing User Object
    const noUserMsg =`Couldn't Find User with ID: ${ id }`;        // No User with userID Message
    const noUserJson = { success: false, message: noUserMsg };     // No User with userID JSON
    if (!user) return res.status(404).json(noUserJson);            // Return 404 Resource Not Found

    // Find Tabs with UserID
    const plays = await Play.find({ userID: id });                 // Existing User Object
    
    return res.status(200).json({ success: true, plays });          // Return 200 Success
});




router.post("/", async (req, res) => {                             // POST
    // Validate User Body
    if (!req.body) return res.status(400).json( { success: false, message: `There is no request body!` } );
    const { error } = validate(req.body);                          // Validate User Body
    const message400 = error?.details[0].message;                  // Invalid Body Message
    const json400 = { success: false, message: message400 };       // Invalid Body Object
    if (error) return res.status(400).send(json400);               // Return 400 Invalid Body   

    // Try Cast User ID
    const userID = req.body.userID;                                // Get ID Parameter
    const isValidID = mongoose.Types.ObjectId.isValid(userID)      // Validate ID Casting
    const messageID = `Couldn't Cast ${ userID } to DB _id`;       // ID Cast Error Message
    const jsonCastErr = { success: false, error: messageID };      // JSON Cast Error Object
    if (!isValidID) return res.status(400).json(jsonCastErr);      // Return 400 ID Cast Error

    // Find If User Exists with UserID
    const user = await User.findById(userID);                      // Existing User Object
    const noUserMsg =`Couldn't Find User with ID: ${ userID }`;    // No User with userID Message
    const noUserJson = { success: false, message: noUserMsg };     // No User with userID JSON
    if (!user) return res.status(404).json(noUserJson);            // Return 404 Resource Not Found

    // Try Cast Tab ID
    const tabID = req.body.userID;                                 // Get ID Parameter
    const isValidTabID = mongoose.Types.ObjectId.isValid(tabID)    // Validate ID Casting
    const messageTabID = `Couldn't Cast ${ tabID } to DB _id`;     // ID Cast Error Message
    const jsonCastTabErr = { success: false, error: messageTabID };// JSON Cast Error Object
    if (!isValidTabID) return res.status(400).json(jsonCastTabErr);// Return 400 ID Cast Error
    
    // Find If Tab Exists with UserID
    const tab = await User.findById(tabID);                        // Existing User Object
    const noTabMsg =`Couldn't Find User with ID: ${ tabID }`;      // No User with userID Message
    const noTabJson = { success: false, message: noTabMsg };       // No User with userID JSON
    if (!user) return res.status(404).json(noTabJson);             // Return 404 Resource Not Found

    const play = await new Play(req.body).save();                  // Create Tab

    return res.status(201).json({ success: true, play });          // Return Tab JSON
});



module.exports = router;