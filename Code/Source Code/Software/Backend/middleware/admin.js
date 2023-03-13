function admin(req, res, next) {
    console.log("Admin...");
    next();
};

module.exports = admin;