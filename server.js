const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

const PORT = 3000;

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());

app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));


// ==========================================
// DATABASE FILE
// ==========================================

const dataDirectory = path.join(__dirname, "data");

const dataFile = path.join(
    dataDirectory,
    "budget-data.json"
);


// Create data folder if missing
if (!fs.existsSync(dataDirectory)) {

    fs.mkdirSync(
        dataDirectory,
        { recursive: true }
    );

}


// Create JSON database if missing
if (!fs.existsSync(dataFile)) {

    fs.writeFileSync(
        dataFile,
        JSON.stringify(
            {
                transactions: [],
                monthlyBudget: 0
            },
            null,
            2
        )
    );

}


// ==========================================
// READ DATABASE
// ==========================================

function readData() {

    try {

        const fileContent =
            fs.readFileSync(
                dataFile,
                "utf8"
            );

        return JSON.parse(fileContent);

    } catch (error) {

        console.error(
            "Database read error:",
            error
        );

        return {
            transactions: [],
            monthlyBudget: 0
        };

    }

}


// ==========================================
// WRITE DATABASE
// ==========================================

function writeData(data) {

    try {

        fs.writeFileSync(
            dataFile,
            JSON.stringify(
                data,
                null,
                2
            )
        );

        return true;

    } catch (error) {

        console.error(
            "Database write error:",
            error
        );

        return false;

    }

}


// ==========================================
// TRANSACTION VALIDATION
// ==========================================

function validateTransaction(data) {

    if (
        typeof data.description !== "string" ||
        data.description.trim() === ""
    ) {

        return "Description is required.";

    }


    if (
        typeof data.amount !== "number" ||
        !Number.isFinite(data.amount) ||
        data.amount <= 0
    ) {

        return "Amount must be greater than zero.";

    }


    if (
        data.type !== "income" &&
        data.type !== "expense"
    ) {

        return "Transaction type must be income or expense.";

    }


    if (
        typeof data.category !== "string" ||
        data.category.trim() === ""
    ) {

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
// HOME PAGE
// ==========================================

app.get("/", function (req, res) {

    res.sendFile(
        path.join(
            __dirname,
            "public",
            "index.html"
        )
    );

});


// ==========================================
// GET TRANSACTIONS
// ==========================================

app.get(
    "/api/transactions",
    function (req, res) {

        try {

            const data = readData();

            res.status(200).json({

                success: true,

                transactions:
                    data.transactions

            });

        } catch (error) {

            console.error(error);

            res.status(500).json({

                success: false,

                message:
                    "Unable to retrieve transactions."

            });

        }

    }
);


// ==========================================
// ADD TRANSACTION
// ==========================================

app.post(
    "/api/transactions",
    function (req, res) {

        try {

            const amount =
                Number(req.body.amount);


            const transactionData = {

                description:
                    req.body.description,

                amount,

                type:
                    req.body.type,

                category:
                    req.body.category,

                date:
                    req.body.date

            };


            const validationError =
                validateTransaction(
                    transactionData
                );


            if (validationError) {

                return res.status(400).json({

                    success: false,

                    message:
                        validationError

                });

            }


            const data = readData();


            const transaction = {

                id: Date.now(),

                description:
                    transactionData.description.trim(),

                amount:
                    transactionData.amount,

                type:
                    transactionData.type,

                category:
                    transactionData.category.trim(),

                date:
                    transactionData.date

            };


            data.transactions.push(
                transaction
            );


            const saved =
                writeData(data);


            if (!saved) {

                return res.status(500).json({

                    success: false,

                    message:
                        "Failed to save transaction."

                });

            }


            res.status(201).json({

                success: true,

                message:
                    "Transaction added successfully.",

                transaction

            });

        } catch (error) {

            console.error(error);

            res.status(500).json({

                success: false,

                message:
                    "Server error while adding transaction."

            });

        }

    }
);


// ==========================================
// UPDATE TRANSACTION
// ==========================================

app.put(
    "/api/transactions/:id",
    function (req, res) {

        try {

            const id =
                Number(req.params.id);


            const amount =
                Number(req.body.amount);


            const transactionData = {

                description:
                    req.body.description,

                amount,

                type:
                    req.body.type,

                category:
                    req.body.category,

                date:
                    req.body.date

            };


            const validationError =
                validateTransaction(
                    transactionData
                );


            if (validationError) {

                return res.status(400).json({

                    success: false,

                    message:
                        validationError

                });

            }


            const data = readData();


            const index =
                data.transactions.findIndex(
                    transaction =>
                        transaction.id === id
                );


            if (index === -1) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Transaction not found."

                });

            }


            data.transactions[index] = {

                id,

                description:
                    transactionData.description.trim(),

                amount:
                    transactionData.amount,

                type:
                    transactionData.type,

                category:
                    transactionData.category.trim(),

                date:
                    transactionData.date

            };


            const saved =
                writeData(data);


            if (!saved) {

                return res.status(500).json({

                    success: false,

                    message:
                        "Failed to update transaction."

                });

            }


            res.status(200).json({

                success: true,

                message:
                    "Transaction updated successfully.",

                transaction:
                    data.transactions[index]

            });

        } catch (error) {

            console.error(error);

            res.status(500).json({

                success: false,

                message:
                    "Server error while updating transaction."

            });

        }

    }
);


