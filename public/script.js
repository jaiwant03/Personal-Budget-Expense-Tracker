// ==========================================
// PERSONAL BUDGET & EXPENSE TRACKER
// FRONTEND JAVASCRIPT
// NODE.JS + EXPRESS VERSION
// ==========================================


// ==========================================
// APPLICATION STATE
// ==========================================

let transactions = [];
let monthlyBudget = 0;


// ==========================================
// ELEMENTS
// ==========================================

const transactionModal =
    document.getElementById("transactionModal");

const budgetModal =
    document.getElementById("budgetModal");

const transactionForm =
    document.getElementById("transactionForm");

const budgetForm =
    document.getElementById("budgetForm");

const transactionList =
    document.getElementById("transactionList");

const emptyState =
    document.getElementById("emptyState");

const monthFilter =
    document.getElementById("monthFilter");


// ==========================================
// CURRENT MONTH
// ==========================================

const currentDate = new Date();

monthFilter.value =
    `${currentDate.getFullYear()}-${String(
        currentDate.getMonth() + 1
    ).padStart(2, "0")}`;


// Set today's date in transaction form

document.getElementById(
    "transactionDate"
).value =
    new Date()
        .toISOString()
        .split("T")[0];


// ==========================================
// API HELPER
// ==========================================

async function apiRequest(url, options = {}) {

    try {

        const response =
            await fetch(url, {

                headers: {
                    "Content-Type": "application/json"
                },

                ...options

            });


        // Try to read JSON response

        const data =
            await response.json();


        // Server returned an error

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Something went wrong."
            );

        }


        return data;

    } catch (error) {

        console.error(
            "API Error:",
            error
        );

        throw error;

    }

}


// ==========================================
// LOAD DATA FROM NODE.JS SERVER
// ==========================================

async function loadData() {

    try {

        // Get transactions

        const transactionData =
            await apiRequest(
                "/api/transactions"
            );


        transactions =
            transactionData.transactions || [];


        // Get monthly budget

        const budgetData =
            await apiRequest(
                "/api/budget"
            );


        monthlyBudget =
            Number(
                budgetData.monthlyBudget
            ) || 0;


        // Display everything

        renderTransactions();

    } catch (error) {

        console.error(error);

        alert(
            "Unable to connect to the server.\n\n" +
            "Please make sure the Node.js server is running."
        );

    }

}


// ==========================================
// OPEN ADD TRANSACTION MODAL
// ==========================================

document
    .getElementById("addTransactionBtn")
    .addEventListener(
        "click",
        function () {

            // Clear previous form data

            transactionForm.reset();


            // Clear edit ID

            document.getElementById(
                "editId"
            ).value = "";


            // Change modal title

            document.getElementById(
                "modalTitle"
            ).textContent =
                "Add Transaction";


            // Set today's date

            document.getElementById(
                "transactionDate"
            ).value =
                new Date()
                    .toISOString()
                    .split("T")[0];


            // Show modal

            transactionModal.classList.add(
                "show"
            );

        }
    );


// ==========================================
// CLOSE TRANSACTION MODAL
// ==========================================

document
    .getElementById("closeModal")
    .addEventListener(
        "click",
        function () {

            transactionModal.classList.remove(
                "show"
            );

        }
    );


// ==========================================
// ADD / UPDATE TRANSACTION
// ==========================================

transactionForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        // ==================================
        // GET FORM VALUES
        // ==================================

        const description =
            document
                .getElementById("description")
                .value
                .trim();


        const amount =
            Number(
                document
                    .getElementById("amount")
                    .value
            );


        const type =
            document
                .getElementById("transactionType")
                .value;


        const category =
            document
                .getElementById("category")
                .value;


        const date =
            document
                .getElementById("transactionDate")
                .value;


        const editId =
            document
                .getElementById("editId")
                .value;


        // ==================================
        // CLIENT-SIDE VALIDATION
        // ==================================

        if (!description) {

            alert(
                "Please enter a description."
            );

            return;

        }


        if (
            !Number.isFinite(amount) ||
            amount <= 0
        ) {

            alert(
                "Amount must be greater than zero."
            );

            return;

        }


        if (!type) {

            alert(
                "Please select transaction type."
            );

            return;

        }


        if (!category) {

            alert(
                "Please select a category."
            );

            return;

        }


        if (!date) {

            alert(
                "Please select a date."
            );

            return;

        }


        // ==================================
        // TRANSACTION OBJECT
        // ==================================

        const transactionData = {

            description:
                description,

            amount:
                amount,

            type:
                type,

            category:
                category,

            date:
                date

        };


        try {

            // ==================================
            // UPDATE EXISTING TRANSACTION
            // ==================================

            if (editId) {

                const result =
                    await apiRequest(
                        `/api/transactions/${editId}`,
                        {

                            method: "PUT",

                            body:
                                JSON.stringify(
                                    transactionData
                                )

                        }
                    );


                // Update local frontend state

                const index =
                    transactions.findIndex(
                        transaction =>
                            transaction.id ===
                            Number(editId)
                    );


                if (index !== -1) {

                    transactions[index] =
                        result.transaction;

                }


                alert(
                    "Transaction updated successfully."
                );

            }


            // ==================================
            // CREATE NEW TRANSACTION
            // ==================================

            else {

                const result =
                    await apiRequest(
                        "/api/transactions",
                        {

                            method: "POST",

                            body:
                                JSON.stringify(
                                    transactionData
                                )

                        }
                    );


                // Add server-created transaction

                transactions.push(
                    result.transaction
                );


                alert(
                    "Transaction added successfully."
                );

            }


            // Clear form

            transactionForm.reset();


            // Close modal

            transactionModal.classList.remove(
                "show"
            );


            // Refresh table and dashboard

            renderTransactions();

        } catch (error) {

            alert(
                error.message ||
                "Unable to save transaction."
            );

        }

    }
);


// ==========================================
// DISPLAY TRANSACTIONS
// ==========================================

function renderTransactions() {

    transactionList.innerHTML = "";


    // ==================================
    // SEARCH
    // ==================================

    const searchText =
        document
            .getElementById("searchInput")
            .value
            .toLowerCase()
            .trim();


    // ==================================
    // TYPE FILTER
    // ==================================

    const typeFilter =
        document
            .getElementById("typeFilter")
            .value;


    // ==================================
    // MONTH FILTER
    // ==================================

    const selectedMonth =
        monthFilter.value;


    // ==================================
    // FILTER TRANSACTIONS
    // ==================================

    const filteredTransactions =
        transactions.filter(
            function (transaction) {

                const description =
                    String(
                        transaction.description || ""
                    ).toLowerCase();


                const category =
                    String(
                        transaction.category || ""
                    ).toLowerCase();


                // Search condition

                const matchesSearch =

                    description.includes(
                        searchText
                    )

                    ||

                    category.includes(
                        searchText
                    );


                // Type condition

                const matchesType =

                    typeFilter === "all"

                    ||

                    transaction.type ===
                        typeFilter;


                // Month condition

                const matchesMonth =

                    !selectedMonth

                    ||

                    String(
                        transaction.date
                    ).startsWith(
                        selectedMonth
                    );


                return (
                    matchesSearch &&
                    matchesType &&
                    matchesMonth
                );

            }
        );


    // ==================================
    // EMPTY STATE
    // ==================================

    if (
        filteredTransactions.length === 0
    ) {

        emptyState.style.display =
            "block";

    } else {

        emptyState.style.display =
            "none";

    }


    // ==================================
    // NEWEST TRANSACTION FIRST
    // ==================================

    filteredTransactions
        .sort(
            (a, b) =>
                new Date(b.date) -
                new Date(a.date)
        )
        .forEach(
            function (transaction) {

                const row =
                    document.createElement("tr");


                // Income = +
                // Expense = -

                const amountSign =
                    transaction.type ===
                    "income"
                        ? "+"
                        : "-";


                // ==================================
                // CREATE TABLE ROW
                // ==================================

                row.innerHTML = `

                    <td>
                        <strong>
                            ${escapeHTML(
                                transaction.description
                            )}
                        </strong>
                    </td>

                    <td>
                        ${escapeHTML(
                            transaction.category
                        )}
                    </td>

                    <td>
                        ${formatDate(
                            transaction.date
                        )}
                    </td>

                    <td>

                        <span class="${
                            transaction.type ===
                            "income"
                                ? "type-income"
                                : "type-expense"
                        }">

                            ${
                                transaction.type ===
                                "income"
                                    ? "Income"
                                    : "Expense"
                            }

                        </span>

                    </td>

                    <td class="${
                        transaction.type ===
                        "income"
                            ? "amount-income"
                            : "amount-expense"
                    }">

                        ${amountSign}${formatCurrency(
                            transaction.amount
                        )}

                    </td>

                    <td>

                        <button
                            class="action-btn edit-btn"
                            onclick="editTransaction(${transaction.id})"
                        >
                            Edit
                        </button>

                        <button
                            class="action-btn delete-btn"
                            onclick="deleteTransaction(${transaction.id})"
                        >
                            Delete
                        </button>

                    </td>

                `;


                transactionList.appendChild(
                    row
                );

            }
        );


    // Update dashboard

    updateSummary();

}


