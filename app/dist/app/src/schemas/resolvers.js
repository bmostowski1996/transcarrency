import { User, Vehicle, ServiceRecord } from '../models/index.js';
import { getVehicleParts } from '../utils/nhtsaApi.js';
import { AuthenticationError, signToken } from '../utils/auth.js';
import bcrypt from 'bcrypt';
// TODO: Right now, this file abuses the use of "any", which is not a best practice.
// We need to rectify this matter...
const resolvers = {
    Query: {
        // USER QUERIES
        // Fetch all users
        users: async () => await User.find(),
        // Fetch a single user by ID
        user: async (_, { userId }) => await User.findById(userId),
        // Fetch the currently logged-in user
        me: async (_parent, _args, context) => {
            console.log(context.user);
            if (!context.user)
                throw new AuthenticationError('Not logged in');
            return await User.findById(context.user._id);
        },
        // VEHICLE QUERIES
        // Fetch a vehicle by ID
        getVehicleById: async (_, { id }) => await Vehicle.findById(id),
        // Fetch all vehicles owned by an arbitrary user
        getVehiclesByUser: async (_, { ownerId }) => await Vehicle.find({ owner: ownerId }),
        // Fetch all vehicles owned by the logged in user
        getVehiclesOwned: async (_, __, context) => {
            if (!context.user)
                throw new AuthenticationError('Not logged in');
            return await Vehicle.find({ owner: context.user._id });
        },
        // Fetch vehicle parts based on VIN or vehicle details
        vehicleParts: async (_, args) => {
            if (!args.vin && (!args.make || !args.model || !args.year)) {
                throw new Error('Provide a VIN or full vehicle info.');
            }
            return await getVehicleParts(args);
        },
    },
    Mutation: {
        // USER MUTATIONS
        // Register a new user
        registerUser: async (_, { input }) => {
            const { firstName, lastName, email, password } = input;
            // Check if the user already exists
            const existingUser = await User.findOne({ email });
            if (existingUser)
                throw new Error('User already exists');
            // Create a new user
            const user = await User.create({ firstName, lastName, email, password });
            // Generate a JWT token
            const token = signToken(user.firstName, user.lastName, user.email, user._id);
            return { token, user };
        },
        // Login an existing user
        login: async (_, { email, password }) => {
            const user = await User.findOne({ email });
            if (!user)
                throw new AuthenticationError('Invalid credentials');
            // Validate the password
            const valid = await bcrypt.compare(password, user.password);
            if (!valid)
                throw new AuthenticationError('Invalid credentials');
            // Generate a JWT token
            const token = signToken(user.firstName, user.lastName, user.email, user._id);
            return { token, user };
        },
        // Update a user's information
        updateUser: async (_, { userId, input }) => await User.findByIdAndUpdate(userId, input, { new: true }),
        // Delete a user by ID
        deleteUser: async (_, { userId }) => {
            // First, identify the vehicles belonging to the user and delete those vehicles...
            const user = await User.findById(userId);
            if (user && user.vehicles) {
                for (const vehicle_id of user.vehicles) {
                    // Update each vehicle the user had in the database so that it does not have an owner
                    const vehicle = await Vehicle.findById(vehicle_id);
                    if (vehicle) {
                        vehicle.owner = null;
                    }
                }
            }
            return await User.findByIdAndDelete(userId);
        },
        // VEHICLE MUTATIONS
        // Register a new vehicle under the logged in user
        registerVehicle: async (_, { input }, context) => {
            if (!context.user)
                throw new AuthenticationError('Not logged in');
            const newVehicle = await Vehicle.create({ ...input, owner: context.user._id });
            return newVehicle;
        },
        // For adding vehicles to arbitrary users
        addVehicle: async (_, { ownerId, input }) => {
            const newVehicle = await Vehicle.create({ ...input, owner: ownerId });
            return newVehicle;
        },
        // Edit details of a vehicle
        updateVehicle: async (_, { vehicleId, input }) => await Vehicle.findByIdAndUpdate(vehicleId, input, { new: true }),
        // Delete vehicle
        deleteVehicle: async (_, { vehicleId }) => {
            const vehicle = await Vehicle.findById(vehicleId);
            if (vehicle) {
                // If the vehicle has an owner, identify that owner and remove the vehicle from his ownership
                if (vehicle.owner) {
                    await User.findByIdAndUpdate(vehicle.owner, { $pull: { vehicles: vehicleId } }, { new: true } // optional: returns the updated document
                    );
                }
            }
            ;
            // Now remove the vehicle
            return await Vehicle.findByIdAndDelete(vehicleId);
        },
        // Transfer ownership of a vehicle
        transferOwnership: async (_, { vehicleId, newOwnerId }) => await Vehicle.findByIdAndUpdate(vehicleId, { owner: newOwnerId }, { new: true }),
        // Add a new service record to a vehicle
        addServiceRecord: async (_, { vehicleId, record }) => {
            const newRecord = await ServiceRecord.create({ ...record, vehicle: vehicleId });
            await Vehicle.findByIdAndUpdate(vehicleId, { $push: { serviceHistory: newRecord._id } });
            return await Vehicle.findById(vehicleId).populate('serviceHistory');
        },
        // Remove a service record from a vehicle
        removeServiceRecord: async (_, { vehicleId, recordId }) => {
            await ServiceRecord.findByIdAndDelete(recordId);
            await Vehicle.findByIdAndUpdate(vehicleId, { $pull: { serviceHistory: recordId } });
            return await Vehicle.findById(vehicleId).populate('serviceHistory');
        },
        // Upload an invoice to a specific service record
        uploadInvoice: async (_, { recordId, invoiceUrl }) => await ServiceRecord.findByIdAndUpdate(recordId, { invoiceUrl }, { new: true }),
    },
};
export default resolvers;
