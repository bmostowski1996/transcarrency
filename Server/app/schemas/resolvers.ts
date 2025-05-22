
{ Profile } from '../models/index.js';
import { signToken, AuthenticationError } from '../utils/auth.js';
import { getVehicleParts } from '../utils/nhtsaApi.js'; // Import the new function

interface Profile {
  _id: string;
  name: string;
  email: string;
  password: string;
  skills: string[];
}

interface ProfileArgs {
  profileId: string;
}

interface AddProfileArgs {
  input:{
    name: string;
    email: string;
    password: string;
  }
}

interface AddSkillArgs {
  profileId: string;
  skill: string;
}

interface RemoveSkillArgs {
  profileId: string;
  skill: string;
}

interface Context {
  user?: Profile; // Optional user profile in context
}

import { User } from '../models/User.js';
import { AuthenticationError } from 'apollo-server-errors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


interface VehiclePartsArgs {
  vin?: string;
  make?: string;
  model?: string;
  year?: number;
  type?: string;
}

const resolvers = {
  Query: {
    // Fetch all users
    users: async () => {
      return await User.find();
    },
    // Fetch a single user by ID
    user: async (_: any, { userId }: { userId: string }) => {
      return await User.findById(userId);
    },
    // Fetch the currently logged-in user's data
    me: async (_: any, __: any, context: any) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in');
      }
      return await User.findById(context.user._id);
    },

    vehicleParts: async (_parent: unknown, args: VehiclePartsArgs) => {
      try {
        // Ensure at least one identifier is provided
        if (!args.vin && (!args.make || !args.model || !args.year)) {
          throw new Error('You must provide a VIN, or a combination of make, model, and year.');
        }
        const parts = await getVehicleParts(args);
        return parts;
      } catch (error) {
        console.error('Error in vehicleParts resolver:', error);
        // Consider throwing a more specific GraphQL error
        throw new Error('Failed to fetch vehicle parts.');
      }
    },
  },
  Mutation: {
    // Register a new user
    registerUser: async (_: any, { input }: { input: UserInput }) => {
      const { name, email, password } = input;

      // Check if the user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error('User already exists');
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create a new user
      const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
      });

      // Generate a JWT token
      const token = jwt.sign({ _id: newUser._id }, process.env.JWT_SECRET!, {
        expiresIn: '1h',
      });

      return { token, user: newUser };
    },
    // Login an existing user
    login: async (_: any, { email, password }: { email: string; password: string }) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new AuthenticationError('Invalid credentials');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new AuthenticationError('Invalid credentials');
      }

      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET!, {
        expiresIn: '1h',
      });

      return { token, user };
    },
    // Update a user's information
    updateUser: async (_: any, { userId, input }: { userId: string; input: UserInput }) => {
      return await User.findByIdAndUpdate(userId, input, { new: true });
    },
    // Delete a user by ID
    deleteUser: async (_: any, { userId }: { userId: string }) => {
      return await User.findByIdAndDelete(userId);
    },
  },
};

export default resolvers;

// export default resolvers;