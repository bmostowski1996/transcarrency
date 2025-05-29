// file for user model
import { Schema } from 'mongoose';
// user schema
const userSchema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    googleAccessToken: {
        type: String,
        required: false,
    },
    googleRefreshToken: {
        type: String,
        required: false,
    },
    googleTokenExpiryDate: {
        type: Date,
        required: false,
        default: null,
    },
    vehicles: [{ type: Schema.Types.ObjectId, ref: 'Vehicle' }], // Added vehicles field
}, { timestamps: true });
// hash password before saving
userSchema.pre < IUser;
