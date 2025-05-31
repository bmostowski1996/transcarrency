// seeds/cleanDB.ts
// import mongoose from 'mongoose';
import { User, Vehicle, ServiceRecord } from '../models/index.js';
import process from 'process';

const cleanDB = async (): Promise<void> => {
  try {
    await User.deleteMany({});
    console.log('User collection cleaned.');

    await Vehicle.deleteMany({});
    console.log('Vehicle collection cleaned.');

    await ServiceRecord.deleteMany({});
    console.log('ServiceRecord collection cleaned.');

    console.log('✅ All relevant collections cleaned.');
  } catch (err: unknown) {
    console.error('❌ Error cleaning collections:', err);
    process.exit(1);
  }
};

export default cleanDB;
