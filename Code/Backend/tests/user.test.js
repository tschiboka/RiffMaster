const { User } = require("../models/user");
const jwt = require("jsonwebtoken");
const config = require("config");
const mongoose = require("mongoose");

describe("generateAuthenticationToken", () => {
    it ("Sould return a JWT Authentication Token", () => {
        const payload = { _id: new mongoose.Types.ObjectId().toHexString(), admin: false }
        const user = new User(payload);
        const token = user.generateAuthenticationToken();

        expect(token).not.toBeNull();
        expect(token._id).not.toBe(null);
        expect(token.admin).not.toBe(null);
        const decoded = jwt.verify(token, config.get("jwtPrivateKey"));
        expect(decoded).toMatchObject(payload);
    });
});

