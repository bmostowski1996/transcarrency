// file for user model
import { Schema, model, Document } from 'mongoose';
import bycrypt from 'bcrypt';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

// user interface
interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  googleAccessToken?: string;
  googleRefreshToken?: string;
  googleTokenExpiryDate?: Date | null;
  vehicles?: Schema.Types.ObjectId[]; // Added vehicles field
}

// user schema
const userSchema = new Schema<IUser>(
  {
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
  },
  { timestamps: true }
);

// hash password before saving
userSchema.pre<IUser
