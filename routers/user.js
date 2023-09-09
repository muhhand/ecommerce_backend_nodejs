const express = require("express");
const router = express.Router();
const User = require('../models/userModel');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.get(`/`, async (req, res) => {
    const userlist = await User.find().select("-passwordHash");
    if (!userlist) res.status(404).json({ status: "not found" });
    res.send(userlist);
});

//getUserById
router.post("/getById", async (req, res) => {
    const userReq = await User.findById({
        _id: req.body.id
    }).select("-passwordHash");
    if (userReq) {
        res.status(200).send(userReq);
    } else {
        res.status(404).json({ status: "failed" });
    }
});

//addUser
router.post("/register", async (req, res) => {
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    });
    userReq = await user.save().then(() => {
        res.status(200).json({ status: "done" });
    });
    if (!userReq) {
        res.status(404).json({ status: "failed" });
    }
});

//login
router.post("/login", async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    const secret = process.env.secret;
    if (!user) {
        res.status(400).json({ status: "not found" });
    }

    if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
        const token = jwt.sign(
            {
                userId: user._id,
                isAdmin: user.isAdmin
            },
            secret
        );
        res.status(200).json({ token: token, email: user.email });
    } else {
        res.status(400).json({ status: "password is wrong" });
    };


});


//DeleteUser
router.delete("/", (req, res) => {
    if (!mongoose.isValidObjectId(req.body.id)) {
        res.status(500).json({ status: "id not found" });
    }
    User.findByIdAndRemove({
        _id: req.body.id
    }).then(user => {
        if (user) {
            res.status(200).json({ status: "done" });
        } else {
            res.status(404).json({ status: "failed" });
        }
    }).catch((err) => {
        res.status(400).json({ status: "server error" });
    });
});

//getCount
router.get(`/get/count`, async (req, res) => {
    const userCount = await User.countDocuments();
    if (!userCount) return res.status(404).json({ status: "not found" });
    res.json({ count: userCount });
});

module.exports = router;