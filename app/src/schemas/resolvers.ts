import { User, Vehicle, ServiceRecord } from '../models/index.js'
import { getVehicleParts } from '../utils/nhtsaApi.js';
import { AuthenticationError } from '../utils/auth.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const resolvers = {
  Query: {
    users: async () => await User.find(),
    user: async (_: any, { userId }: { userId: string }) => await User.findById(userId),
    me: async (_: any, __: any, context: any) => {
      if (!context.user) throw new AuthenticationError('Not logged in');
      return await User.findById(context.user._id);
    },
    getVehicleById: async (_: any, { id }: { id: string }) => await Vehicle.findById(id),
    getVehiclesByUser: async (_: any, { ownerId }: { ownerId: string }) =>
      await Vehicle.find({ owner: ownerId }),
    vehicleParts: async (_: any, args: any) => {
      if (!args.vin && (!args.make || !args.model || !args.year)) {
        throw new Error('Provide a VIN or full vehicle info.');
      }
      return await getVehicleParts(args);
    },
  },
  Mutation: {
    registerUser: async (_: any, { input }: any) => {
      const { name, email, password } = input;
      const existingUser = await User.findOne({ email });
      if (existingUser) throw new Error('User already exists');
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await User.create({ name, email, password: hashedPassword });
      const token = jwt.sign({ _id: newUser._id }, process.env.JWT_SECRET!, { expiresIn: '1h' });
      return { token, user: newUser };
    },
    login: async (_: any, { email, password }: { email: string; password: string }) => {
      const user = await User.findOne({ email });
      if (!user) throw new AuthenticationError('Invalid credentials');
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) throw new AuthenticationError('Invalid credentials');
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET!, { expiresIn: '1h' });
      return { token, user };
    },
    updateUser: async (_: any, { userId, input }: any) =>
      await User.findByIdAndUpdate(userId, input, { new: true }),
    deleteUser: async (_: any, { userId }: { userId: string }) =>
      await User.findByIdAndDelete(userId),
    registerVehicle: async (_: any, { ownerId, input }: any) => {
      const newVehicle = await Vehicle.create({ ...input, owner: ownerId });
      return newVehicle;
    },
    transferOwnership: async (
      _: any,
      { vehicleId, newOwnerId }: { vehicleId: string; newOwnerId: string }
    ) => await Vehicle.findByIdAndUpdate(vehicleId, { owner: newOwnerId }, { new: true }),
    addServiceRecord: async (_: any, { vehicleId, record }: any) => {
      const newRecord = await ServiceRecord.create({ ...record, vehicle: vehicleId });
      await Vehicle.findByIdAndUpdate(vehicleId, { $push: { serviceHistory: newRecord._id } });
      return await Vehicle.findById(vehicleId).populate('serviceHistory');
    },
    removeServiceRecord: async (_: any, { vehicleId, recordId }: any) => {
      await ServiceRecord.findByIdAndDelete(recordId);
      await Vehicle.findByIdAndUpdate(vehicleId, { $pull: { serviceHistory: recordId } });
      return await Vehicle.findById(vehicleId).populate('serviceHistory');
    },
    uploadInvoice: async (_: any, { recordId, invoiceUrl }: any) =>
      await ServiceRecord.findByIdAndUpdate(recordId, { invoiceUrl }, { new: true }),
  },
};
export default resolvers;












