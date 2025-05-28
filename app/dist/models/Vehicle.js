import { Schema, model } from 'mongoose';
// Service Record Schema
const serviceRecordSchema = new Schema({
    date: { type: Date, default: Date.now },
    type: {
        type: String,
        required: true,
        enum: ['Oil Change', 'Brake Replacement', 'Tire Rotation', 'Battery Replacement', 'Inspection', 'Other'],
    },
    cost: Number,
    mileage: Number,
    notes: String,
    shop: String,
    recommendedPrice: Number,
}, { _id: false });
// Vehicle Schema
const vehicleSchema = new Schema({
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    make: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    vin: { type: String, unique: true },
    licensePlate: String,
    mileage: Number,
    serviceRecords: [serviceRecordSchema],
}, { timestamps: true });
// Export Vehicle model
const Vehicle = model('Vehicle', vehicleSchema);
export default Vehicle;
