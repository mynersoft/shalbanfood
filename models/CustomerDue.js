
import mongoose from 'mongoose';

const CustomerDueSchema = new mongoose.Schema(
    {
        // Registered User হলে internal ID থাকবে; manual customer হলে null
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },

        customerName: {
            type: String,
            required: true,
            trim: true,
        },

        // Manual customer-এর নাম দিয়ে duplicate record এড়াতে
        manualKey: {
            type: String,
            default: null,
        },

        totalDue: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
        },
    },
    { timestamps: true }
);

// Registered customer-এর জন্য প্রতি User-এ একটি due record
CustomerDueSchema.index(
    { customerId: 1 },
    {
        unique: true,
        partialFilterExpression: {
            customerId: { $type: 'objectId' },
        },
    }
);

// Manual customer-এর জন্য প্রতি normalized name-এ একটি record
CustomerDueSchema.index(
    { manualKey: 1 },
    {
        unique: true,
        partialFilterExpression: {
            manualKey: { $type: 'string' },
        },
    }
);

export default mongoose.models.CustomerDue ||
    mongoose.model('CustomerDue', CustomerDueSchema);
