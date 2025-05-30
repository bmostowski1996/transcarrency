import db from '../config/connection.js';
import { User, Vehicle, ServiceRecord } from '../models/index.js';
import userSeeds from './userData.json' with { type: 'json' };
import vehicleSeeds from './vehiclesData.json' with { type: 'json' };
import serviceRecordSeeds from './ServiceRecordData.json' with { type: 'json' };
import cleanDB from './cleanDB.js';
import { Types } from 'mongoose';

const seedDatabase = async (): Promise<void> => {
  try {
    await db();
    await cleanDB();
    
    await User.insertMany(userSeeds);
    await Vehicle.insertMany(vehicleSeeds);
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
      vehicle?.serviceRecords?.push(serviceRecord._id as Types.ObjectId);

      // Identify the vehicle that the service record was performed on
      serviceRecord.vehicle = vehicle?._id as Types.ObjectId;

      await vehicle?.save();
      await serviceRecord?.save();

    }
    
    // For now, we have seeded Users and Vehicles, but we haven't actually assigned Vehicles to users yet...
    const vehicles = await Vehicle.find();
    for (const vehicle of vehicles) {
      // Assign the vehicle to a random user
      const count = await User.countDocuments();
      const random = Math.floor(Math.random() * count);
      // Again query all users but only fetch one offset by our random #
      const user = await User.findOne().skip(random).limit(-1);

      // Add the vehicle to the user's list of owned vehicles
      user?.vehicles?.push(vehicle._id as Types.ObjectId);

      // Identify the user as the vehicle's owner in the vehicle object
      vehicle.owner = user?._id as Types.ObjectId;

      await vehicle.save();
      await user?.save();
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error seeding database:', error.message);
    } else {
      console.error('Unknown error seeding database');
    }
    process.exit(1);
  }
};

seedDatabase();

