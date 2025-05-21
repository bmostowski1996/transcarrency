// file for user model
import { Schema, model } from 'mongoose';
import bycrypt from 'bcrypt';



// user interface
interface User {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// user schema
const userSchema = new Schema<User>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
  },
  { timestamps: true }
);

// hash password before saving
userSchema.pre<User>('save', async function (next) {
  if (this.isModified('password')) {
    const salt = await bycrypt.genSalt(10);
    this.password = await bycrypt.hash(this.password, salt);
  }
  next();
});
// compare password
userSchema.methods.comparePassword = async function (
  this: User,
  candidatePassword: string
): Promise<boolean> {
  return await bycrypt.compare(candidatePassword, this.password);
}
// create user model
const User = model<User>('User', userSchema);

export default User;