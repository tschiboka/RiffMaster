const jwt = require("jsonwebtoken");                               // JSON Web Token
const config = require("config");                                  // Get Environmental Variables


module.exports = function (req, res, next) {
    const token = req.header("x-auth-token");                      // Get Token from Header
    if (!token) return res.status(401).json({                      // Return 401 No Token
        success: false,
        message: "Access Denied: No Token Provided!"
    });

    const jwtPrivateKey = config.get("jwtPrivateKey");             // Get JWT Private Key from Environmental Variables
    try {
        const decoded = jwt.verify(token, jwtPrivateKey);          // Decode Token
        req.user = decoded;
        next();
    } catch (ex) {
        return res.status(400).json({                              // Return 400 Invalid JWT
            success: false,
            message: "Access Denied: Invalid JWT!",
            error: ex
        }); 
    }
}
