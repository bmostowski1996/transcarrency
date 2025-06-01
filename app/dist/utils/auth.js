import jwt from 'jsonwebtoken';
import { GraphQLError } from 'graphql';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
// Emulate __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// __dirname is the directory of the current file (after compilation)
dotenv.config({
    path: path.resolve(__dirname, '../../.env'), // 2 levels up from dist/utils/auth.js
});
export const authenticateToken = ({ req }) => {
    // Allows token to be sent via req.body, req.query, or headers
    let token = req.body.token || req.query.token || req.headers.authorization;
    // console.log("GOT TO HERE");
    // console.log(token);
    // If the token is sent in the authorization header, extract the token from the header
    if (req.headers.authorization) {
        token = token.split(' ').pop().trim();
    }
    // If no token is provided, return the request object as is
    if (!token) {
        return req;
    }
    // Try to verify the token
    try {
        const { data } = jwt.verify(token, process.env.JWT_SECRET_KEY || '', { maxAge: '2hr' });
        // If the token is valid, attach the user data to the request object
        req.user = data;
    }
    catch (err) {
        // If the token is invalid, log an error message
        console.log(`SECRET KEY: ${process.env.JWT_SECRET_KEY}`);
        console.log('Invalid token');
    }
    // Return the request object
    return req;
};
export const signToken = (firstName, lastName, email, _id) => {
    // Create a payload with the user information
    const payload = { firstName, lastName, email, _id };
    const secretKey = process.env.JWT_SECRET_KEY; // Get the secret key from environment variables
    // Sign the token with the payload and secret key, and set it to expire in 2 hours
    return jwt.sign({ data: payload }, secretKey, { expiresIn: '2h' });
};
export class AuthenticationError extends GraphQLError {
    constructor(message) {
        super(message, undefined, undefined, undefined, ['UNAUTHENTICATED']);
        Object.defineProperty(this, 'name', { value: 'AuthenticationError' });
    }
}
;
