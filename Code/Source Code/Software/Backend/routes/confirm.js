const express = require("express");                                // RESTful Middleware
const router = express.Router();                                   // Router Middleware
const { User } = require("../models/user");                        // User Model
const config = require("config");                                  // Get Environmental Variables
const jwt = require("jsonwebtoken");                               // JSON Web Token
const Token = require("../models/token");                          // Verification Token Model

router.get("/:token", async (req, res) => {
    const token = req.params.token;
    const jwtPrivateKey = config.get("jwtPrivateKey");             // Get JWT Private Key from Environmental Variables
    try {
        const decoded = jwt.verify(token, jwtPrivateKey);          // Decode Token
        req.user = decoded;
        
    } catch (ex) {
        return res.status(400).json({                              // Return 400 Invalid JWT
            success: false,
            message: "Access Denied: Invalid JWT!",
            error: ex
        }); 
    }
});



module.exports = router;