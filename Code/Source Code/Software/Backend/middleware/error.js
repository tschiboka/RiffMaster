module.exports = function(err, req, res, next) {
    console.log(err)
    res.status(500).json({                                         // Internal Server Error
        success: false,
        message: "Something Went Wrong!",
        error: err.message,
    });
}