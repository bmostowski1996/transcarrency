import { User, Vehicle, ServiceRecord } from '../models/index.js';
import { getVehicleParts } from '../utils/nhtsaApi.js';
import { AuthenticationError } from '../utils/auth.js';
import bcrypt from 'bcrypt';
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
        },
        uploadInvoice: async (_, { recordId, invoiceUrl }) => await ServiceRecord.findByIdAndUpdate(recordId, { invoiceUrl }, { new: true }),
    },
};
export default resolvers;
