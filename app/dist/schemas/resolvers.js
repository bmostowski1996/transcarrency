<<<<<<< HEAD
import { User } from '../models/User.js';
import { Vehicle } from '../models/Vehicle.js';
import { ServiceRecord } from '../models/ServiceRecord.js';
import { getVehicleParts } from '../utils/nhtsaApi.js';
import { AuthenticationError } from '../utils/auth.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
const resolvers = {
    Query: {
        users: async () => await User.find(),
        user: async (_, { userId }) => await User.findById(userId),
        me: async (_, __, context) => {
            if (!context.user)
                throw new AuthenticationError('Not logged in');
            return await User.findById(context.user._id);
        },
        getVehicleById: async (_, { id }) => await Vehicle.findById(id),
        getVehiclesByUser: async (_, { ownerId }) => await Vehicle.find({ owner: ownerId }),
        vehicleParts: async (_, args) => {
            if (!args.vin && (!args.make || !args.model || !args.year)) {
                throw new Error('Provide a VIN or full vehicle info.');
            }
            return await getVehicleParts(args);
        },
    },
    Mutation: {
        registerUser: async (_, { input }) => {
            const { name, email, password } = input;
            const existingUser = await User.findOne({ email });
            if (existingUser)
                throw new Error('User already exists');
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = await User.create({ name, email, password: hashedPassword });
            const token = jwt.sign({ _id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            return { token, user: newUser };
        },
        login: async (_, { email, password }) => {
            const user = await User.findOne({ email });
            if (!user)
                throw new AuthenticationError('Invalid credentials');
            const valid = await bcrypt.compare(password, user.password);
            if (!valid)
                throw new AuthenticationError('Invalid credentials');
            const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            return { token, user };
        },
        updateUser: async (_, { userId, input }) => await User.findByIdAndUpdate(userId, input, { new: true }),
        deleteUser: async (_, { userId }) => await User.findByIdAndDelete(userId),
        registerVehicle: async (_, { ownerId, input }) => {
            const newVehicle = await Vehicle.create({ ...input, owner: ownerId });
            return newVehicle;
        },
        transferOwnership: async (_, { vehicleId, newOwnerId }) => await Vehicle.findByIdAndUpdate(vehicleId, { owner: newOwnerId }, { new: true }),
        addServiceRecord: async (_, { vehicleId, record }) => {
            const newRecord = await ServiceRecord.create({ ...record, vehicle: vehicleId });
            await Vehicle.findByIdAndUpdate(vehicleId, { $push: { serviceHistory: newRecord._id } });
            return await Vehicle.findById(vehicleId).populate('serviceHistory');
        },
        removeServiceRecord: async (_, { vehicleId, recordId }) => {
            await ServiceRecord.findByIdAndDelete(recordId);
            await Vehicle.findByIdAndUpdate(vehicleId, { $pull: { serviceHistory: recordId } });
            return await Vehicle.findById(vehicleId).populate('serviceHistory');
=======
// resolver.ts
import { User } from '../models/index.js';
// import { signToken } from '../utils/auth.js';
import { getVehicleParts } from '../utils/nhtsaApi.js'; // Import the new function
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthenticationError } from '../utils/auth.js';
const resolvers = {
    Query: {
        // Fetch all users
        users: async () => {
            return await User.find();
        },
        // Fetch a single user by ID
        user: async (_, { userId }) => {
            return await User.findById(userId);
        },
        // Fetch the currently logged-in user's data
        me: async (_, __, context) => {
            if (!context.user) {
                throw new AuthenticationError('You must be logged in'); // Use correct error class
            }
            return await User.findById(context.user._id);
        },
        // Fetch vehicle parts using NHTSA API utility
        vehicleParts: async (_parent, args) => {
            try {
                // Ensure at least one identifier is provided
                if (!args.vin && (!args.make || !args.model || !args.year)) {
                    throw new Error('You must provide a VIN, or a combination of make, model, and year.');
                }
                const parts = await getVehicleParts(args);
                return parts;
            }
            catch (error) {
                console.error('Error in vehicleParts resolver:', error);
                throw new Error('Failed to fetch vehicle parts.');
            }
        },
    },
    Mutation: {
        // Register a new user
        registerUser: async (_, { input }) => {
            const { name, email, password } = input;
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                throw new Error('User already exists');
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = await User.create({
                name,
                email,
                password: hashedPassword,
            });
            // ../utils/auth.ts has a `signToken` function. Why is that not being used here?
            const token = jwt.sign({ _id: newUser._id }, process.env.JWT_SECRET, {
                expiresIn: '1h',
            });
            return { token, user: newUser };
        },
        // Login an existing user
        login: async (_, { email, password }) => {
            const user = await User.findOne({ email });
            if (!user) {
                throw new AuthenticationError('Invalid credentials');
            }
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                throw new AuthenticationError('Invalid credentials');
            }
            const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
                expiresIn: '1h',
            });
            return { token, user };
        },
        // Update a user's information
        updateUser: async (_, { userId, input }) => {
            return await User.findByIdAndUpdate(userId, input, { new: true });
        },
        // Delete a user by ID
        deleteUser: async (_, { userId }) => {
            return await User.findByIdAndDelete(userId);
>>>>>>> 1de7c13ffd7a164316ba7857ea756d5cbede448b
        },
        uploadInvoice: async (_, { recordId, invoiceUrl }) => await ServiceRecord.findByIdAndUpdate(recordId, { invoiceUrl }, { new: true }),
    },
};
export default resolvers;
