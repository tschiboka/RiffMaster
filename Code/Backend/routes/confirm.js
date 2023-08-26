const express = require("express");                                // RESTful Middleware
const router = express.Router();                                   // Router Middleware
const { Profile, validate: validateProfile } = require("../models/profile"); // Get Profile Model and Validation
const { User, validate: validateUser } = require("../models/user")           // Get User Model and 
const config = require("config");                                  // Get Environmental Variables
const jwt = require("jsonwebtoken");                               // JSON Web Token
const Token = require("../models/token");                          // Verification Token Model
const bcrypt = require("bcrypt");                                  // Password Encryption

router.get("/:token", async (req, res) => {
    // Match Tokens
    const jwtPrivateKey = config.get("jwtPrivateKey");             // Get JWT Private Key from Environmental Variables
    const token = req.params.token;                                // Get Received Token
    let storedToken;
    let storedTokenID;
    try {
        // Decode Request Token
        const decoded = jwt.verify(token, jwtPrivateKey);          // Decode Token
        req.user = decoded;                                        // Set User
        if (!req.user) return res.status(400)                      // Return 400 No User In Token
            .json({ success: false, 
                    message: `There is no User in Request Body Token!`});
        
        
        // Decode Stored Token
        storedToken = await Token({ token });                      // Decode Token
        const decodedToken = jwt.verify(storedToken.token, jwtPrivateKey);
        storedTokenID = decodedToken._id;
        if (req.user.email !== decodedToken.email) return res.status(400) // Return 400 No Token Emails Dont Match
        .json({ success: false, 
                message: `The Token Does Not Match!`});

    // Throw Exception If Any Token Fails
    } catch (ex) {
        return res.status(400).json({                              // Return 400 Invalid JWT
            success: false, error: ex,
            message: "Access Denied: Invalid JWT!" }); 
    }

    // Validate User Body
    const { userError } = validateUser(req.user);                  // Validate User Body
    const userMsg = userError?.details[0].message;                 // Invalid Body Message
    const userJson = { success: false, message: userMsg };         // Invalid Body Object
    if (userError) return res.status(400).json(userJson);
    
    const user = new User(req.user);                               // Create User
    if (!user) return res.status(400).json( { success: false, message: `There is no Request Body!` } );
    
    // Find If User Exists with Email
    const userExist = await User.findOne({ email: req.user.email });  // Existing User Object
    const email = req.user.email;                                  // Get Email
    const existMsg =`Existing User with Email: ${ email }`;        // User Found with Email Message
    const existJson = { success: false, message: existMsg };       // User Found with Email JSON
    if (userExist) return res.status(403).json(existJson);         // Return 403 Resource Exists

    // Validate Profile Body
    const profile = new Profile(req.user.profile);                 // Create Profile
    const { profErr } = validateProfile(req.user.profile);         // Validate User Body
    const profMsg = profErr?.details[0].message;                   // Invalid Body Message
    const profJson = { success: false, message: profMsg };         // Invalid Body Object
    if (profErr) return res.status(400).send(profJson);            // Return 400 Invalid Body   
    
    
    // Hash Password
    const salt = await bcrypt.genSalt(10);                         // Generate Salt
    const hashed = await bcrypt.hash(req.user.password, salt);     // Encrypt with Salt
    
    // Upddate and Save User and Profile
    user.profile = profile._id;                                    // Add Profile ID
    user.password = hashed;                                        // Store Hashed Password
    user.save();
    profile.save();

    // Delete Token And Redirect
    const delToken = await Token.deleteOne({ _id: storedTokenID });  // Delete with ID
    res.status(301).redirect(`http://127.0.0.1:5501/Frontend/src/pages/login.html`);
});



module.exports = router;