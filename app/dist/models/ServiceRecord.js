// models/ServiceRecord.ts
import { Schema, model } from 'mongoose';
const serviceRecordSchema = new Schema({
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
}, {
    timestamps: true,
});
export const ServiceRecord = model('ServiceRecord', serviceRecordSchema);
