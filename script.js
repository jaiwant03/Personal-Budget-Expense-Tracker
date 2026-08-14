// ==========================================
// PERSONAL BUDGET & EXPENSE TRACKER
// ==========================================


// Get stored transactions

let transactions =
    JSON.parse(localStorage.getItem("transactions")) || [];

let monthlyBudget =
    Number(localStorage.getItem("monthlyBudget")) || 0;


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


// ==========================================
// CURRENT MONTH
// ==========================================

const monthFilter =
    document.getElementById("monthFilter");

const currentDate = new Date();

monthFilter.value =
    `${currentDate.getFullYear()}-${String(
        currentDate.getMonth() + 1
    ).padStart(2, "0")}`;

document.getElementById("transactionDate").value =
    new Date().toISOString().split("T")[0];


// ==========================================
// OPEN TRANSACTION MODAL
// ==========================================

document
    .getElementById("addTransactionBtn")
    .addEventListener("click", function () {

        transactionForm.reset();

        document.getElementById("editId").value = "";

        document.getElementById("modalTitle").textContent =
            "Add Transaction";

        document.getElementById("transactionDate").value =
            new Date().toISOString().split("T")[0];

        transactionModal.classList.add("show");

    });


// ==========================================
// CLOSE MODAL
// ==========================================

document
    .getElementById("closeModal")
    .addEventListener("click", function () {

        transactionModal.classList.remove("show");

    });


// ==========================================
// ADD / UPDATE TRANSACTION
// ==========================================

transactionForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const description =
        document.getElementById("description").value.trim();

    const amount =
        Number(document.getElementById("amount").value);

    const type =
        document.getElementById("transactionType").value;

    const category =
        document.getElementById("category").value;

    const date =
        document.getElementById("transactionDate").value;

    const editId =
        document.getElementById("editId").value;


    // Validation

    if (!description) {

        alert("Please enter a description.");
        return;

    }

    if (amount <= 0) {

        alert("Amount must be greater than zero.");
        return;

    }

    if (!type || !category || !date) {

        alert("Please complete all fields.");
        return;

    }


    // UPDATE

    if (editId) {

        const index =
            transactions.findIndex(
                transaction => transaction.id == editId
            );

        if (index !== -1) {

            transactions[index] = {

                ...transactions[index],

                description,
                amount,
                type,
                category,
                date

            };

        }

    }

    // CREATE

    else {

        const transaction = {

            id: Date.now(),

            description,
            amount,
            type,
            category,
            date

        };

        transactions.push(transaction);

    }


    saveTransactions();

    transactionForm.reset();

    transactionModal.classList.remove("show");

    renderTransactions();

});


// ==========================================
// READ / DISPLAY TRANSACTIONS
// ==========================================

