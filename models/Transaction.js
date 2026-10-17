const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema(
    {
        id: {
            type: Number,
            required: true,
            unique: true,
            default: () => Date.now()
        },
        description: {
            type: String,
            required: [true, "Description is required."],
            trim: true
        },
        amount: {
            type: Number,
            required: [true, "Amount is required."],
            min: [0.01, "Amount must be greater than zero."]
        },
        type: {
            type: String,
            required: [true, "Transaction type is required."],
            enum: {
                values: ["income", "expense"],
                message: "Transaction type must be income or expense."
            }
        },
        category: {
            type: String,
            required: [true, "Category is required."],
            trim: true
        },
        date: {
            type: String,
            required: [true, "Valid date is required."],
            match: [/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format."]
        }
    },
    {
        timestamps: true,
        toJSON: {
            transform: function (doc, ret) {
                // Ensure id field is preserved and clean MongoDB internal fields
                delete ret.__v;
                return ret;
            }
        }
    }
);

// Index on id and date for fast lookups and sorting
TransactionSchema.index({ id: 1 });
TransactionSchema.index({ date: -1 });

module.exports = mongoose.model("Transaction", TransactionSchema);
