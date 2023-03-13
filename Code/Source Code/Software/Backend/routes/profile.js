const express = require("express");                                // RESTful Middleware
const mongoose = require("mongoose");                              // Database Handling
const router = express.Router();                                   // Router Middleware
const { Profile, validate } = require("../models/profile");        // Get User Model and Validation
const { User } = require("../models/user")                         // Get Profile Model



router.get("/:id", async(req, res) => {                            // GET: ID (Get Profile with User ID)
    // Validate ID
    const id = req.params.id;                                      // ID Parameter
    const isValidID = mongoose.Types.ObjectId.isValid(id);         // Validate ID Casting
    const messageID = `Couldn't Cast ${ id } to DB _id`;           // ID Cast Error Message
    const jsonCastErr = { success: false, error: messageID };      // JSON Cast Error Object
    if (!isValidID) return res.status(400).json(jsonCastErr);      // Return 400 ID Cast Error

    // Find User
    const user = await User.findById(id);
    const noUserMsg = `Couldn't Find User with ID: ${ id }`;       // No User Message
    const noUserJson = { success: false, message: noUserMsg };     // No User Message
    if (!user) return res.status(404).json(noUserJson);            // Return 404 No User Found
    
    // Find If Profile Exists with IserID
    const profile = await Profile.find({ userID: id });            // Get Profile by UserID
    const profMsg = `Could Not Find Profile with UserID: ${ id }`; // Profile Exists Message
    const profJson = { success: false, message: profMsg };         // Profile Exists Message
    if (!profile.length) return res.status(403).json(profJson);    // Return 404 Resource Not Found

    // Find User Profile
    res.json({ success: true, user });
});



router.post("/", async (req, res) => {                              // POST
    // Validate User Body
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
    
    // Find If Profile Exists with IserID
    const profileExist = await Profile.find({ userID });           // Get Profile by UserID
    const profMsg = `Profile Already Exists with UserID: ${ userID }`; // Profile Exists Message
    const profJson = { success: false, message: profMsg };         // Profile Exists Message
    if (profileExist.length) return res.status(403).json(profJson);    // Return 403 Resource Exists
    
    // Create User Profile
    const profile = new Profile(req.body);                         // New Profile Object
    await profile.save();                                          // Save
    res.json({ success: true, profile });                          // Return Profile JSON
});



module.exports = router;