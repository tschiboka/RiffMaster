function admin(req, res, next) {
    // if (!req.user?.admin) res.status(403).json({
        // success: false,
        // message: "Access Denied: User has no Admin Privileges!"
    // });
    next();
};

module.exports = admin;