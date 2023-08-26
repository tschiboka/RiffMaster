const express = require("express");                                // RESTful Middleware
const mongoose = require("mongoose");                              // Database Handling
const router = express.Router();                                   // Router Middleware
const { User } = require("../models/user")                         // Get Profile Model
const { Tab, validate } = require("../models/tab");                // Get Tab Model



router.get("/", async (req, res) => {                               // GET: ALL
    const tabs = await Tab.find();
    res.status(200).json({ success: true, tabs });                 // Return 200 Success
});



router.get("/:id", async (req, res) => {                           // GET: ID
    // Validate ID
    const id = req.params.id;                                      // Id Parameter
    const isValidID = mongoose.Types.ObjectId.isValid(id);         // Validate ID Casting
    const messageID = `Couldn't Cast ${ id } to DB _id`;           // ID Cast Error Message
    const jsonCastErr = { success: false, error: messageID };      // JSON Cast Error Object
    if (!isValidID) return res.status(400).json(jsonCastErr);      // Return 400 ID Cast Error
    
    // Find Tab
    const tab = await Tab.findById(id);                            // Get Tab
    const noTabMsg = `Couldn't Find Tab with ID: ${ id }`;         // No Tab Message
    const noTabJson = { success: false, message: noTabMsg };       // No Tab JSON
    if (!tab) return res.status(404).json(noTabJson);              // Return 404 Resource Not Found

    return res.status(200).json({ success: true, tab });           // Return 200 Success
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
    const tabs = await Tab.find({ userID: id }).select("-content");// Existing User Object
    
    return res.status(200).json({ success: true, tabs });          // Return 200 Success
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

    // Find if Title Already Exist 
    const title = req.body.title;
    const exist = await Tab.findOne({ title });                    // Get Item with Body Title
    if (exist) {
        const existMsg = `Title ${ title } Already Exists!`;       // Title Exists Message
        const existJson = { success: false, message: existMsg, id: exist._id }; // Title Exists JOSN
        return res.status(409).json(existJson);                    // Return 409 Conflict Resource Exists
    }

    const tab = await new Tab(req.body).save();                    // Create Tab

    return res.status(201).json({ success: true, tab });           // Return Tab JSON
});



router.put("/:id", async (req, res) => {                           // PUT: ID
    // Validate ID
    const id = req.params.id;                                      // Id Parameter
    const isValidID = mongoose.Types.ObjectId.isValid(id);         // Validate ID Casting
    const messageID = `Couldn't Cast ${ id } to DB _id`;           // ID Cast Error Message
    const jsonCastErr = { success: false, error: messageID };      // JSON Cast Error Object
    if (!isValidID) return res.status(400).json(jsonCastErr);      // Return 400 ID Cast Error
    
    // Validate Tab Body
    if (!req.body) return res.status(400).json( { success: false, message: `There is no request body!` } );
    const { error } = validate(req.body);                          // Validate Tab Body
    const message400 = error?.details[0].message;                  // Invalid Body Message
    const json400 = { success: false, message: message400 };       // Invalid Body Object
    if (error) return res.status(400).send(json400);               // Return 400 Invalid Body   
    
    // Try Cast User ID
    const userID = req.body.userID;                                // Get ID Parameter
    const isValidUID = mongoose.Types.ObjectId.isValid(userID)     // Validate ID Casting
    if (!isValidUID) return res.status(400).json(jsonCastErr);     // Return 400 ID Cast Error
    
    // Find If User Exists with UserID
    const user = await User.findById(userID);                      // Existing User Object
    const noUserMsg =`Couldn't Find User with ID: ${ userID }`;    // No User with userID Message
    const noUserJson = { success: false, message: noUserMsg };     // No User with userID JSON
    if (!user) return res.status(404).json(noUserJson);            // Return 404 Resource Not Found
    
    // Find If Tab Exists with Tab ID
    const tab = await Tab.findById(id);                            // Existing Tab with Title
    const noTabMsg =`Couldn't Update Tab with ID: ${ id }`;        // No Tab with userID Message
    const noTabJson = { success: false, message: noTabMsg };       // No Tab with userID JSON
    if (!tab) return res.status(404).json(noTabJson);              // Return 404 Resource Not Found

    // If User Has No Authority
    if (tab.userID.toString() !== req.body.userID) {
        return res.status(403).json({
            success: false,
            message: "Not Autorised to Modify This Tab!"
        });
    }

    // Update Tab
    tab.userID = req.body.userID;
    tab.title = req.body.title;
    tab.artist = req.body.artist || tab.artist;
    tab.tuning = req.body.tuning || tab.tuning;
    tab.difficulty = req.body.difficulty || tab.difficulty;
    tab.tempo = req.body.tempo || tab.tempo;
    tab.content = req.body.content || tab.content;
    tab.isPublic = req.body.isPublic || tab.isPublic;
    tab.cover = req.body.cover || tab.cover;
    tab.created = req.body.created || tab.created;
    tab.updated = Date.now();

    // Save and Return Tab
    await tab.save();
    return res.status(201).json({ success: true, tab });           // Return 201 Created and Success
});



router.delete("/:id", async (req, res) => {
    // Validate ID
    const id = req.params.id;                                      // Id Parameter
    const isValidID = mongoose.Types.ObjectId.isValid(id);         // Validate ID Casting
    const messageID = `Couldn't Cast ${ id } to DB _id`;           // ID Cast Error Message
    const jsonCastErr = { success: false, message: messageID };      // JSON Cast Error Object
    if (!isValidID) return res.status(400).json(jsonCastErr);      // Return 400 ID Cast Error

    // Find If Tab Exists with ID
    const tab = await Tab.findById(id);                            // Existing Tab Object
    const noTabMsg =`Couldn't Find Tab with ID: ${ id }`;          // No Tab with userID Message
    const noTabJson = { success: false, message: noTabMsg };       // No Tab with userID JSON
    if (!tab) return res.status(404).json(noTabJson);              // Return 404 Resource Not Found

    const result = await tab.deleteOne({ _id: id });               // Delete Tab Item
    return res.status(200).json({ success: true });        // Return 204 No Content
});



module.exports = router;