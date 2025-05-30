// file for user model
import { Schema, model, Document, Types } from 'mongoose';
import bycrypt from 'bcrypt';
// import { google } from 'googleapis';
// import { OAuth2Client } from 'google-auth-library';

// user interface
interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  googleAccessToken?: string;
  googleRefreshToken?: string;
  googleTokenExpiryDate?: Date | null;
  vehicles?: Types.ObjectId[]; // Added vehicles field
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
userSchema.pre<IUser>('save', async function (next) {
  if (this.isModified('password')) {
    const salt = await bycrypt.genSalt(10);
    this.password = await bycrypt.hash(this.password, salt);
  }
  next();
});

// compare password
userSchema.methods.comparePassword = async function (
  this: IUser,
  candidatePassword: string
): Promise<boolean> {
  return await bycrypt.compare(candidatePassword, this.password);
}
// create user model
const User = model<IUser>('User', userSchema);

export default User;
