require("express-async-errors");                                   // Automatic Try Catch for Internal Errors
const error = require("./middleware/error");                       // Error Middleware
const Joi = require("joi");                                        // Use Joi for Validation
const express = require("express");                                // RESTful Middleware
const helmet = require("helmet");                                  // HTTP Headers
const morgan = require("morgan");                                  // Use for Request Logging
const log = require("./middleware/log");                           // Custom Logging
const admin = require("./middleware/admin");                       // Custom Admin
const config = require("config");                                  // Configuration Settings
const debug = require("debug")("app:startup");                     // Startup Debug Consoling
const dbDebbuger = require("debug")("app:db");                     // Database Debug Consoling
const mongoose = require("mongoose");                              // Database Handling
const app = express();                                             // Middleware Pipeline
const cors = require('cors');                                      // CORS Settings

// Cross-Origin Shared Resources
app.use(express.json({
    type: ['application/json', 'text/plain']
}));

app.use(cors({
    methods: 'GET, POST, PUT, DELETE',
    //origin: ['http://127.0.0.1:5501', 'http://localhost:5001', 'localhost:5001', "localhost"] // Allowed Origins
    origin: "*"
}));



app.use(express.json());                                           // Start Middleware Pipeline
app.use(helmet());
app.use(log);
app.use(admin);




// Environmental Variables
const PORT = process.env.PORT || 5000;                             // PORT
const NODE_ENV = app.get("env");                                   // ENVIRONMENT (default "development")
if (NODE_ENV === "development") app.use(morgan("tiny"));
const jwtPrivateKey = config.get("jwtPrivateKey");                 // Get JWT Private Key
if (!jwtPrivateKey) {
    console.log("FATAL ERROR: JWT Private Key is Not Defined!");
    process.exit(1);
}



// Routers
const index = require("./routes/index");
const users = require("./routes/user");
const login = require("./routes/login");
const profile = require("./routes/profile");
const tab = require("./routes/tab");
const play = require("./routes/play");
const achievements = require("./routes/achievement");
const subscribe = require("./routes/subscribe");
const confirm = require("./routes/confirm");

app.use("/", index);                                               // Index API Route
app.use("/api/users", users);                                      // Users API Route
app.use("/api/login", login);                                      // Login API Route
app.use("/api/profiles", profile);                                 // Profile API Route
app.use("/api/tabs", tab);                                         // Tab API Route
app.use("/api/play", play);                                        // Play API Route
app.use("/api/achievements", achievements);                        // Achievements API Route
app.use("/api/subscribe", subscribe);                              // Subscribe API Route
app.use("/api/confirm", confirm);                                  // Confirm API Route

// Error Middleware (Must be the Last in the Pipeline)
app.use(error);


// Listen Port
const server = app.listen(PORT, () => {                             // Display Log
    debug(`\n${ config.get("name") }`);
    debug(`PORT:        ${ PORT }`);
    debug(`ENVIRONMENT: ${ NODE_ENV }`);
    //debug(config.get("password"))
});



// Database Connection
mongoose.connect(config.get("db"))
    .then(() => dbDebbuger(`     DB:          ${ config.get("db") }`))
    .catch(err => dbDebbuger(`     DB:          Could Not Connect to: ${ config.get("db") }\n${ err }`));




module.exports.server = server;