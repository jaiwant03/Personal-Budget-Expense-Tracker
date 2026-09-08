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

const chartsModal =
    document.getElementById("chartsModal");

const visualChartsBtn =
    document.getElementById("visualChartsBtn");

const closeChartsModal =
    document.getElementById("closeChartsModal");

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
                            title="Edit transaction"
                            onclick="editTransaction('${transaction.id}')"
                        >
                            Edit
                        </button>

                        <button
                            class="action-btn delete-btn"
                            title="Delete transaction"
                            onclick="deleteTransaction('${transaction.id}')"
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
                String(transaction.id) === String(id)
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

    if (!id) return;


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


        // Remove from frontend state (string-safe comparison)

        transactions =
            transactions.filter(
                transaction =>
                    String(transaction.id) !== String(id)
            );


        // Refresh UI

        renderTransactions();

    } catch (error) {

        alert(
            error.message ||
            "Unable to delete transaction."
        );

    }

}


// ==========================================
// CLEAR ALL TRANSACTIONS
// ==========================================

const clearAllBtn =
    document.getElementById("clearAllBtn");

if (clearAllBtn) {

    clearAllBtn.addEventListener(
        "click",
        async function () {

            if (!transactions || transactions.length === 0) {

                alert(
                    "There are no transactions to clear."
                );

                return;

            }


            const confirmClear =
                confirm(
                    "Are you sure you want to clear all transactions? This action cannot be undone."
                );


            if (!confirmClear) {

                return;

            }


            try {

                try {

                    // Primary: fast batch delete endpoint
                    await apiRequest(
                        "/api/transactions",
                        {
                            method: "DELETE"
                        }
                    );

                } catch (batchError) {

                    // Fallback: delete each transaction individually
                    await Promise.all(
                        transactions.map(t =>
                            apiRequest(
                                `/api/transactions/${t.id}`,
                                {
                                    method: "DELETE"
                                }
                            )
                        )
                    );

                }


                transactions = [];

                renderTransactions();

            } catch (error) {

                alert(
                    error.message ||
                    "Unable to clear transactions."
                );

            }

        }
    );

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


    // Update charts

    renderVisualCharts();

}


// ==========================================
// UPDATE BUDGET PROGRESS
// ==========================================

function updateBudget(totalExpense) {

    const budgetAmountEl =
        document.getElementById("budgetAmount");

    const budgetSpentEl =
        document.getElementById("budgetSpent");

    const budgetRemainingEl =
        document.getElementById("budgetRemaining");

    const progressBar =
        document.getElementById("budgetProgress");

    const budgetPercentageEl =
        document.getElementById("budgetPercentage");


    let usedSpan =
        document.getElementById("budgetUsedText");

    let remainingSpan =
        document.getElementById("budgetRemainingText");


    if (!usedSpan || !remainingSpan) {

        budgetPercentageEl.innerHTML = `
            <span id="budgetUsedText">0.0% of budget used</span>
            <span id="budgetRemainingText"></span>
        `;

        usedSpan =
            document.getElementById("budgetUsedText");

        remainingSpan =
            document.getElementById("budgetRemainingText");

    }


    // ==================================
    // EDGE CASE 6: NO BUDGET SET (<= 0)
    // ==================================

    if (!monthlyBudget || monthlyBudget <= 0) {

        budgetAmountEl.textContent =
            formatCurrency(0);

        budgetSpentEl.textContent =
            formatCurrency(totalExpense);

        budgetRemainingEl.textContent =
            formatCurrency(0);

        budgetRemainingEl.style.color = "";


        progressBar.style.width = "0%";

        progressBar.style.background = "#00b865";


        usedSpan.textContent =
            "0.0% of budget used";

        remainingSpan.textContent = "";

        remainingSpan.style.color = "";

        remainingSpan.style.fontWeight = "";

        return;

    }


    // ==================================
    // BUDGET CALCULATIONS
    // ==================================

    const remaining =
        monthlyBudget -
        totalExpense;


    const percentage =
        (totalExpense /
            monthlyBudget) * 100;


    // ==================================
    // DISPLAY VALUES
    // ==================================

    budgetAmountEl.textContent =
        formatCurrency(monthlyBudget);

    budgetSpentEl.textContent =
        formatCurrency(totalExpense);

    budgetRemainingEl.textContent =
        formatCurrency(remaining);


    // ==================================
    // PROGRESS BAR WIDTH
    // ==================================
    // Visual progress bar capped at 100%

    progressBar.style.width =
        Math.min(
            percentage,
            100
        ) + "%";


    // Text displays actual usage percentage

    usedSpan.textContent =
        `${percentage.toFixed(1)}% of budget used`;


    // ==================================
    // BUDGET STATUS STATES
    // ==================================

    if (totalExpense > monthlyBudget) {

        // State 3: Exceeded
        const exceededAmount =
            totalExpense - monthlyBudget;

        remainingSpan.textContent =
            `Budget exceeded by ${formatCurrency(exceededAmount)}`;

        remainingSpan.style.color = "#dc2626";

        remainingSpan.style.fontWeight = "600";


        progressBar.style.background = "#dc2626";

        budgetRemainingEl.style.color = "#dc2626";

    }

    else if (totalExpense === monthlyBudget) {

        // State 2: Exactly 100%
        remainingSpan.textContent =
            "Budget fully used";

        remainingSpan.style.color = "#4b5563";

        remainingSpan.style.fontWeight = "500";


        progressBar.style.background = "#dc2626";

        budgetRemainingEl.style.color = "";

    }

    else {

        // State 1: Spent < Budget
        const remainingPercent =
            ((monthlyBudget - totalExpense) /
                monthlyBudget) * 100;

        remainingSpan.textContent =
            `${remainingPercent.toFixed(1)}% remaining`;

        remainingSpan.style.color = "#4b5563";

        remainingSpan.style.fontWeight = "500";


        if (percentage >= 75) {

            progressBar.style.background = "#f59e0b";

        } else {

            progressBar.style.background = "#00b865";

        }

        budgetRemainingEl.style.color = "";

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


        if (
            event.target ===
            chartsModal
        ) {

            chartsModal.classList.remove(
                "show"
            );

        }

    }
);


