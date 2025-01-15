const express = require('express');
const Product = require('../models/product');
const { auth, vendorAuth } = require('../middleware/auth');

const productRouter = express.Router();
productRouter.post('/api/add-product', auth, vendorAuth, async (req, res) => {
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

// new route for retrieving related products by subcategory
productRouter.get("/api/related-products-by-subcategory/:productId", async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ msg: "Product not found" });
        }
        else {
            const relatedProducts = await Product.find({
                subCategory: product.subCategory,
                _id: { $ne: productId } // $ne(mongo db method) means not equal, searched product will not include in the return response
            });
            if (!relatedProducts || relatedProducts.length == 0) {
                return res.status(404).json({ msg: "Related products not found" });
            }

            return res.status(200).json(relatedProducts);
        }
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
});


// route for retrieving the top 10 highest related products
productRouter.get('/api/top-related-products', async (req, res) => {
    try {
        // fetch all products and sort them by average rating
        const topRatedProducts = await Product.find({}).sort({ averageRating: -1 }).limit(10); // averageRating - 1 indicates that the results is ordered by decending
        if(!topRatedProducts){
            return res.status(404).json({msg: "Top rated products not found"});

        }
        return res.status(200).json(topRatedProducts);
    } catch (e) {
        return res.status(500).json({error: e.message});
    }
});

// Get products by subcategory

productRouter.get('/api/prducts-by-subcategory/:subCategory', async(req, res) => {
    try {
        const {subCategory} = req.params;
        const products = await Product.find({subCategory: subCategory});
        if (!products || products.length == 0){
            return res.status(404).json({msg : "Products are not found in this subcategory"});
        }
        res.status(200).json(products);
    } catch (e) {
        res.status(500).json({error: e.message});
    }
});

// Route for searching products using productName or description
productRouter.get('/api/search-products', async (req, res) => {
    try {
        const {query} = req.query;
        if(!query){
            res.status(400).json({msg: "Query parameter required"});
        }
        const products = await Product.find({
            $or:[
                {productName: {$regex: query, $options: 'i' }},
                {description: {$regex: query, $options: 'i'}},
            ]
        });

        if(!products || products.length == 0){
            return res.status(404).json({msg : "Products you are searching are not found"});
        }
        return res.status(200).json(products);
    } catch (e) {
        res.status(500).json({error: e.message});
    }
});

// Route to edit the existing products
productRouter.put('/api/edit-product/:productId',auth, vendorAuth, async(req, res) => {
    try {
        const {productId} = req.params;
        const product = await Product.findById(productId);

        // Check if the the product exist and if the vendor is authorized to edit it
        if(!product){
            return res.status(404).json({msg: "Editing product not found"});
        }
        if(product.vendorId.toString() !== req.user.id){
            return res.status(403).json({msg: "Unauthorized access to edit"});
        }

        // Destructure the req.body to exclude vendorId
        const {vendorId, ...updateData} = req.body;

        // update the product with the fields provided in updateData
        const updatedProduct = await Product.findByIdAndUpdate(
            productId, 
            {$set : updateData}, // update only fields in the updateData
            {new: true} // return the updated product document in the response
        );

        return res.status(200).json(updatedProduct);
    } catch (e) {
        return res.status(500).json({error: e.message});
    }
});

module.exports = productRouter;