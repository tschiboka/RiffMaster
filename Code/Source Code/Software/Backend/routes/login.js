const express = require("express");                                // RESTful Middleware
const router = express.Router();                                   // Router Middleware
const { User, validate } = require("../models/user");              // Get User Model
const bcrypt = require("bcrypt");                                  // Hashing Passwords



router.post("/", async (req, res) => {                             // POST
    // Validate User Body
    if (!req.body) return res.status(400).json( { success: false, message: `There is no request body!` } );
    const { error } = validate(req.body);                          // Validate User Body
    const message400 = error?.details[0].message;                  // Invalid Body Message
    const json400 = { success: false, message: message400 };       // Invalid Body Object
    if (error) return res.status(400).send(json400);               // Return 400 Invalid Body   

    // Find and Validate User
    const email = req.body.email;
    const user = await User.findOne({ email });                    // Get User
    const unAuthMsg = `Unauthorized: Invalid email or Password!`;  // Create 404 Error Message
    const unAuthJson = { success: false, message: unAuthMsg };     // Error JSON to Send Back
    if (!user) return res.status(401).json(unAuthJson);            // Return 401 Unauthorized

    // Desalt and Compare Password
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(401).json(unAuthJson);   // Return 401 Unauthorized

    const token = user.generateAuthenticationToken();              // Tokenize
    
    const updated = { ...user }._doc;                              // Dereference User (Cannot Delete Password on Prototype)
    delete updated.password;                                       // Delete Password                                    
    res
        .status(201)
        .header("x-auth-token", token)                             // Append Header with Token
        .json({ success: true, user: updated });                   // Return 201 Created and Success
});



module.exports = router;