import { Profile } from '../models/index.js';
import process from 'process';
const cleanDB = async () => {
    try {
        await Profile.deleteMany({});
        console.log('Profile collection cleaned.');
    }
    catch (err) {
        console.error('Error cleaning collections:', err);
        process.exit(1);
    }
};
export default cleanDB;