// ==========================================
// CLOSE MODALS WITH ESCAPE KEY
// ==========================================

window.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Escape") {

            if (transactionModal) {
                transactionModal.classList.remove("show");
            }

            if (budgetModal) {
                budgetModal.classList.remove("show");
            }

            if (chartsModal) {
                chartsModal.classList.remove("show");
            }

        }

    }
);


// ==========================================
// CURRENCY FORMAT
// ==========================================

function formatCurrency(amount) {

    const numericAmount = Number(amount) || 0;

    return new Intl.NumberFormat(
        "en-IN",
        {

            style: "currency",

            currency: "INR",

            minimumFractionDigits:
                numericAmount % 1 === 0 ? 0 : 2,

            maximumFractionDigits: 2

        }
    ).format(numericAmount);

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
// VISUAL CHARTS
// ==========================================

let expenseBreakdownChart = null;
let incomeVsExpenseChart = null;
let monthlySpendingTrendChart = null;

if (visualChartsBtn) {

    visualChartsBtn.addEventListener(
        "click",
        function () {

            if (chartsModal) {

                chartsModal.classList.add("show");

                renderVisualCharts();

            }

        }
    );

}

if (closeChartsModal) {

    closeChartsModal.addEventListener(
        "click",
        function () {

            if (chartsModal) {

                chartsModal.classList.remove("show");

            }

        }
    );

}

const categoryColors = {
    Salary: "#00b865",
    Food: "#0284c7",
    Travel: "#0f766e",
    Shopping: "#f59e0b",
    Education: "#10b981",
    Bills: "#ef4444",
    Entertainment: "#6366f1",
    Other: "#64748b"
};

const fallbackColors = [
    "#00b865",
    "#0284c7",
    "#0f766e",
    "#f59e0b",
    "#10b981",
    "#ef4444",
    "#6366f1",
    "#8b5cf6",
    "#14b8a6",
    "#f97316"
];

function getCategoryColor(category, index) {

    return (
        categoryColors[category] ||
        fallbackColors[index % fallbackColors.length]
    );

}

function renderVisualCharts() {

    if (typeof Chart === "undefined") {

        console.warn("Chart.js is not loaded.");

        return;

    }

    const selectedMonth =
        monthFilter.value;

    let monthLabel = "Selected Month";

    if (selectedMonth) {

        const [year, month] =
            selectedMonth.split("-");

        const dateObj =
            new Date(
                Number(year),
                Number(month) - 1,
                1
            );

        monthLabel =
            dateObj.toLocaleDateString(
                "en-IN",
                {
                    month: "short",
                    year: "numeric"
                }
            );

    }

    const monthSubtitle =
        document.getElementById("chartsMonthSubtitle");

    if (monthSubtitle) {

        monthSubtitle.textContent =
            `Financial analytics for ${monthLabel}`;

    }

    const expenseBadge =
        document.getElementById("expenseMonthBadge");

    if (expenseBadge) {

        expenseBadge.textContent =
            monthLabel;

    }

    const incomeExpenseBadge =
        document.getElementById("incomeExpenseMonthBadge");

    if (incomeExpenseBadge) {

        incomeExpenseBadge.textContent =
            monthLabel;

    }

    // 1. Expense Breakdown (Donut)
    renderExpenseBreakdown(selectedMonth);

    // 2. Income vs Expense (Bar)
    renderIncomeVsExpense(selectedMonth);

    // 3. Monthly Spending Trend (Line)
    renderMonthlySpendingTrend();

}

function renderExpenseBreakdown(selectedMonth) {

    const canvas =
        document.getElementById("expenseBreakdownChart");

    const emptyState =
        document.getElementById("expenseBreakdownEmpty");

    const detailsWrap =
        document.getElementById("expenseBreakdownDetails");

    const categoryList =
        document.getElementById("expenseCategoryList");

    const totalEl =
        document.getElementById("expenseBreakdownTotal");

    if (!canvas) return;

    // Filter ONLY expenses for the selected month
    const monthlyExpenses =
        transactions.filter(
            t => {
                const isExpense =
                    t.type === "expense";

                const matchesMonth =
                    !selectedMonth ||
                    (t.date &&
                        String(t.date).startsWith(selectedMonth));

                return isExpense && matchesMonth;
            }
        );

    // Group expenses by category
    const categoryTotals = {};
    let totalExpense = 0;

    monthlyExpenses.forEach(
        t => {
            const cat =
                t.category ? t.category.trim() : "Other";

            const amt =
                Number(t.amount) || 0;

            categoryTotals[cat] =
                (categoryTotals[cat] || 0) + amt;

            totalExpense += amt;
        }
    );

    const categories =
        Object.keys(categoryTotals);

    if (expenseBreakdownChart) {

        expenseBreakdownChart.destroy();

        expenseBreakdownChart = null;

    }

    if (categories.length === 0 || totalExpense === 0) {

        canvas.style.display = "none";

        if (emptyState) emptyState.style.display = "block";

        if (detailsWrap) detailsWrap.style.display = "none";

        return;

    }

    canvas.style.display = "block";

    if (emptyState) emptyState.style.display = "none";

    if (detailsWrap) detailsWrap.style.display = "block";

    const amounts =
        categories.map(cat => categoryTotals[cat]);

    const bgColors =
        categories.map((cat, i) => getCategoryColor(cat, i));

    if (categoryList) {

        categoryList.innerHTML =
            categories
                .map((cat, i) => {
                    const amt = categoryTotals[cat];
                    const pct =
                        totalExpense > 0
                            ? ((amt / totalExpense) * 100).toFixed(0)
                            : 0;

                    return `
                        <div class="category-breakdown-item">
                            <span class="category-dot" style="background-color: ${bgColors[i]}"></span>
                            <span>${escapeHTML(cat)}: <strong>${formatCurrency(amt)}</strong> (${pct}%)</span>
                        </div>
                    `;
                })
                .join("");

    }

    if (totalEl) {

        totalEl.textContent =
            formatCurrency(totalExpense);

    }

    const ctx = canvas.getContext("2d");

    expenseBreakdownChart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: categories,
            datasets: [
                {
                    data: amounts,
                    backgroundColor: bgColors,
                    borderColor: "#ffffff",
                    borderWidth: 2,
                    hoverOffset: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "65%",
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const val = context.raw || 0;
                            const pct =
                                totalExpense > 0
                                    ? ((val / totalExpense) * 100).toFixed(1)
                                    : 0;
                            return ` ${context.label}: ${formatCurrency(val)} (${pct}%)`;
                        }
                    }
                }
            }
        }
    });

}

