import { Schema, model } from 'mongoose';
const vehicleSchema = new Schema({
    vin: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    make: {
        type: String,
        required: true,
        trim: true,
    },
    model: {
        type: String,
        required: true,
        trim: true,
    },
    year: {
        type: Number,
        required: true,
    },
    mileage: {
        type: Number,
        default: 0,
    },
    color: {
        type: String,
        trim: true,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
}, {
    timestamps: true,
});
<<<<<<< HEAD
export const Vehicle = model('Vehicle', vehicleSchema);
=======
const Vehicle = model('Vehicle', vehicleSchema);
export default Vehicle;
>>>>>>> 1de7c13ffd7a164316ba7857ea756d5cbede448b
