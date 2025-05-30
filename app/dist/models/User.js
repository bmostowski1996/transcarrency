// file for user model
<<<<<<< HEAD
import { Schema } from 'mongoose';
=======
import { Schema, model } from 'mongoose';
import bycrypt from 'bcrypt';
>>>>>>> 1de7c13ffd7a164316ba7857ea756d5cbede448b
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
<<<<<<< HEAD
userSchema.pre < IUser;
=======
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        const salt = await bycrypt.genSalt(10);
        this.password = await bycrypt.hash(this.password, salt);
    }
    next();
});
// compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bycrypt.compare(candidatePassword, this.password);
};
// create user model
const User = model('User', userSchema);
export default User;
>>>>>>> 1de7c13ffd7a164316ba7857ea756d5cbede448b
