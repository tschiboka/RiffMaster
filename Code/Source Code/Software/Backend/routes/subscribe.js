const { model } = require("mongoose");
const express = require("express");                                // RESTful Middleware
const router = express.Router();                                   // Router Middleware
const nodemailer = require('nodemailer');                          // Mail Sending
const { User } = require("../models/user");                        // User Model
const config = require("config");                                  // Get Environmental Variables
const jwt = require("jsonwebtoken");                               // JSON Web Token
const Token = require("../models/token");                          // Verification Token Model



router.post("/", async (req, res) => {
    // Check If User Exist with Email
    console.log(req.body.user)
    const email = req.body.user.email;                             // Get Email from Body
    const password = req.body.password;                            // Get Password from Body
    const userExists = await User.findOne({ email });              // Get User with Email
    if (userExists) return res.status(403).json({                  // Return 403 Resource Already Exists
        success: false,
        message: "User Exists with Email"
    });

    // Encrypt Password

    // Create New User
    const user = new User({ email, password });

    // Send Email Confirmation Link
    const EMAIL_ADDRESS = config.get('emailAddress');              // Get Email From Environmental Variables
    const EMAIL_PASSWORD = config.get('emailPassword');            // Get Email Server Password From Environmental Variables
    const EMAIL_SERVER = config.get('emailServer');                // Get Server Type From Environmental Variables
    const jwtPrivateKey = config.get("jwtPrivateKey");             // Get JWT Private Key
    const tokenString = jwt.sign(req.body.user, jwtPrivateKey);    // Create a JWT Signature
    const url = `http://127.0.0.1:${ process.env.PORT }/api/confirm/`; // TEMP URL to Localhost
    const confirmationLinkURL = url + tokenString;                
    const token = await new Token({ token: tokenString }, config.get('jwtPrivateKey')); // Create Token on Database
    await token.save();                                            // Save Token

    const mailOptions = {                                          // Email Specifications
        from: EMAIL_ADDRESS,                                       
        to: email,                                                 // From Request
        subject: 'RiffMaster | Email Address Verification',
        html: `
            <h1>RiffMaster Account Verification</h1>
            <h2>Welcome to my RiffMaster subscriptions!</h2>
            <p>
                We couldn't be more excited to have you join our amazing guitar learning platform!
                <br />
                Please verify your email address by clicking on the link below.
            </p>
            <a href="${ confirmationLinkURL }">Verify Email Address</a>`
    };

    const transporter = nodemailer.createTransport({
        auth: {
            user: EMAIL_ADDRESS,
            pass: EMAIL_PASSWORD
        },
        secure: true,
        port: 465,
        tls: { rejectUnauthorized: false },
        host: EMAIL_SERVER,
    });
    
    const sent = await transporter.sendMail(mailOptions);
    if (sent.accepted[0]) res.status(201).json({ success: true, message: "Confirmation Email Sent!" });
    if (!sent.accepted[0]) res.status(500).json({ success: true, message: "Could Not Send Confirmation Email!" });
});



module.exports = router;