function renderTransactions() {

    transactionList.innerHTML = "";


    const searchText =
        document
            .getElementById("searchInput")
            .value
            .toLowerCase();

    const typeFilter =
        document.getElementById("typeFilter").value;

    const selectedMonth =
        monthFilter.value;


    const filteredTransactions =
        transactions.filter(function (transaction) {

            const matchesSearch =

                transaction.description
                    .toLowerCase()
                    .includes(searchText)

                ||

                transaction.category
                    .toLowerCase()
                    .includes(searchText);


            const matchesType =

                typeFilter === "all"

                ||

                transaction.type === typeFilter;


            const matchesMonth =

                !selectedMonth

                ||

                transaction.date.startsWith(selectedMonth);


            return (
                matchesSearch &&
                matchesType &&
                matchesMonth
            );

        });


    if (filteredTransactions.length === 0) {

        emptyState.style.display = "block";

    } else {

        emptyState.style.display = "none";

    }


    // Newest transaction first

    filteredTransactions
        .sort(
            (a, b) =>
                new Date(b.date) - new Date(a.date)
        )
        .forEach(function (transaction) {

            const row =
                document.createElement("tr");


            const amountSign =
                transaction.type === "income"
                    ? "+"
                    : "-";


            row.innerHTML = `

                <td>
                    <strong>${escapeHTML(transaction.description)}</strong>
                </td>

                <td>
                    ${escapeHTML(transaction.category)}
                </td>

                <td>
                    ${formatDate(transaction.date)}
                </td>

                <td>

                    <span class="
                        ${
                            transaction.type === "income"
                            ? "type-income"
                            : "type-expense"
                        }
                    ">

                        ${
                            transaction.type === "income"
                            ? "Income"
                            : "Expense"
                        }

                    </span>

                </td>

                <td class="
                    ${
                        transaction.type === "income"
                        ? "amount-income"
                        : "amount-expense"
                    }
                ">

                    ${amountSign}${formatCurrency(transaction.amount)}

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

            transactionList.appendChild(row);

        });


    updateSummary();

}


// ==========================================
// EDIT TRANSACTION
// ==========================================

function editTransaction(id) {

    const transaction =
        transactions.find(
            transaction => transaction.id === id
        );


    if (!transaction) {
        return;
    }


    document.getElementById("description").value =
        transaction.description;

    document.getElementById("amount").value =
        transaction.amount;

    document.getElementById("transactionType").value =
        transaction.type;

    document.getElementById("category").value =
        transaction.category;

    document.getElementById("transactionDate").value =
        transaction.date;

    document.getElementById("editId").value =
        transaction.id;


    document.getElementById("modalTitle").textContent =
        "Edit Transaction";


    transactionModal.classList.add("show");

}


// ==========================================
// DELETE TRANSACTION
// ==========================================

function deleteTransaction(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this transaction?"
        );


    if (!confirmDelete) {
        return;
    }


    transactions =
        transactions.filter(
            transaction => transaction.id !== id
        );


    saveTransactions();

    renderTransactions();

}


// ==========================================
// SAVE TO LOCAL STORAGE
// ==========================================

function saveTransactions() {

    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );

}


// ==========================================
// CALCULATE DASHBOARD
// ==========================================

function updateSummary() {

    const selectedMonth =
        monthFilter.value;


    const monthlyTransactions =
        transactions.filter(
            transaction =>
                !selectedMonth ||
                transaction.date.startsWith(selectedMonth)
        );


    let totalIncome = 0;
    let totalExpense = 0;


    monthlyTransactions.forEach(function (transaction) {

        if (transaction.type === "income") {

            totalIncome += transaction.amount;

        }

        else {

            totalExpense += transaction.amount;

        }

    });


    const balance =
        totalIncome - totalExpense;


    document.getElementById("income").textContent =
        formatCurrency(totalIncome);

    document.getElementById("expense").textContent =
        formatCurrency(totalExpense);

    document.getElementById("balance").textContent =
        formatCurrency(balance);

    document.getElementById("savings").textContent =
        formatCurrency(balance);


    updateBudget(totalExpense);

}


// ==========================================
// SET BUDGET
// ==========================================

document
    .getElementById("setBudgetBtn")
    .addEventListener("click", function () {

        document.getElementById("budgetInput").value =
            monthlyBudget || "";

        budgetModal.classList.add("show");

    });


document
    .getElementById("closeBudgetModal")
    .addEventListener("click", function () {

        budgetModal.classList.remove("show");

    });


budgetForm.addEventListener("submit", function (event) {

    event.preventDefault();


    const amount =
        Number(
            document.getElementById("budgetInput").value
        );


    if (amount <= 0) {

        alert(
            "Budget amount must be greater than zero."
        );

        return;

    }


    monthlyBudget = amount;


    localStorage.setItem(
        "monthlyBudget",
        monthlyBudget
    );


    budgetModal.classList.remove("show");

    updateSummary();

});


// ==========================================
// UPDATE BUDGET PROGRESS
// ==========================================

function updateBudget(totalExpense) {

    const remaining =
        monthlyBudget - totalExpense;


    let percentage = 0;


    if (monthlyBudget > 0) {

        percentage =
            (totalExpense / monthlyBudget) * 100;

    }


    document.getElementById("budgetAmount").textContent =
        formatCurrency(monthlyBudget);

    document.getElementById("budgetSpent").textContent =
        formatCurrency(totalExpense);

    document.getElementById("budgetRemaining").textContent =
        formatCurrency(remaining);


    const progressBar =
        document.getElementById("budgetProgress");


    progressBar.style.width =
        Math.min(percentage, 100) + "%";


    document.getElementById(
        "budgetPercentage"
    ).textContent =

        `${percentage.toFixed(1)}% of budget used`;


    // Change progress color if budget exceeded

    if (percentage >= 100) {

        progressBar.style.background = "#dc2626";

    }

    else if (percentage >= 75) {

        progressBar.style.background = "#f59e0b";

    }

    else {

        progressBar.style.background = "#4f46e5";

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
// FILTER
// ==========================================

document
    .getElementById("typeFilter")
    .addEventListener(
        "change",
        renderTransactions
    );


monthFilter.addEventListener(
    "change",
    renderTransactions
);


// ==========================================
// CLOSE MODALS BY CLICKING OUTSIDE
// ==========================================

window.addEventListener("click", function (event) {

    if (event.target === transactionModal) {

        transactionModal.classList.remove("show");

    }

    if (event.target === budgetModal) {

        budgetModal.classList.remove("show");

    }

});


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

    div.textContent = value;

    return div.innerHTML;

}


// ==========================================
// INITIAL DISPLAY
// ==========================================

renderTransactions();