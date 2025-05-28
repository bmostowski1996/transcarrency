import db from '../config/connection.js';
import { User } from '../models/index.js';
import userSeeds from './userData.json' with { type: "json" };
import cleanDB from './cleanDB.js';
const seedDatabase = async () => {
    try {
        await db();
        await cleanDB();
        await User.insertMany(userSeeds);
        console.log('Seeding completed successfully!');
        process.exit(0);
    }
    catch (error) {
        if (error instanceof Error) {
            console.error('Error seeding database:', error.message);
        }
        else {
            console.error('Unknown error seeding database');
        }
        process.exit(1);
    }
};
seedDatabase();
