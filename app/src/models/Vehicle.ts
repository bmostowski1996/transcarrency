import { Schema, model } from 'mongoose';

const vehicleSchema = new Schema(
  {
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
    serviceRecords: [{
      type: Schema.Types.ObjectId,
      ref: 'ServiceRecord'
    }]
  },
  {
    timestamps: true,
  }
);

const Vehicle = model('Vehicle', vehicleSchema);

export default Vehicle;

