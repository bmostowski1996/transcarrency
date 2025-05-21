const mongoose = require('mongoose');

const serviceRecordSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  type: {
    type: String,
    required: true,
    enum: ['Oil Change', 'Brake Replacement', 'Tire Rotation', 'Battery Replacement', 'Inspection', 'Other']
  },
  cost: { type: Number },
  mileage: { type: Number },
  notes: { type: String },
  shop: { type: String },
  recommendedPrice: { type: Number }
}, { timestamps: true });

const vehicleSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  vin: { type: String, unique: true },
  licensePlate: { type: String },
  mileage: { type: Number },
  serviceRecords: [serviceRecordSchema]
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
