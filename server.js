require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const Transaction = require("./models/Transaction");
const Budget = require("./models/Budget");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI =
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/budgetflow";

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());
app.use(express.json());

// Serve static React build if it exists, or fallback to public folder
const clientDistPath = path.join(__dirname, "client", "dist");
const publicPath = path.join(__dirname, "public");

if (fs.existsSync(clientDistPath)) {
    app.use(express.static(clientDistPath));
} else if (fs.existsSync(publicPath)) {
    app.use(express.static(publicPath));
}

// ==========================================
// MONGODB CONNECTION & AUTOMATIC MIGRATION
// ==========================================

async function connectDB() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB successfully at:", MONGODB_URI);

        // Auto-migration from existing budget-data.json if MongoDB is empty
        await autoMigrateFromJson();
    } catch (error) {
        console.error("MongoDB connection error:", error.message);
        console.log("Please ensure MongoDB is running on your machine.");
    }
}

async function autoMigrateFromJson() {
    try {
        const count = await Transaction.countDocuments();
        if (count === 0) {
            const dataFile = path.join(__dirname, "data", "budget-data.json");
            if (fs.existsSync(dataFile)) {
                const raw = fs.readFileSync(dataFile, "utf8");
                const jsonData = JSON.parse(raw);

                if (Array.isArray(jsonData.transactions) && jsonData.transactions.length > 0) {
                    await Transaction.insertMany(jsonData.transactions);
                    console.log(
                        `[Migration] Successfully imported ${jsonData.transactions.length} transactions from budget-data.json into MongoDB.`
                    );
                }

                if (typeof jsonData.monthlyBudget === "number" && jsonData.monthlyBudget > 0) {
                    await Budget.findOneAndUpdate(
                        { key: "current_budget" },
                        { monthlyBudget: jsonData.monthlyBudget },
                        { upsert: true, returnDocument: "after" }
                    );
                    console.log(
                        `[Migration] Imported monthly budget (₹${jsonData.monthlyBudget}) into MongoDB.`
                    );
                }
            }
        }
    } catch (err) {
        console.warn("[Migration Notice] Could not auto-migrate from JSON:", err.message);
    }
}

connectDB();

// ==========================================
// TRANSACTION VALIDATION HELPER
// ==========================================

function validateTransaction(data) {
    if (typeof data.description !== "string" || data.description.trim() === "") {
        return "Description is required.";
    }

    if (
        typeof data.amount !== "number" ||
        !Number.isFinite(data.amount) ||
        data.amount <= 0
    ) {
        return "Amount must be greater than zero.";
    }

    if (data.type !== "income" && data.type !== "expense") {
        return "Transaction type must be income or expense.";
    }

    if (typeof data.category !== "string" || data.category.trim() === "") {
        return "Category is required.";
    }

    if (
        typeof data.date !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(data.date)
    ) {
        return "Valid date is required.";
    }

    return null;
}

// ==========================================
// GET TRANSACTIONS
// ==========================================

app.get("/api/transactions", async function (req, res) {
    try {
        const transactions = await Transaction.find().sort({ date: -1, createdAt: -1 });

        res.status(200).json({
            success: true,
            transactions: transactions.map(t => ({
                id: t.id,
                description: t.description,
                amount: t.amount,
                type: t.type,
                category: t.category,
                date: t.date
            }))
        });
    } catch (error) {
        console.error("Error retrieving transactions:", error);
        res.status(500).json({
            success: false,
            message: "Unable to retrieve transactions from database."
        });
    }
});

// ==========================================
// ADD TRANSACTION
// ==========================================

app.post("/api/transactions", async function (req, res) {
    try {
        const amount = Number(req.body.amount);

        const transactionData = {
            description: req.body.description,
            amount,
            type: req.body.type,
            category: req.body.category,
            date: req.body.date
        };

        const validationError = validateTransaction(transactionData);
        if (validationError) {
            return res.status(400).json({
                success: false,
                message: validationError
            });
        }

        const newId = Date.now();
        const createdTransaction = await Transaction.create({
            id: newId,
            description: transactionData.description.trim(),
            amount: transactionData.amount,
            type: transactionData.type,
            category: transactionData.category.trim(),
            date: transactionData.date
        });

        res.status(201).json({
            success: true,
            message: "Transaction added successfully.",
            transaction: {
                id: createdTransaction.id,
                description: createdTransaction.description,
                amount: createdTransaction.amount,
                type: createdTransaction.type,
                category: createdTransaction.category,
                date: createdTransaction.date
            }
        });
    } catch (error) {
        console.error("Error adding transaction:", error);
        res.status(500).json({
            success: false,
            message: "Server error while adding transaction."
        });
    }
});

// ==========================================
// UPDATE TRANSACTION
// ==========================================

