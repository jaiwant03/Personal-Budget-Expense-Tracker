import React, { useState, useEffect, useMemo } from "react";
import Navbar from "./components/Navbar";
import SummaryCards from "./components/SummaryCards";
import BudgetSection from "./components/BudgetSection";
import TransactionsSection from "./components/TransactionsSection";
import TransactionModal from "./components/TransactionModal";
import BudgetModal from "./components/BudgetModal";
import VisualChartsModal from "./components/VisualChartsModal";
import {
    getTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    clearAllTransactions,
    getBudget,
    saveBudget
} from "./services/api";

export default function App() {
    const [transactions, setTransactions] = useState([]);
    const [monthlyBudget, setMonthlyBudget] = useState(0);

    // Default to current year-month
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    });

    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");

    // Modal state
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
    const [isChartsModalOpen, setIsChartsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);

    // Initial load from MongoDB backend
    useEffect(() => {
        async function loadInitialData() {
            try {
                const [txRes, budgetRes] = await Promise.all([
                    getTransactions(),
                    getBudget()
                ]);

                if (txRes && txRes.transactions) {
                    setTransactions(txRes.transactions);
                }

                if (budgetRes && typeof budgetRes.monthlyBudget === "number") {
                    setMonthlyBudget(budgetRes.monthlyBudget);
                }
            } catch (error) {
                console.error("Failed to load initial data:", error);
                alert(
                    "Unable to connect to the server.\n\nPlease make sure the Node.js/MongoDB server is running."
                );
            }
        }

        loadInitialData();
    }, []);

    // Global Escape key listener to close active modals
    useEffect(() => {
        const handleKeyDown = e => {
            if (e.key === "Escape") {
                setIsTransactionModalOpen(false);
                setIsBudgetModalOpen(false);
                setIsChartsModalOpen(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    // Monthly summary calculation (Income, Expense, Balance, Savings)
    const { totalIncome, totalExpense, balance } = useMemo(() => {
        const monthlyTxs = transactions.filter(t => {
            return !selectedMonth || (t.date && String(t.date).startsWith(selectedMonth));
        });

        let income = 0;
        let expense = 0;

        monthlyTxs.forEach(t => {
            const amt = Number(t.amount) || 0;
            if (t.type === "income") income += amt;
            else if (t.type === "expense") expense += amt;
        });

        return {
            totalIncome: income,
            totalExpense: expense,
            balance: income - expense
        };
    }, [transactions, selectedMonth]);

    // Filtered and sorted transactions list
    const filteredTransactions = useMemo(() => {
        const s = searchTerm.toLowerCase().trim();

        return transactions
            .filter(t => {
                const desc = String(t.description || "").toLowerCase();
                const cat = String(t.category || "").toLowerCase();

                const matchesSearch = !s || desc.includes(s) || cat.includes(s);
                const matchesType = typeFilter === "all" || t.type === typeFilter;
                const matchesMonth =
                    !selectedMonth ||
                    (t.date && String(t.date).startsWith(selectedMonth));

                return matchesSearch && matchesType && matchesMonth;
            })
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [transactions, searchTerm, typeFilter, selectedMonth]);

    // Save transaction handler (Create / Update)
    const handleSaveTransaction = async transactionData => {
        try {
            if (editingTransaction) {
                const res = await updateTransaction(
                    editingTransaction.id,
                    transactionData
                );

                setTransactions(prev =>
                    prev.map(t =>
                        String(t.id) === String(editingTransaction.id)
                            ? res.transaction
                            : t
                    )
                );

                alert("Transaction updated successfully.");
            } else {
                const res = await addTransaction(transactionData);
                setTransactions(prev => [res.transaction, ...prev]);

                alert("Transaction added successfully.");
            }

            setIsTransactionModalOpen(false);
            setEditingTransaction(null);
        } catch (error) {
            console.error("Error saving transaction:", error);
            alert(error.message || "Unable to save transaction.");
        }
    };

    // Delete single transaction
    const handleDeleteTransaction = async id => {
        if (!id) return;

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this transaction?"
        );
        if (!confirmDelete) return;

        try {
            await deleteTransaction(id);
            setTransactions(prev =>
                prev.filter(t => String(t.id) !== String(id))
            );
        } catch (error) {
            console.error("Error deleting transaction:", error);
            alert(error.message || "Unable to delete transaction.");
        }
    };

    // Clear all transactions
    const handleClearAll = async () => {
        if (!transactions || transactions.length === 0) {
            alert("There are no transactions to clear.");
            return;
        }

        const confirmClear = window.confirm(
            "Are you sure you want to clear all transactions? This action cannot be undone."
        );
        if (!confirmClear) return;

        try {
            await clearAllTransactions();
            setTransactions([]);
        } catch (error) {
            console.error("Error clearing transactions:", error);
            alert(error.message || "Unable to clear transactions.");
        }
    };

    // Save budget
    const handleSaveBudget = async amount => {
        try {
            const res = await saveBudget(amount);
            setMonthlyBudget(Number(res.monthlyBudget));
            setIsBudgetModalOpen(false);
            alert("Monthly budget saved successfully.");
        } catch (error) {
            console.error("Error saving budget:", error);
            alert(error.message || "Unable to save budget.");
        }
    };

    return (
        <div>
            {/* NAVBAR */}
            <Navbar
                onOpenCharts={() => setIsChartsModalOpen(true)}
                onOpenAddTransaction={() => {
                    setEditingTransaction(null);
                    setIsTransactionModalOpen(true);
                }}
            />

            {/* MAIN DASHBOARD */}
            <main className="container">
                {/* WELCOME / HEADER */}
                <section className="welcome">
                    <div>
                        <h1>Financial Dashboard</h1>
                        <p>Track your income, expenses and monthly budget.</p>
                    </div>

                    <div className="month-box">
                        <label htmlFor="monthFilter">Month</label>
                        <input
                            type="month"
                            id="monthFilter"
                            title="Select a month"
                            value={selectedMonth}
                            onChange={e => setSelectedMonth(e.target.value)}
                        />
                    </div>
                </section>

                {/* SUMMARY CARDS */}
                <SummaryCards
                    totalIncome={totalIncome}
                    totalExpense={totalExpense}
                    balance={balance}
                />

                {/* BUDGET SECTION */}
                <BudgetSection
                    monthlyBudget={monthlyBudget}
                    totalExpense={totalExpense}
                    onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
                />

                {/* TRANSACTIONS SECTION */}
                <TransactionsSection
                    transactions={filteredTransactions}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    typeFilter={typeFilter}
                    onTypeFilterChange={setTypeFilter}
                    onClearAll={handleClearAll}
                    onEditTransaction={tx => {
                        setEditingTransaction(tx);
                        setIsTransactionModalOpen(true);
                    }}
                    onDeleteTransaction={handleDeleteTransaction}
                />
            </main>

            {/* MODALS */}
            <TransactionModal
                isOpen={isTransactionModalOpen}
                onClose={() => {
                    setIsTransactionModalOpen(false);
                    setEditingTransaction(null);
                }}
                onSave={handleSaveTransaction}
                editingTransaction={editingTransaction}
            />

            <BudgetModal
                isOpen={isBudgetModalOpen}
                onClose={() => setIsBudgetModalOpen(false)}
                currentBudget={monthlyBudget}
                onSaveBudget={handleSaveBudget}
            />

            <VisualChartsModal
                isOpen={isChartsModalOpen}
                onClose={() => setIsChartsModalOpen(false)}
                transactions={transactions}
                selectedMonth={selectedMonth}
            />
        </div>
    );
}
