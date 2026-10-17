import React from "react";
import { formatCurrency, formatDate } from "../utils/formatters";

export default function TransactionsSection({
    transactions,
    searchTerm,
    onSearchChange,
    typeFilter,
    onTypeFilterChange,
    onClearAll,
    onEditTransaction,
    onDeleteTransaction
}) {
    return (
        <section className="transactions-section">
            <div className="section-heading">
                <div>
                    <h2>Transactions</h2>
                    <p>Manage your income and expenses.</p>
                </div>
            </div>

            {/* SEARCH AND FILTER */}
            <div className="controls">
                <input
                    type="text"
                    id="searchInput"
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={e => onSearchChange(e.target.value)}
                />

                <select
                    id="typeFilter"
                    aria-label="Filter transactions by type"
                    value={typeFilter}
                    onChange={e => onTypeFilterChange(e.target.value)}
                >
                    <option value="all">All Transactions</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                </select>

                <button
                    id="clearAllBtn"
                    className="clear-btn"
                    onClick={onClearAll}
                >
                    Clear All
                </button>
            </div>

            {/* TRANSACTION TABLE */}
            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Category</th>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Amount</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody id="transactionList">
                        {transactions.map(transaction => {
                            const isIncome = transaction.type === "income";
                            const amountSign = isIncome ? "+" : "-";

                            return (
                                <tr key={transaction.id}>
                                    <td>
                                        <strong>{transaction.description}</strong>
                                    </td>
                                    <td>{transaction.category}</td>
                                    <td>{formatDate(transaction.date)}</td>
                                    <td>
                                        <span
                                            className={
                                                isIncome
                                                    ? "type-income"
                                                    : "type-expense"
                                            }
                                        >
                                            {isIncome ? "Income" : "Expense"}
                                        </span>
                                    </td>
                                    <td
                                        className={
                                            isIncome
                                                ? "amount-income"
                                                : "amount-expense"
                                        }
                                    >
                                        {amountSign}
                                        {formatCurrency(transaction.amount)}
                                    </td>
                                    <td>
                                        <button
                                            className="action-btn edit-btn"
                                            title="Edit transaction"
                                            onClick={() =>
                                                onEditTransaction(transaction)
                                            }
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="action-btn delete-btn"
                                            title="Delete transaction"
                                            onClick={() =>
                                                onDeleteTransaction(
                                                    transaction.id
                                                )
                                            }
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                <div
                    id="emptyState"
                    className="empty-state"
                    style={{
                        display: transactions.length === 0 ? "block" : "none"
                    }}
                >
                    <h3>No transactions yet</h3>
                    <p>Click "Add Transaction" to add your first record.</p>
                </div>
            </div>
        </section>
    );
}
