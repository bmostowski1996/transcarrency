import { Profile } from '../models/index.js';
import { signToken, AuthenticationError } from '../utils/auth.js';
const resolvers = {
    Query: {
        profiles: async () => {
            // Retrieve all profiles
            return await Profile.find();
        },
        profile: async (_parent, { profileId }) => {
            // Retrieve a profile by its ID
            return await Profile.findOne({ _id: profileId });
        },
        // By adding context to our query, we can retrieve the logged in user without specifically searching for them
        me: async (_parent, _args, context) => {
            if (context.user) {
                // If user is authenticated, return their profile
                return await Profile.findOne({ _id: context.user._id });
            }
            // If not authenticated, throw an authentication error
            throw new AuthenticationError('Not Authenticated');
        },
    },
    Mutation: {
        addProfile: async (_parent, { input }) => {
            // Create a new profile with provided name, email, and password
            const profile = await Profile.create({ ...input });
            // Sign a JWT token for the new profile
            const token = signToken(profile.name, profile.email, profile._id);
            return { token, profile };
        },
        login: async (_parent, { email, password }) => {
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
        addSkill: async (_parent, { profileId, skill }, context) => {
            // If context has a `user` property, that means the user executing this mutation has a valid JWT and is logged in
            if (context.user) {
                // Add a skill to a profile identified by profileId
                return await Profile.findOneAndUpdate({ _id: profileId }, {
                    $addToSet: { skills: skill },
                }, {
                    new: true,
                    runValidators: true,
                });
            }
            // If user attempts to execute this mutation and isn't logged in, throw an error
            throw new AuthenticationError('Could not find user');
        },
        // Set up mutation so a logged in user can only remove their profile and no one else's
        removeProfile: async (_parent, _args, context) => {
            if (context.user) {
                // If context has a `user` property, delete the profile of the logged-in user
                return await Profile.findOneAndDelete({ _id: context.user._id });
            }
            // If user attempts to execute this mutation and isn't logged in, throw an error
            throw new AuthenticationError('Could not find user');
        },
        // Make it so a logged in user can only remove a skill from their own profile
        removeSkill: async (_parent, { skill }, context) => {
            if (context.user) {
                // If context has a `user` property, remove a skill from the profile of the logged-in user
                return await Profile.findOneAndUpdate({ _id: context.user._id }, { $pull: { skills: skill } }, { new: true });
            }
            // If user attempts to execute this mutation and isn't logged in, throw an error
            throw new AuthenticationError('Could not find user');
        },
    },
};
export default resolvers;
