const express = require("express");                                // RESTful Middleware
const router = express.Router();                                   // Router Middleware

// Empty App Requrest
router.get("/", (req, res) => {                                       
    res.send("Welcome!");
});


module.exports = router;
