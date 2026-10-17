const mongoose = require("mongoose");

const BudgetSchema = new mongoose.Schema(
    {
        key: {
            type: String,
            default: "current_budget",
            unique: true
        },
        monthlyBudget: {
            type: Number,
            required: true,
            min: [0, "Budget cannot be negative."],
            default: 0
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Budget", BudgetSchema);
