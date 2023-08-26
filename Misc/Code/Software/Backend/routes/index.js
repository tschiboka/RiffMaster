const express = require("express");                                // RESTful Middleware
const router = express.Router();                                   // Router Middleware
const config = require("config");

// Empty App Requrest
router.get("/", (req, res) => {                                       
    res.json({
        success: true,
        origin: req.headers.origin,
        server: req.headers.host,
    });
});


module.exports = router;
