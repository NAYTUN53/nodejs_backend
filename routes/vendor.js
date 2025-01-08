const express = require('express');
const Vendor = require('../models/vendor')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const vendorRouter = express.Router();

// Sign up api endpoint
vendorRouter.post('/api/vendor/signup', async (req, res) => {
    try {
        const { fullName, email, password } = req.body;
        const existingEmail = await Vendor.findOne({ email });

        if (existingEmail) {
            return res.status(400).json({ msg: "Email already exist." });
        }
        else {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            let vendor = new Vendor({ fullName, email, password: hashedPassword });
            vendor = await vendor.save();
            res.json({ vendor });
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});


// Sign in api endpoint

vendorRouter.post('/api/vendor/signin', async(req, res) =>{
    try {
        const {email, password} = req.body;
        const foundVendor = await Vendor.findOne({email});
        if(!foundVendor){
            return res.status(400).json({msg: "Vendor not found."});
        }
        else{
            const isMatch = await bcrypt.compare(password, foundVendor.password);
            if(!isMatch){
                return res.status(400).json({msg: "Incorrect password."});
            }
            else{
                const token = jwt.sign({id: foundVendor._id}, "passwordKey");

                // remove sensitive information
                const {password, ...vendorWithoutPassword} = foundVendor._doc; 

                //send the responses
                res.json({token, vendor: vendorWithoutPassword});
            }
        }
    } catch (e) {
        res.status(500).json({error:e.message});  
    }
});

module.exports = vendorRouter;