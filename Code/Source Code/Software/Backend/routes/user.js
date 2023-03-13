const express = require("express");                                // RESTful Middleware
const mongoose = require("mongoose");                              // Database Handling
const router = express.Router();                                   // Router Middleware
const { User, validate } = require("../models/user");              // Get User Model



router.get("/", async(req, res) => {                               // GET: ALL
    const users = await User.find();
    res.json({ success: true, users });
});



router.get("/:id", async(req, res) => {                            // GET: ID
    // Validate ID
    const id = req.params.id;                                      // Id Parameter
    const isValidID = mongoose.Types.ObjectId.isValid(id);         // Validate ID Casting
    const messageID = `Couldn't Cast ${ id } to DB _id`;           // ID Cast Error Message
    const jsonCastErr = { success: false, error: messageID };      // JSON Cast Error Object
    if (!isValidID) return res.status(400).json(jsonCastErr);      // Return 400 ID Cast Error

    // Find and Validate User
    const user = await User.findById(id);                          // Get User
    const message404 = `User with ID ${ id } Not Found!`;          // Create 404 Error Message
    const json404 = { success: false, error: message404 };         // Error JSON to Send Back
    if (!user) return res.status(404).json(json404);               // Resource Not Found
    
    res.json({ success: true, user });
});



router.post("/", async(req, res) => {                              // POST
    // Validate User Body
    const { error } = validate(req.body);                          // Validate User Body
    const message400 = error?.details[0].message;                  // Invalid Body Message
    const json400 = { success: false, message: message400 };       // Invalid Body Object
    if (error) return res.status(400).send(json400);               // Return 400 Invalid Body   
    
    // Find If Email Already Exists
    const email = req.body.email;                                  // Email
    const emailExist = await User.findOne({'email': email });      // Existing User Email
    const emailMessage = `User Exists with Email: ${ email }`;     // Email Exists Message
    const emailJson = { success: false, message: emailMessage };   // Email Exists Object
    if (emailExist) return res.status(403).json(emailJson);        // Return 403 Resource Already Exists 

    // Find If User Name Already Exists
    const userName = req.body.userName;                            // User Name
    const nameExist = await User.findOne({'userName': userName }); // Existing User Email
    const nameMessage = `User Exists with Name: ${ userName }`;    // User Name Exists Message
    const nameJson = { success: false, message: nameMessage };     // User Name Exists Object
    if (nameExist) return res.status(403).json(nameJson);          // Return 403 Resource Already Exists 

    const user = new User(req.body);                               // Create User
    await user.save();

    res.json({ success: true, user });
});



// Put Request Only Updates (Email, User Name, Admin, Active)
router.put("/:id", async(req, res) => {                            // PUT
    // Validate ID
    const id = req.params.id;                                      // Get Id
    const isValidID = mongoose.Types.ObjectId.isValid(id);         // Validate ID Casting
    const messageID = `Couldn't Cast ${ id } to DB _id`;           // ID Cast Error Message
    const jsonCastErr = { success: false, error: messageID };      // JSON Cast Error Object
    if (!isValidID) return res.status(400).json(jsonCastErr);      // Return 400 ID Cast Error

    // Find and Validate User
    const user = await User.findById(id);                          // Get User
    const message404 = `User with ID ${ id } Not Found!`;          // Create 404 Error Message
    const json404 = { success: false, error: message404 };         // Error JSON to Send Back
    if (!user) return res.status(404).json(json404);               // Resource Not Found

    // Update User
    if (!req.body) return res.status(400).json( { success: false, message: `There is no request body!` } );

    // Find If Email Already Exists
    const email = req.body.email;                                  // Email
    const emailExist = await User.findOne({'email': email });      // Existing User Email
    const emailMessage = `User Exists with Email: ${ email }`;     // Email Exists Message
    const emailJson = { success: false, message: emailMessage };   // Email Exists Object
    if (emailExist) return res.status(403).json(emailJson);        // Return 403 Resource Already Exists 

    // Find If User Name Already Exists
    const userName = req.body.userName;                            // User Name
    const nameExist = await User.findOne({'userName': userName }); // Existing User Email
    const nameMessage = `User Exists with Name: ${ userName }`;    // User Name Exists Message
    const nameJson = { success: false, message: nameMessage };     // User Name Exists Object
    if (nameExist) return res.status(403).json(nameJson);          // Return 403 Resource Already Exists 

    // Update User Properties
    user.userName = req.body.userName || user.userName;            // Update User Name
    user.email = req.body.email || user.email;                     // Update Email
    user.active = req.body.active || user.active;                  // Update Active
    user.updated = Date.now();                                     // Update Date and Time Stamp

    await user.save();                                             // Save and Return
    res.json({ success: true, user });
});



module.exports = router;





// router.delete("/:id", (req, res) => {                              // DELETE
//     const user = users.find(u => u.id === parseInt(req.params.id));// Get User
//     if (!user) return res.status(404).send(`User with ID ${ req.params.id } Not Found!`); // Resource Not Found

//     const index = users.indexOf(user);
//     users.splice(index, 1);

//     res.send(user);
// });

// async function deleteUser() {
//     const result = await User.deleteOne({ _id: "640bd9133b1d960f548f41d0"});

//     return result;
// }
