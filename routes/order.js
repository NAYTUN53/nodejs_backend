const express = require('express');
const Order = require('../models/order');
const orderRouter = express.Router();
const {auth, vendorAuth} = require('../middleware/auth');

orderRouter.post("/api/orders", auth, async (req, res) => {
    try {
        const { fullName, email, state, city, locality, productName, productPrice, quantity, category, image, buyerId, vendorId } = req.body;

        const createdAt = new Date().getMilliseconds();
        const order = new Order({ fullName, email, state, city, locality, productName, productPrice, quantity, category, image, buyerId, vendorId, createdAt });
        await order.save();
        return res.status(201).json(order);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Get route for fetching orders by buyerId
orderRouter.get('/api/orders/:buyerId', auth, async (req, res) => {
    try {
        const { buyerId } = req.params;
        const orders = await Order.find({ buyerId });

        if (orders.length == 0) {
            return res.status(404).json({ msg: "No orders found for this buyer." })
        }
        return res.status(200).json(orders);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Delete route for deleting a specific order by id
orderRouter.delete("/api/orders/:id", auth, async (req, res) => {
    try {
        const { id } = req.params;
        const deletedOrder = await Order.findByIdAndDelete(id);
        if (!deletedOrder) {
            res.status(404).json({ msg: "Order Id not found" });
        }
        else {
            res.status(200).json({ msg: "Order was successfully deleted" });
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});


// Get route for fetching orders by vendorId
orderRouter.get('/api/orders/vendors/:vendorId', auth, vendorAuth, async (req, res) => {
    try {
        const {vendorId} = req.params;
        const orders = await Order.find({vendorId});

        if (orders.length == 0) {
            return res.status(404).json({ msg: "No orders found for this vendor." })
        }
        return res.status(200).json(orders);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});


// Mark the order as delivered
orderRouter.patch('/api/orders/:id/delivered', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            { delivered: true , processing: false},
            { new: true });
        if (!updatedOrder) {
            return res.status(404).json({ msg: "Orders not found" });
        }
        else {
            return res.status(200).json(updatedOrder);
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Cancel the order
orderRouter.patch('/api/orders/:id/processing', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            { processing: false , delivered: false},
            { new: true });
        if (!updatedOrder) {
            return res.status(404).json({ msg: "Orders not found" });
        }
        else {
            return res.status(200).json(updatedOrder);
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

orderRouter.get('/api/orders', async(req, res) => {
    try {
        const orders = await Order.find();
        if(!orders){
            return res.status(404).json({msg: "Orders not found"});
        }
        else{
            return res.status(200).json(orders);
        }
    } catch (e) {
        return res.status(500).json({error: e.message});
    }
});

module.exports = orderRouter;