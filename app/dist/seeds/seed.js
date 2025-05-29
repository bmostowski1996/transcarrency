import db from '../config/connection.js';
import { User } from '../models/index.js';
import { Vehicle } from '../models/index.js';
// import { ServiceRecord } from '../models/index.js';
import userSeeds from './userData.json' with { type: 'json' };
import vehicleSeeds from './vehiclesData.json' with { type: 'json' };
// import serviceRecordSeeds from './vehiclesData.json' with { type: 'json' };
import cleanDB from './cleanDB.js';
const seedDatabase = async () => {
    try {
        await db();
        await cleanDB();
        await User.insertMany(userSeeds);
        await Vehicle.insertMany(vehicleSeeds);
        // await ServiceRecord.insertMany(serviceRecordSeeds);
        // For now, we have seeded Users and Vehicles, but we haven't actually assigned Vehicles to users yet...
        const vehicles = await Vehicle.find();
        for (const vehicle of vehicles) {
            // Assign the vehicle to a random user
            const count = await User.countDocuments();
            const random = Math.floor(Math.random() * count);
            // Again query all users but only fetch one offset by our random #
            const user = await User.findOne().skip(random).limit(-1);
            user?.vehicles?.push(vehicle._id);
        }
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
