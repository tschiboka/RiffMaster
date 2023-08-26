const express = require("express");                                // RESTful Middleware
const mongoose = require("mongoose");                              // Database Handling
const router = express.Router();                                   // Router Middleware
const { Achievement, validate } = require("../models/achievement");// Get Achievement Model and Validation



router.get("/", async (req, res) => {                               // GET: ALL
    const achievements = await Achievement.find();
    res.json({ success: true, achievements });                      // Return All Achievements JSON
});



router.get("/:name", async (req, res) => {                          // GET: NAME
    // Find Achievement with Name
    const name = req.params.name;                                   // Get Name Parameter
    const achievements = await Achievement.find({ name: name });    // Get Achievement
    if (!achievements.length) return res.status(404)
                                        .json({
                                            success: true,
                                            message: `Couldn't Find Achievement with the Name: ${ name }`
                                        });

    return res.status(200).json({ success: true, achievements });
});



router.post("/", async (req, res) => {                              // POST
    // Validate Request Body
    const missingBody = { success: false, message: "Missing Body" };
    if (!req.body) return res.status(400).json(missingBody);        // Return 400 Bad Request: Missing Body
    const { error } = validate(req.body);                           // Validate Body
    if (error) return res.status(400).json({ success: false, message: error }); // Return 400 Bad Request: error

    const achievement = new Achievement(req.body);
    await achievement.save();
    return res.status(201).json({ success: true, achievement });    // Return 201: Successfully Created Resource
});



module.exports = router;