const jwt = require('jsonwebtoken');
require('dotenv').config();
const SECRET_KEY = process.env.JWT_SECRET_KEY;

exports.generateAuthJWT = (payload) => {
    const {expires_in, ...params} = payload;
    const token = jwt.sign(params, SECRET_KEY, { expiresIn : expires_in || "10d" });

    if(!token){
        return false;
    }

    return token;
}

exports.decodeToken = (req,res,next) => {
    try {
        let incomingToken = req.headers['authorization']

        if (!incomingToken) {
            return res.send({
                statusCode: 401,
                success: false,
                message: 'No authorization header provided',
                result: {}
            });
        }
    
        const token = incomingToken.split(' ')[1]; // Extract the token from the Bearer token
    
        if (!token) {
            return res.send({
                statusCode: 401,
                success: false,
                message: 'Token is Missing',
                result: {}
            });
        }

        const decoded = jwt.verify(token, SECRET_KEY); // Verify the token

        req.token = decoded; // Attach decoded user data to the request object
        next(); // Proceed to the next middleware or route handler

    } catch (error) {
        console.error(error);
        return res.send({
            statusCode : 500,
            success : false,
            message : error.message || "Internal Server Error",
            result : {}
        })
    }
}