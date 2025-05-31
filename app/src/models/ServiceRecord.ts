// models/ServiceRecord.ts
import { Schema, model, Document, Types} from 'mongoose';

export interface IServiceRecord extends Document {
  date?: string;
  type: string;
  cost?: number;
  mileage?: number;
  notes?: string;
  shop?: string;
  invoiceUrl?: string;
  vehicle: Types.ObjectId;
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
    vehicle: {
      type: Schema.Types.ObjectId,
      ref: 'Vehicle'
    }
  },
  {
    timestamps: true,
  }
);

const ServiceRecord = model<IServiceRecord>('ServiceRecord', serviceRecordSchema);
export default ServiceRecord;

