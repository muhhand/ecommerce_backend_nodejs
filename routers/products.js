const express = require("express");
const router = express.Router();
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const mongoose = require("mongoose");
const multer = require("multer");
// const upload = multer({ dest: 'uploads/' });

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid image type');


        if (isValid) {
            uploadError = null;
        }
        cb(uploadError, 'puplic/uploads')
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`)
    }
})

const upload = multer({ storage: storage });


//getAllProducts
router.get(`/`, async (req, res) => {
    let filter = {};
    if (req.query.categories) {
        filter = { category: req.query.categories.split(',') }
    }
    const productlist = await Product.find(filter).populate({ path: "category", strictPopulate: false, model: Category });
    if (!productlist) res.status(404).json({ status: "not found" });
    res.send(productlist);
});


//getProductById
router.post('/getById', async (req, res) => {
    const product = await Product.findById(req.body.id).populate({ path: "category", strictPopulate: false, model: Category });
    if (!product) res.status(404).json({ status: "not found" });
    res.send(product);
});

//addProduct
router.post(`/`, upload.single('image'), async (req, res) => {
    const category = await Category.findById(req.body.category)
    if (!category) return res.status(500).json({ status: "category not found" });
    const fileName = req.body.fileName;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: `${basePath}${fileName}`,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured
    });

    productReq = await product.save().then(() => {
        res.status(200).json({ status: "done" });
    }).catch((err) => {
        res.send(err);
    });
    if (!productReq) {
        res.status(500).json({ status: "failed" });
    }
});


//updateProduct 
router.put('/', async (req, res) => {
    if (!mongoose.isValidObjectId(req.body.id)) {
        res.status(500).json({ status: "id not found" });
    }
    const category = await Category.findById(req.body.category)
    if (!category) return res.status(500).json({ status: "category not found" });
    const product = await Product.findOneAndUpdate({
        _id: req.body.id,
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: req.body.image,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured
    });
    if (!product) {
        res.status(404).json({ status: "failed" });
    } else {
        res.status(200).json({ status: "done" });
    }
});

//DeleteProduct
router.delete("/", (req, res) => {
    if (!mongoose.isValidObjectId(req.body.id)) {
        res.status(500).json({ status: "id not found" });
    }
    Product.findByIdAndRemove({
        _id: req.body.id
    }).then(product => {
        if (product) {
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
    const productCount = await Product.countDocuments();
    if (!productCount) return res.status(404).json({ status: "not found" });
    res.json({ count: productCount });
});

//getFeatured
router.get(`/get/featured`, async (req, res) => {
    const productFeatured = await Product.find({ isFeatured: true });
    if (!productFeatured) return res.status(404).json({ status: "not found" });
    res.json(productFeatured);
});



//uploadMultiFiles
router.put(
    '/gallery-images/:id',
    upload.array('images', 10),
    async (req, res) => {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).send('Invalid Product Id')
        }
        const files = req.files
        let imagesPaths = [];
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

        if (files) {
            files.map(file => {
                imagesPaths.push(`${basePath}${file.filename}`);
            })
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            {
                images: imagesPaths
            },
            { new: true }
        )

        if (!product)
            return res.status(500).send('the gallery cannot be updated!')

        res.send(product);
    }
)


module.exports = router;