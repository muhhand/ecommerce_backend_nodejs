const express = require("express");
const router = express.Router();
const Category = require('../models/categoryModel');

//getAllCategories
router.get(`/`, async (req, res) => {
    const categoryList = await Category.find();
    if (!categoryList) res.status(404).json({ status: "not found" });
    res.status(200).send(categoryList);
});

//getCategoryById
router.post("/getById", async (req, res) => {
    const catgeoryReq = await Category.findById({
        _id: req.body.id
    });
    if (catgeoryReq) {
        res.status(200).send(catgeoryReq);
    } else {
        res.status(404).json({ status: "failed" });
    }
});

//addCategory
router.post("/", async (req, res) => {
    let category = new Category({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color,
    });
    categoryReq = await category.save().then(() => {
        res.status(200).json({ status: "done" });
    });
    if (!category) {
        res.status(404).json({ status: "failed" });
    }
});

//updateCategory
router.put('/', async (req, res) => {
    const category = await Category.findOneAndUpdate({
        _id: req.body.id,
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color
    });
    if (!category) {
        res.status(404).json({ status: "failed" });
    } else {
        res.status(200).json({ status: "done" });
    }
});


//DeleteCategory
router.delete("/", (req, res) => {
    Category.findByIdAndRemove({
        _id: req.body.id
    }).then(category => {
        if (category) {
            res.status(200).json({ status: "done" });
        } else {
            res.status(404).json({ status: "failed" });
        }
    }).catch((err) => {
        res.status(400).json({ status: "server error" });
    });
});

module.exports = router;