app.put("/api/transactions/:id", async function (req, res) {
    try {
        const targetId = Number(req.params.id);
        const amount = Number(req.body.amount);

        const transactionData = {
            description: req.body.description,
            amount,
            type: req.body.type,
            category: req.body.category,
            date: req.body.date
        };

        const validationError = validateTransaction(transactionData);
        if (validationError) {
            return res.status(400).json({
                success: false,
                message: validationError
            });
        }

        const updatedTransaction = await Transaction.findOneAndUpdate(
            { id: targetId },
            {
                description: transactionData.description.trim(),
                amount: transactionData.amount,
                type: transactionData.type,
                category: transactionData.category.trim(),
                date: transactionData.date
            },
            { returnDocument: "after" }
        );

        if (!updatedTransaction) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found."
            });
        }

        res.status(200).json({
            success: true,
            message: "Transaction updated successfully.",
            transaction: {
                id: updatedTransaction.id,
                description: updatedTransaction.description,
                amount: updatedTransaction.amount,
                type: updatedTransaction.type,
                category: updatedTransaction.category,
                date: updatedTransaction.date
            }
        });
    } catch (error) {
        console.error("Error updating transaction:", error);
        res.status(500).json({
            success: false,
            message: "Server error while updating transaction."
        });
    }
});

// ==========================================
// DELETE ALL TRANSACTIONS (CLEAR ALL)
// ==========================================

app.delete("/api/transactions", async function (req, res) {
    try {
        await Transaction.deleteMany({});

        res.status(200).json({
            success: true,
            message: "All transactions cleared successfully."
        });
    } catch (error) {
        console.error("Error clearing transactions:", error);
        res.status(500).json({
            success: false,
            message: "Server error while clearing transactions."
        });
    }
});

// ==========================================
// DELETE SINGLE TRANSACTION
// ==========================================

app.delete("/api/transactions/:id", async function (req, res) {
    try {
        const targetId = Number(req.params.id);

        const deleted = await Transaction.findOneAndDelete({ id: targetId });

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found."
            });
        }

        res.status(200).json({
            success: true,
            message: "Transaction deleted successfully."
        });
    } catch (error) {
        console.error("Error deleting transaction:", error);
        res.status(500).json({
            success: false,
            message: "Server error while deleting transaction."
        });
    }
});

// ==========================================
// GET BUDGET
// ==========================================

app.get("/api/budget", async function (req, res) {
    try {
        const budgetDoc = await Budget.findOne({ key: "current_budget" });

        res.status(200).json({
            success: true,
            monthlyBudget: budgetDoc ? budgetDoc.monthlyBudget : 0
        });
    } catch (error) {
        console.error("Error retrieving budget:", error);
        res.status(500).json({
            success: false,
            message: "Unable to retrieve budget."
        });
    }
});

// ==========================================
// SAVE BUDGET
// ==========================================

app.post("/api/budget", async function (req, res) {
    try {
        const amount = Number(req.body.amount);

        if (!Number.isFinite(amount) || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Budget amount must be greater than zero."
            });
        }

        const budgetDoc = await Budget.findOneAndUpdate(
            { key: "current_budget" },
            { monthlyBudget: amount },
            { upsert: true, returnDocument: "after" }
        );

        res.status(200).json({
            success: true,
            message: "Budget saved successfully.",
            monthlyBudget: budgetDoc.monthlyBudget
        });
    } catch (error) {
        console.error("Error saving budget:", error);
        res.status(500).json({
            success: false,
            message: "Server error while saving budget."
        });
    }
});

// ==========================================
// UNKNOWN API ROUTE
// ==========================================

app.use("/api", function (req, res) {
    res.status(404).json({
        success: false,
        message: "API endpoint not found."
    });
});

// ==========================================
// CLIENT FALLBACK ROUTE
// ==========================================

app.use(function (req, res) {
    if (fs.existsSync(path.join(clientDistPath, "index.html"))) {
        res.sendFile(path.join(clientDistPath, "index.html"));
    } else if (fs.existsSync(path.join(publicPath, "index.html"))) {
        res.sendFile(path.join(publicPath, "index.html"));
    } else {
        res.status(404).send("Application build not found.");
    }
});

// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================

app.use(function (error, req, res, next) {
    console.error("Unexpected error:", error);
    res.status(500).json({
        success: false,
        message: "Internal server error."
    });
});

// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, function () {
    console.log("");
    console.log("======================================");
    console.log(" BudgetFlow Backend Server Started");
    console.log("======================================");
    console.log(`Server:       http://localhost:${PORT}`);
    console.log(`Transactions: http://localhost:${PORT}/api/transactions`);
    console.log(`Budget:       http://localhost:${PORT}/api/budget`);
    console.log(`Database:     ${MONGODB_URI}`);
    console.log("======================================");
});