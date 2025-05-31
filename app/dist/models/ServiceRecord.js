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
    vehicle: {
        type: Schema.Types.ObjectId,
        ref: 'Vehicle'
    }
}, {
    timestamps: true,
});
const ServiceRecord = model('ServiceRecord', serviceRecordSchema);
export default ServiceRecord;
