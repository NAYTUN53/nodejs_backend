const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Vendor = require('../models/vendor');

// middleware authentication 
// middleware function checks if the user is authenticated
const auth = async(req, res, next) =>{
    try {
        // extract the token from the requet headers coming from the user login
        const token = req.header('x-auth-token');

        // if no token is provided, return 401 (unauthorized access) response with an error message
        if(!token) return res.status(401).json({msg: 'Unauthorized token, authorization denied'});

        // verify the jwt token using the secret key which is saved after the login in
        const verified = jwt.verify(token, "passwordKey");

        // if the token verification is failed, return 401
        if(!verified) return res.status(401).json({msg: "Token verification failed, authorization denied"});

        // find the normal user or vendor in the database using the id stored in the token
        const user = await User.findById(verified.id) || await Vendor.findById(verified.id);

        if(!user) return res.status(401).json({msg: "User not found, authorization denied"});

        // attach the authenticated user to the request objects
        // this make the user's data available to any subsequent middleware or route handlers
        req.user = user;

        // attach the token to the request object in case is needed later
        req.token = token;

        // proceed the next middleware or route handler
        next();


    } catch (e) {
        res.status(500).json({error: e.message});
    }
};

// vendor authentication using middleware
// this middleware ensures that the user making the request is a vendor
// it should be used for routes that only vendor can access.
const vendorAuth = (req, res, next) => {
    try {
        // check if the user making the request is a vendor (by checking 'role' property which is not included in user but vendor)
        if(!req.user.role || req.user.role != 'vendor'){
            // if the user is not a vendor, return 403(Forbidden) response with an error message
            return res.status(403).json({msg: "Access denied, only vendors are allowed"});
        }

        // if the user is a vendor, proceed to the next middleware or route handler
        next();
    } catch (e) {
        return res.status(500).json({error: e.message});
    }
};


module.exports = {auth, vendorAuth};