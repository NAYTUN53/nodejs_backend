const express = require('express');
const Product = require('../models/product');

const productRouter = express.Router();
productRouter.post('/api/add-product', async (req, res) => {
    try {
        const { productName, productPrice, quantity, description, category, vendorId, fullName, subCategory, images } = req.body;
        const product = await new Product({ productName, productPrice, quantity, description, category, vendorId, fullName, subCategory, images });
        await product.save();
        return res.status(201).send(product);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

productRouter.get('/api/popular-products', async (req, res) => {
    try {
        const product = await Product.find({ popular: true });
        if (!product || product.length == 0) {
            return res.status(404).json({ msg: "Products not found." });

        }
        else {
            res.status(200).json(product);
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

productRouter.get('/api/recommanded-products', async (req, res) => {
    try {
        const product = await Product.find({ recommand: true });
        if (!product || product.length == 0) {
            return res.status(400).json({ msg: "Products not found." });
        }
        else {
            res.status(200).json({ product });
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});


// create new route for retriving the product by category
productRouter.get('/api/products-by-category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const products = await Product.find({ category, popular: true });
        if (!products | products.length == 0) {
            return res.status(404).json({ msg: "Products not found under this category" });
        }
        else {
            return res.status(200).json(products);
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = productRouter;