import db from '../config/connection.js';
<<<<<<< HEAD
import { User } from '../models/index.js';
import { Vehicle } from '../models/index.js';
<<<<<<< HEAD
import { ServiceRecord } from '../models/ServiceRecord.js';
import userSeeds from './userData.json' with { type: 'json' };
import vehicleSeeds from './vehiclesData.json' with { type: 'json' };
import serviceRecordSeeds from './vehiclesData.json' with { type: 'json' };
=======
// import { ServiceRecord } from '../models/index.js';
import userSeeds from './userData.json' with { type: 'json' };
import vehicleSeeds from './vehiclesData.json' with { type: 'json' };
// import serviceRecordSeeds from './vehiclesData.json' with { type: 'json' };
>>>>>>> 1de7c13ffd7a164316ba7857ea756d5cbede448b
=======
import { User, Vehicle, ServiceRecord } from '../models/index.js';
import userSeeds from './userData.json' with { type: 'json' };
import vehicleSeeds from './vehiclesData.json' with { type: 'json' };
import serviceRecordSeeds from './ServiceRecordData.json' with { type: 'json' };
>>>>>>> 86dc3cec905128a3801a52b1d30c3aef5ee03c9e
import cleanDB from './cleanDB.js';
const seedDatabase = async () => {
    try {
        await db();
        await cleanDB();
        await User.insertMany(userSeeds);
        await Vehicle.insertMany(vehicleSeeds);
<<<<<<< HEAD
<<<<<<< HEAD
        await ServiceRecord.insertMany(serviceRecordSeeds);
=======
        // await ServiceRecord.insertMany(serviceRecordSeeds);
=======
        await ServiceRecord.insertMany(serviceRecordSeeds);
        // For now, we've seeded, but we still need to associate service records with vehicles, and vehicles with users!
        // First, let's associate service records with vehicles 
        const serviceRecords = await ServiceRecord.find();
        for (const serviceRecord of serviceRecords) {
            // Assign the service record to a random user 
            const count = await Vehicle.countDocuments();
            const random = Math.floor(Math.random() * count);
            // Again query all vehicles but only fetch one offset by our random #
            const vehicle = await Vehicle.findOne().skip(random).limit(-1);
            // Add the service record to the vehicle's list of service records
            vehicle?.serviceRecords?.push(serviceRecord._id);
            // Identify the vehicle that the service record was performed on
            serviceRecord.vehicle = vehicle?._id;
            await vehicle?.save();
            await serviceRecord?.save();
        }
>>>>>>> 86dc3cec905128a3801a52b1d30c3aef5ee03c9e
        // For now, we have seeded Users and Vehicles, but we haven't actually assigned Vehicles to users yet...
        const vehicles = await Vehicle.find();
        for (const vehicle of vehicles) {
            // Assign the vehicle to a random user
            const count = await User.countDocuments();
            const random = Math.floor(Math.random() * count);
            // Again query all users but only fetch one offset by our random #
            const user = await User.findOne().skip(random).limit(-1);
            // Add the vehicle to the user's list of owned vehicles
            user?.vehicles?.push(vehicle._id);
            // Identify the user as the vehicle's owner in the vehicle object
            vehicle.owner = user?._id;
            await vehicle.save();
            await user?.save();
        }
>>>>>>> 1de7c13ffd7a164316ba7857ea756d5cbede448b
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
