const mongoose = require('mongoose');
const Token = mongoose.model('Token', {
    token: {
        type: String,
        reqired: true,
    }
});

module.exports = Token;