// ==========================================
// DELETE TRANSACTION
// ==========================================

app.delete(
    "/api/transactions/:id",
    function (req, res) {

        try {

            const id =
                Number(req.params.id);


            const data = readData();


            const index =
                data.transactions.findIndex(
                    transaction =>
                        transaction.id === id
                );


            if (index === -1) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Transaction not found."

                });

            }


            data.transactions.splice(
                index,
                1
            );


            const saved =
                writeData(data);


            if (!saved) {

                return res.status(500).json({

                    success: false,

                    message:
                        "Failed to delete transaction."

                });

            }


            res.status(200).json({

                success: true,

                message:
                    "Transaction deleted successfully."

            });

        } catch (error) {

            console.error(error);

            res.status(500).json({

                success: false,

                message:
                    "Server error while deleting transaction."

            });

        }

    }
);


// ==========================================
// GET BUDGET
// ==========================================

app.get(
    "/api/budget",
    function (req, res) {

        try {

            const data = readData();


            res.status(200).json({

                success: true,

                monthlyBudget:
                    data.monthlyBudget

            });

        } catch (error) {

            console.error(error);

            res.status(500).json({

                success: false,

                message:
                    "Unable to retrieve budget."

            });

        }

    }
);


// ==========================================
// SAVE BUDGET
// ==========================================

app.post(
    "/api/budget",
    function (req, res) {

        try {

            const amount =
                Number(req.body.amount);


            if (
                !Number.isFinite(amount) ||
                amount <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Budget amount must be greater than zero."

                });

            }


            const data = readData();


            data.monthlyBudget =
                amount;


            const saved =
                writeData(data);


            if (!saved) {

                return res.status(500).json({

                    success: false,

                    message:
                        "Failed to save budget."

                });

            }


            res.status(200).json({

                success: true,

                message:
                    "Budget saved successfully.",

                monthlyBudget:
                    amount

            });

        } catch (error) {

            console.error(error);

            res.status(500).json({

                success: false,

                message:
                    "Server error while saving budget."

            });

        }

    }
);


// ==========================================
// UNKNOWN API ROUTE
// ==========================================

app.use(
    "/api",
    function (req, res) {

        res.status(404).json({

            success: false,

            message:
                "API endpoint not found."

        });

    }
);


// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================

app.use(
    function (error, req, res, next) {

        console.error(
            "Unexpected error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Internal server error."

        });

    }
);


// ==========================================
// START SERVER
// ==========================================

app.listen(
    PORT,
    function () {

        console.log("");
        console.log(
            "======================================"
        );

        console.log(
            " BudgetFlow Server Started"
        );

        console.log(
            "======================================"
        );

        console.log(
            `Server: http://localhost:${PORT}`
        );

        console.log(
            `Transactions: http://localhost:${PORT}/api/transactions`
        );

        console.log(
            `Budget: http://localhost:${PORT}/api/budget`
        );

        console.log(
            "======================================"
        );

    }
);