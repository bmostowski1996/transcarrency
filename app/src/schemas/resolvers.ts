import { User, Vehicle, ServiceRecord } from '../models/index.js';
import { getVehicleParts } from '../utils/nhtsaApi.js';
import { AuthenticationError } from '../utils/auth.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const resolvers = {
  Query: {
    // Fetch all users
    users: async () => await User.find(),

    // Fetch a single user by ID
    user: async (_: any, { userId }: { userId: string }) => await User.findById(userId),

    // Fetch the currently logged-in user
    me: async (_: any, __: any, context: any) => {
      if (!context.user) throw new AuthenticationError('Not logged in');
      return await User.findById(context.user._id);
    },

    // Fetch a vehicle by ID
    getVehicleById: async (_: any, { id }: { id: string }) => await Vehicle.findById(id),

    // Fetch all vehicles owned by a specific user
    getVehiclesByUser: async (_: any, { ownerId }: { ownerId: string }) =>
      await Vehicle.find({ owner: ownerId }),

    // Fetch vehicle parts based on VIN or vehicle details
    vehicleParts: async (_: any, args: any) => {
      if (!args.vin && (!args.make || !args.model || !args.year)) {
        throw new Error('Provide a VIN or full vehicle info.');
      }
      return await getVehicleParts(args);
    },
  },

  Mutation: {
    // Register a new user
    registerUser: async (_: any, { input }: any) => {
      const { firstName, lastName, email, password } = input;

      // Check if the user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) throw new Error('User already exists');

      // Create a new user
      const newUser = await User.create({ firstName, lastName, email, password });

      // Generate a JWT token
      const token = jwt.sign({ _id: newUser._id }, process.env.JWT_SECRET_KEY!, {
        expiresIn: '1h',
      });

      return { token, user: newUser };
    },

    // Login an existing user
    login: async (_: any, { email, password }: { email: string; password: string }) => {
      const user = await User.findOne({ email });
      if (!user) throw new AuthenticationError('Invalid credentials');

      // Validate the password
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) throw new AuthenticationError('Invalid credentials');

      // Generate a JWT token
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET_KEY!, {
        expiresIn: '1h',
      });

      return { token, user };
    },

    // Update a user's information
    updateUser: async (_: any, { userId, input }: any) =>
      await User.findByIdAndUpdate(userId, input, { new: true }),

    // Delete a user by ID
    deleteUser: async (_: any, { userId }: { userId: string }) =>
      await User.findByIdAndDelete(userId),

    // Register a new vehicle
    registerVehicle: async (_: any, { ownerId, input }: any) => {
      const newVehicle = await Vehicle.create({ ...input, owner: ownerId });
      return newVehicle;
    },

    // Transfer ownership of a vehicle
    transferOwnership: async (
      _: any,
      { vehicleId, newOwnerId }: { vehicleId: string; newOwnerId: string }
    ) => await Vehicle.findByIdAndUpdate(vehicleId, { owner: newOwnerId }, { new: true }),

    // Add a new service record to a vehicle
    addServiceRecord: async (_: any, { vehicleId, record }: any) => {
      const newRecord = await ServiceRecord.create({ ...record, vehicle: vehicleId });
      await Vehicle.findByIdAndUpdate(vehicleId, { $push: { serviceHistory: newRecord._id } });
      return await Vehicle.findById(vehicleId).populate('serviceHistory');
    },

    // Remove a service record from a vehicle
    removeServiceRecord: async (_: any, { vehicleId, recordId }: any) => {
      await ServiceRecord.findByIdAndDelete(recordId);
      await Vehicle.findByIdAndUpdate(vehicleId, { $pull: { serviceHistory: recordId } });
      return await Vehicle.findById(vehicleId).populate('serviceHistory');
    },

    // Upload an invoice to a specific service record
    uploadInvoice: async (_: any, { recordId, invoiceUrl }: any) =>
      await ServiceRecord.findByIdAndUpdate(recordId, { invoiceUrl }, { new: true }),
  },
};

export default resolvers;