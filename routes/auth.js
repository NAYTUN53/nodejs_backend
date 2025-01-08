const express = require('express');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authRouter = express.Router();

// Sign up api endpoint
authRouter.post('/api/signup', async(req, res) => {
    try {
        const {fullName, email, password} = req.body;
        const existingEmail = await User.findOne({email});

        if(existingEmail){
            return res.status(400).json({msg: "Email already exist."});
        }
        else{
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            let user = new User({fullName, email, password : hashedPassword});
            user = await user.save();
            res.json({user});
        }
    } catch (e) {
        res.status(500).json({error:e.message});     
    }
});

// Sign in api endpoint

authRouter.post('/api/signin', async(req, res) =>{
    try {
        const {email, password} = req.body;
        const foundUser = await User.findOne({email});
        if(!foundUser){
            return res.status(400).json({msg: "User not found."});
        }
        else{
            const isMatch = await bcrypt.compare(password, foundUser.password);
            if(!isMatch){
                return res.status(400).json({msg: "Incorrect password."});
            }
            else{
                const token = jwt.sign({id: foundUser._id}, "passwordKey");

                // remove sensitive information
                const {password, ...userWithoutPassword} = foundUser._doc; 

                //send the responses
                res.json({token, user: userWithoutPassword});
            }
        }
    } catch (e) {
        res.status(500).json({error:e.message});  
    }
});

module.exports = authRouter;