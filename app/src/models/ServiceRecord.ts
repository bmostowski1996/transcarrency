// models/ServiceRecord.ts
import { Schema, model, Document } from 'mongoose';

export interface IServiceRecord extends Document {
  date?: string;
  type: string;
  cost?: number;
  mileage?: number;
  notes?: string;
  shop?: string;
  invoiceUrl?: string;
}

const serviceRecordSchema = new Schema<IServiceRecord>(
  {
    date: {
      type: String,
    },
    type: {
      type: String,
      required: true,
    },
    cost: {
      type: Number,
    },
    mileage: {
      type: Number,
    },
    notes: {
      type: String,
    },
    shop: {
      type: String,
    },
    invoiceUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const ServiceRecord = model<IServiceRecord>('ServiceRecord', serviceRecordSchema);
export default ServiceRecord;