function renderIncomeVsExpense(selectedMonth) {

    const canvas =
        document.getElementById("incomeVsExpenseChart");

    const emptyState =
        document.getElementById("incomeVsExpenseEmpty");

    const detailsWrap =
        document.getElementById("incomeVsExpenseDetails");

    const incomeTotalEl =
        document.getElementById("chartIncomeTotal");

    const expenseTotalEl =
        document.getElementById("chartExpenseTotal");

    const netTotalEl =
        document.getElementById("chartNetTotal");

    if (!canvas) return;

    const monthlyTransactions =
        transactions.filter(
            t => {
                return (
                    !selectedMonth ||
                    (t.date &&
                        String(t.date).startsWith(selectedMonth))
                );
            }
        );

    let totalIncome = 0;
    let totalExpense = 0;

    monthlyTransactions.forEach(
        t => {
            const amt = Number(t.amount) || 0;
            if (t.type === "income") totalIncome += amt;
            else if (t.type === "expense") totalExpense += amt;
        }
    );

    if (incomeVsExpenseChart) {

        incomeVsExpenseChart.destroy();

        incomeVsExpenseChart = null;

    }

    if (
        monthlyTransactions.length === 0 ||
        (totalIncome === 0 && totalExpense === 0)
    ) {

        canvas.style.display = "none";

        if (emptyState) emptyState.style.display = "block";

        if (detailsWrap) detailsWrap.style.display = "none";

        return;

    }

    canvas.style.display = "block";

    if (emptyState) emptyState.style.display = "none";

    if (detailsWrap) detailsWrap.style.display = "block";

    if (incomeTotalEl) {
        incomeTotalEl.textContent =
            formatCurrency(totalIncome);
    }

    if (expenseTotalEl) {
        expenseTotalEl.textContent =
            formatCurrency(totalExpense);
    }

    if (netTotalEl) {

        const net =
            totalIncome - totalExpense;

        netTotalEl.textContent =
            formatCurrency(net);

        netTotalEl.style.color =
            net >= 0 ? "#059669" : "#dc2626";

    }

    const ctx = canvas.getContext("2d");

    incomeVsExpenseChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Income", "Expense"],
            datasets: [
                {
                    data: [totalIncome, totalExpense],
                    backgroundColor: ["#00b865", "#dc2626"],
                    hoverBackgroundColor: ["#049b55", "#b91c1c"],
                    borderRadius: 8,
                    barThickness: 45
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return ` ${context.label}: ${formatCurrency(context.raw)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function (value) {
                            return formatCurrency(value);
                        },
                        font: {
                            family: "Inter",
                            size: 11
                        }
                    },
                    grid: {
                        color: "#f1f5f9"
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            family: "Inter",
                            size: 12,
                            weight: "600"
                        }
                    }
                }
            }
        }
    });

}

function renderMonthlySpendingTrend() {

    const canvas =
        document.getElementById("monthlySpendingTrendChart");

    const emptyState =
        document.getElementById("monthlySpendingTrendEmpty");

    if (!canvas) return;

    // Filter all expense transactions across all dates
    const allExpenses =
        transactions.filter(
            t => t.type === "expense" && t.date
        );

    const monthlySpending = {};

    allExpenses.forEach(
        t => {
            const monthKey =
                String(t.date).slice(0, 7);

            if (/^\d{4}-\d{2}$/.test(monthKey)) {

                const amt = Number(t.amount) || 0;

                monthlySpending[monthKey] =
                    (monthlySpending[monthKey] || 0) + amt;

            }
        }
    );

    const sortedMonthKeys =
        Object.keys(monthlySpending).sort();

    if (monthlySpendingTrendChart) {

        monthlySpendingTrendChart.destroy();

        monthlySpendingTrendChart = null;

    }

    if (sortedMonthKeys.length === 0) {

        canvas.style.display = "none";

        if (emptyState) emptyState.style.display = "block";

        return;

    }

    canvas.style.display = "block";

    if (emptyState) emptyState.style.display = "none";

    const labels =
        sortedMonthKeys.map(key => {
            const [year, month] =
                key.split("-");

            const dateObj =
                new Date(
                    Number(year),
                    Number(month) - 1,
                    1
                );

            return dateObj.toLocaleDateString(
                "en-IN",
                {
                    month: "short",
                    year: "numeric"
                }
            );
        });

    const values =
        sortedMonthKeys.map(
            key => monthlySpending[key]
        );

    const ctx = canvas.getContext("2d");

    monthlySpendingTrendChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Monthly Spending",
                    data: values,
                    borderColor: "#0f766e",
                    backgroundColor: "rgba(0, 184, 101, 0.12)",
                    fill: true,
                    tension: 0.35,
                    pointBackgroundColor: "#00b865",
                    pointBorderColor: "#ffffff",
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return ` Spending: ${formatCurrency(context.raw)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function (value) {
                            return formatCurrency(value);
                        },
                        font: {
                            family: "Inter",
                            size: 11
                        }
                    },
                    grid: {
                        color: "#f1f5f9"
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            family: "Inter",
                            size: 12,
                            weight: "500"
                        }
                    }
                }
            }
        }
    });

}


// ==========================================
// START APPLICATION
// ==========================================

// Load transactions and budget
// from Node.js server

loadData();