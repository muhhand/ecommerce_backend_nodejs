const express = require("express");
const router = express.Router();
const Order = require('../models/orderModel');
const OrderItem = require('../models/orderItemModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');
const Category = require("../models/categoryModel");

router.get(`/`, async (req, res) => {
    const orderList = await Order.find().populate({
        path: "user", strictPopulate: false, model: User
    }).sort({ "dateOrdered": -1 })
        .populate({
            path: "orderItems", strictPopulate: false, model: OrderItem,
            populate: {
                path: "product", strictPopulate: false, model: Product,
                populate: { path: "category", strictPopulate: false, model: Category }
            }
        });
    if (!orderList) res.status(404).json({ status: "not found" });
    res.send(orderList);
});

//getOrderById
router.post("/getById", async (req, res) => {
    const OrderReq = await Order.findById({
        _id: req.body.id
    }).populate({ path: "user", strictPopulate: false, model: User }).sort({ "dateOrdered": -1 });;
    if (OrderReq) {
        res.status(200).send(OrderReq);
    } else {
        res.status(404).json({ status: "failed" });
    }
});


//addOrder
router.post("/", async (req, res) => {
    const orderItemsIds = Promise.all(req.body.orderItems.map(async orderItem => {
        let newOrderItem = new OrderItem({
            quantity: orderItem.quantity,
            product: orderItem.product,
        })

        newOrderItem = await newOrderItem.save();

        return newOrderItem._id;
    }))

    const orderItemsIdsResolved = await orderItemsIds;

    const totalPrices = await Promise.all(orderItemsIdsResolved.map(async (orderItemId) => {
        const orderItem = await OrderItem.findById(orderItemId).populate({ path: "product", strictPopulate: false, model: Product })
        const totalPrice = orderItem.product.price * orderItem.quantity;
        return totalPrice
    }))

    const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

    let order = new Order({
        orderItems: orderItemsIdsResolved,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        totalPrice: req.body.totalPrice,
        status: req.body.status,
        user: req.body.user,
    });
    orderReq = await order.save().then(() => {
        res.status(200).json({ status: "done" });
    });
    if (!order) {
        res.status(404).json({ status: "failed" });
    }
});

//updateOrder
router.put('/', async (req, res) => {
    const order = await Order.findOneAndUpdate({
        _id: req.body.id,
        status: req.body.status,
    });
    if (!order) {
        res.status(404).json({ status: "failed" });
    } else {
        res.status(200).json({ status: "done" });
    }
});

//deleteOrder
router.delete("/", (req, res) => {
    Order.findByIdAndRemove(req.params.id).then(async order => {
        if (order) {
            await order.orderItems.map(async orderItem => {
                await OrderItem.findByIdAndRemove(orderItem)
            })
            return res.status(200).json({ success: true, message: 'the order is deleted!' })
        } else {
            return res.status(404).json({ success: false, message: "order not found!" })
        }
    }).catch(err => {
        return res.status(500).json({ success: false, error: err })
    })
});

//userOrders
router.get(`/get/userorders/:userid`, async (req, res) => {
    const userOrderList = await Order.find({ user: req.params.userid }).populate({
        path: 'orderItems', model: OrderItem, populate: {
            path: 'product', model: Product, populate: {
                path: 'category', model: Category
            }
        }
    }).sort({ 'dateOrdered': -1 });

    if (!userOrderList) {
        res.status(500).json({ success: false })
    }
    res.send(userOrderList);
})

module.exports = router;