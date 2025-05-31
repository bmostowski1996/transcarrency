// connection file for MongoDB
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
// Emulate __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// __dirname is the directory of the current file (after compilation)
dotenv.config({
    path: path.resolve(__dirname, '../../.env'), // 2 levels up from dist/config/connection.js
});
console.log('MONGODB_URI:', `"${process.env.MONGODB_URI}"`);
import mongoose from 'mongoose';
const MONGODB_URI = process.env.MONGODB_URI || '';
const db = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Database connected.');
        return mongoose.connection;
    }
    catch (error) {
        console.error('Database connection error:', error);
        throw new Error('Database connection failed.');
    }
};
export default db;
