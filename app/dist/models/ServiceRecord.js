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
<<<<<<< HEAD
export const ServiceRecord = model('ServiceRecord', serviceRecordSchema);
=======
const ServiceRecord = model('ServiceRecord', serviceRecordSchema);
export default ServiceRecord;
>>>>>>> 1de7c13ffd7a164316ba7857ea756d5cbede448b