// ==========================================
// EDIT TRANSACTION
// ==========================================

function editTransaction(id) {

    const transaction =
        transactions.find(
            transaction =>
                transaction.id === id
        );


    if (!transaction) {

        alert(
            "Transaction not found."
        );

        return;

    }


    // Fill form

    document.getElementById(
        "description"
    ).value =
        transaction.description;


    document.getElementById(
        "amount"
    ).value =
        transaction.amount;


    document.getElementById(
        "transactionType"
    ).value =
        transaction.type;


    document.getElementById(
        "category"
    ).value =
        transaction.category;


    document.getElementById(
        "transactionDate"
    ).value =
        transaction.date;


    document.getElementById(
        "editId"
    ).value =
        transaction.id;


    // Change modal title

    document.getElementById(
        "modalTitle"
    ).textContent =
        "Edit Transaction";


    // Show modal

    transactionModal.classList.add(
        "show"
    );

}


// ==========================================
// DELETE TRANSACTION
// ==========================================

async function deleteTransaction(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this transaction?"
        );


    if (!confirmDelete) {

        return;

    }


    try {

        // Send DELETE request to Node.js

        await apiRequest(
            `/api/transactions/${id}`,
            {
                method: "DELETE"
            }
        );


        // Remove from frontend state

        transactions =
            transactions.filter(
                transaction =>
                    transaction.id !== id
            );


        // Refresh UI

        renderTransactions();


        alert(
            "Transaction deleted successfully."
        );

    } catch (error) {

        alert(
            error.message ||
            "Unable to delete transaction."
        );

    }

}


// ==========================================
// OPEN BUDGET MODAL
// ==========================================

document
    .getElementById("setBudgetBtn")
    .addEventListener(
        "click",
        function () {

            document.getElementById(
                "budgetInput"
            ).value =
                monthlyBudget || "";


            budgetModal.classList.add(
                "show"
            );

        }
    );


// ==========================================
// CLOSE BUDGET MODAL
// ==========================================

document
    .getElementById("closeBudgetModal")
    .addEventListener(
        "click",
        function () {

            budgetModal.classList.remove(
                "show"
            );

        }
    );


// ==========================================
// SAVE MONTHLY BUDGET
// ==========================================

budgetForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const amount =
            Number(
                document
                    .getElementById(
                        "budgetInput"
                    )
                    .value
            );


        // ==================================
        // CLIENT-SIDE VALIDATION
        // ==================================

        if (
            !Number.isFinite(amount) ||
            amount <= 0
        ) {

            alert(
                "Budget amount must be greater than zero."
            );

            return;

        }


        try {

            // Send budget to Node.js

            const result =
                await apiRequest(
                    "/api/budget",
                    {

                        method: "POST",

                        body:
                            JSON.stringify({
                                amount:
                                    amount
                            })

                    }
                );


            // Update frontend state

            monthlyBudget =
                Number(
                    result.monthlyBudget
                );


            // Close modal

            budgetModal.classList.remove(
                "show"
            );


            // Update dashboard

            updateSummary();


            alert(
                "Monthly budget saved successfully."
            );

        } catch (error) {

            alert(
                error.message ||
                "Unable to save budget."
            );

        }

    }
);


// ==========================================
// UPDATE DASHBOARD SUMMARY
// ==========================================

