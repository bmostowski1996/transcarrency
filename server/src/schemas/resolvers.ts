import { Profile } from '../models/index.js';
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

interface VehiclePartsArgs {
  vin?: string;
  make?: string;
  model?: string;
  year?: number;
  type?: string;
}

const resolvers = {
  Query: {
    profiles: async (): Promise<Profile[]> => {
      // Retrieve all profiles
      return await Profile.find();
    },

    profile: async (_parent: unknown, { profileId }: ProfileArgs): Promise<Profile | null> => {
      // Retrieve a profile by its ID
      return await Profile.findOne({ _id: profileId });
    },

    // By adding context to our query, we can retrieve the logged in user without specifically searching for them
    me: async (_parent: unknown, _args: unknown, context: Context): Promise<Profile | null> => {
      if (context.user) {
        // If user is authenticated, return their profile
        return await Profile.findOne({ _id: context.user._id });
      }
      // If not authenticated, throw an authentication error
      throw new AuthenticationError('Not Authenticated');
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
    addProfile: async (_parent: unknown, { input }: AddProfileArgs): Promise<{ token: string; profile: Profile }> => {
      // Create a new profile with provided name, email, and password
      const profile = await Profile.create({ ...input });
      // Sign a JWT token for the new profile
      const token = signToken(profile.name, profile.email, profile._id);

      return { token, profile };
    },

    login: async (_parent: unknown, { email, password }: { email: string; password: string }): Promise<{ token: string; profile: Profile }> => {
      // Find a profile by email
      const profile = await Profile.findOne({ email });

      if (!profile) {
        // If profile with provided email doesn't exist, throw an authentication error
        throw AuthenticationError;
      }

      // Check if the provided password is correct
      const correctPw = await profile.isCorrectPassword(password);

      if (!correctPw) {
        // If password is incorrect, throw an authentication error
        throw new AuthenticationError('Not Authenticated');
      }

      // Sign a JWT token for the authenticated profile
      const token = signToken(profile.name, profile.email, profile._id);
      return { token, profile };
    },

    // Add a third argument to the resolver to access data in our `context`
    addSkill: async (_parent: unknown, { profileId, skill }: AddSkillArgs, context: Context): Promise<Profile | null> => {
      // If context has a `user` property, that means the user executing this mutation has a valid JWT and is logged in
      if (context.user) {
        // Add a skill to a profile identified by profileId
        return await Profile.findOneAndUpdate(
          { _id: profileId },
          {
            $addToSet: { skills: skill },
          },
          {
            new: true,
            runValidators: true,
          }
        );
      }
      // If user attempts to execute this mutation and isn't logged in, throw an error
      throw new AuthenticationError('Could not find user');
    },

    // Set up mutation so a logged in user can only remove their profile and no one else's
    removeProfile: async (_parent: unknown, _args: unknown, context: Context): Promise<Profile | null> => {
      if (context.user) {
        // If context has a `user` property, delete the profile of the logged-in user
        return await Profile.findOneAndDelete({ _id: context.user._id });
      }
      // If user attempts to execute this mutation and isn't logged in, throw an error
      throw new AuthenticationError('Could not find user');
    },

    // Make it so a logged in user can only remove a skill from their own profile
    removeSkill: async (_parent: unknown, { skill }: RemoveSkillArgs, context: Context): Promise<Profile | null> => {
      if (context.user) {
        // If context has a `user` property, remove a skill from the profile of the logged-in user
        return await Profile.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { skills: skill } },
          { new: true }
        );
      }
      // If user attempts to execute this mutation and isn't logged in, throw an error
      throw new AuthenticationError('Could not find user');
    },
  },
};

export default resolvers;
