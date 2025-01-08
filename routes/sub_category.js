const express = require('express');
const SubCategory = require('../models/sub_category');
const subCategoryRouter = express.Router();


subCategoryRouter.post('/api/subcategories', async(req, res) =>{
    try {
        const {categoryId, categoryName, image, subCategoryName} = req.body;
        const subCategory = new SubCategory({categoryId, categoryName, image, subCategoryName});
        await subCategory.save();
        res.status(201).send(subCategory);
    } catch (e) {
        res.status(500).json({error: e.message});
    }
});

subCategoryRouter.get('/api/subcategories',async (req, res) => {
    try {
        const subcategories = await SubCategory.find();
        return res.status(200).json(subcategories);
    } catch (e) {
        res.status(500).json({error: e.message});
    }
});


subCategoryRouter.get('/api/category/:categoryName/subcategories', async(req, res) => {
   try {
    // Extract category name from the request Url using destructuring
    const {categoryName} = req.params;
    const subcategories = await SubCategory.find({categoryName: categoryName});

    // Check if any subcategories were found
    if(!subcategories || subcategories.length == 0){
        return res.status(404).json({msg: "Sub-Catetories not found"});
    }
    else{
        return res.status(200).json(subcategories);
    }
   } catch (e) {
     res.status(500).json({error: e.message});
   }
});

module.exports = subCategoryRouter;