function updateSummary() {

    const selectedMonth =
        monthFilter.value;


    // Get transactions for selected month

    const monthlyTransactions =
        transactions.filter(
            transaction =>
                !selectedMonth ||
                transaction.date.startsWith(
                    selectedMonth
                )
        );


    let totalIncome = 0;

    let totalExpense = 0;


    // ==================================
    // CALCULATE TOTALS
    // ==================================

    monthlyTransactions.forEach(
        function (transaction) {

            if (
                transaction.type ===
                "income"
            ) {

                totalIncome +=
                    Number(
                        transaction.amount
                    );

            }

            else if (
                transaction.type ===
                "expense"
            ) {

                totalExpense +=
                    Number(
                        transaction.amount
                    );

            }

        }
    );


    // ==================================
    // BALANCE
    // ==================================

    const balance =
        totalIncome -
        totalExpense;


    // ==================================
    // DISPLAY VALUES
    // ==================================

    document.getElementById(
        "income"
    ).textContent =
        formatCurrency(
            totalIncome
        );


    document.getElementById(
        "expense"
    ).textContent =
        formatCurrency(
            totalExpense
        );


    document.getElementById(
        "balance"
    ).textContent =
        formatCurrency(
            balance
        );


    document.getElementById(
        "savings"
    ).textContent =
        formatCurrency(
            balance
        );


    // Update budget

    updateBudget(
        totalExpense
    );

}


// ==========================================
// UPDATE BUDGET PROGRESS
// ==========================================

function updateBudget(totalExpense) {

    const remaining =
        monthlyBudget -
        totalExpense;


    let percentage = 0;


    if (
        monthlyBudget > 0
    ) {

        percentage =
            (
                totalExpense /
                monthlyBudget
            ) * 100;

    }


    // ==================================
    // DISPLAY BUDGET
    // ==================================

    document.getElementById(
        "budgetAmount"
    ).textContent =
        formatCurrency(
            monthlyBudget
        );


    document.getElementById(
        "budgetSpent"
    ).textContent =
        formatCurrency(
            totalExpense
        );


    document.getElementById(
        "budgetRemaining"
    ).textContent =
        formatCurrency(
            remaining
        );


    // ==================================
    // PROGRESS BAR
    // ==================================

    const progressBar =
        document.getElementById(
            "budgetProgress"
        );


    progressBar.style.width =
        Math.min(
            percentage,
            100
        ) + "%";


    document.getElementById(
        "budgetPercentage"
    ).textContent =
        `${percentage.toFixed(1)}% of budget used`;


    // ==================================
    // PROGRESS COLOR
    // ==================================

    if (
        percentage >= 100
    ) {

        progressBar.style.background =
            "#dc2626";

    }

    else if (
        percentage >= 75
    ) {

        progressBar.style.background =
            "#f59e0b";

    }

    else {

        progressBar.style.background =
            "#4f46e5";

    }

}


// ==========================================
// SEARCH
// ==========================================

document
    .getElementById("searchInput")
    .addEventListener(
        "input",
        renderTransactions
    );


// ==========================================
// TYPE FILTER
// ==========================================

document
    .getElementById("typeFilter")
    .addEventListener(
        "change",
        renderTransactions
    );


// ==========================================
// MONTH FILTER
// ==========================================

monthFilter.addEventListener(
    "change",
    renderTransactions
);


// ==========================================
// CLOSE MODALS BY CLICKING OUTSIDE
// ==========================================

window.addEventListener(
    "click",
    function (event) {

        if (
            event.target ===
            transactionModal
        ) {

            transactionModal.classList.remove(
                "show"
            );

        }


        if (
            event.target ===
            budgetModal
        ) {

            budgetModal.classList.remove(
                "show"
            );

        }

    }
);


// ==========================================
// CURRENCY FORMAT
// ==========================================

function formatCurrency(amount) {

    return new Intl.NumberFormat(
        "en-IN",
        {

            style: "currency",

            currency: "INR",

            maximumFractionDigits: 2

        }
    ).format(amount);

}


// ==========================================
// DATE FORMAT
// ==========================================

function formatDate(date) {

    return new Date(
        date + "T00:00:00"
    ).toLocaleDateString(
        "en-IN",
        {

            day: "2-digit",

            month: "short",

            year: "numeric"

        }
    );

}


// ==========================================
// PREVENT HTML INJECTION
// ==========================================

function escapeHTML(value) {

    const div =
        document.createElement("div");


    div.textContent =
        value;


    return div.innerHTML;

}


// ==========================================
// START APPLICATION
// ==========================================

// Load transactions and budget
// from Node.js server

loadData();