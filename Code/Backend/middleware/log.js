function log(req, res, next) {
    console.log("Log...");
    next();
};

module.exports = log;