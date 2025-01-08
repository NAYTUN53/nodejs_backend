const express = require("express");
const mongoose = require('mongoose');
const authRouter = require('./routes/auth');
const bannerRouter = require('./routes/banner');
const categoryRouter = require('./routes/category');
const subCategoryRouter = require('./routes/sub_category');
const productRouter = require('./routes/product');
const productReviewRouter = require('./routes/product_review');
const vendorRouter = require('./routes/vendor');
const cors = require('cors');

const PORT = 3000;
const app = express();
const DB = "mongodb+srv://naytunaungmm:aNEB6I5Nb2Kobz7a@cluster0.0gft2.mongodb.net/";

// Middleware to parse JSON
app.use(express.json());
app.use(cors()); // enable cors for all routes and origin
app.use(authRouter);
app.use(bannerRouter);
app.use(categoryRouter);
app.use(subCategoryRouter);
app.use(productRouter);
app.use(productReviewRouter);
app.use(vendorRouter);


// Middleware to parse URL-encoded form data
// app.use(express.urlencoded({ extended: true }));

mongoose.connect(DB).then(()=>{
    console.log("Mongoose connected.");
})

app.listen(PORT, '0.0.0.0', function(){
    console.log(`The sever is running on port ${PORT}`)
});