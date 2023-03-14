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



app.use(express.json());                                           // Start Middleware Pipeline
app.use(helmet());
app.use(log);
app.use(admin);



// Environmental Variables
const PORT = process.env.PORT || 5000;                             // PORT
const NODE_ENV = app.get("env");                                   // ENVIRONMENT (default "development")
if (NODE_ENV === "development") app.use(morgan("tiny"));



// Routers
const index = require("./routes/index");
const users = require("./routes/user");
const profile = require("./routes/profile");
const tab = require("./routes/tab");
app.use("/", index);                                               // Index API Route
app.use("/api/users", users);                                      // Users API Route
app.use("/api/profiles", profile);                                 // Profile API Route
app.use("/api/tabs", tab);                                         // Tab API Route




// Listen Port
app.listen(PORT, () => {                                           // Display Log
    debug(`\n${ config.get("name") }`);
    debug(`PORT:        ${ PORT }`);
    debug(`ENVIRONMENT: ${ NODE_ENV }`);
    //debug(config.get("password"))
});



// Database Connection
mongoose.connect(config.get("db"))
.then(() => dbDebbuger(`     DB:          ${ config.get("db") }`))
.catch(err => dbDebbuger(`     DB:          Could Not Connect to: ${ config.get("db") }\n${ err }`));
