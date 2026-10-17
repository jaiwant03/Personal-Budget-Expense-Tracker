import React, { useState, useEffect } from "react";

export default function TransactionModal({
    isOpen,
    onClose,
    onSave,
    editingTransaction
}) {
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [type, setType] = useState("");
    const [category, setCategory] = useState("");
    const [date, setDate] = useState("");

    const getTodayString = () => new Date().toISOString().split("T")[0];

    useEffect(() => {
        if (editingTransaction) {
            setDescription(editingTransaction.description || "");
            setAmount(editingTransaction.amount || "");
            setType(editingTransaction.type || "");
            setCategory(editingTransaction.category || "");
            setDate(editingTransaction.date || getTodayString());
        } else {
            setDescription("");
            setAmount("");
            setType("");
            setCategory("");
            setDate(getTodayString());
        }
    }, [editingTransaction, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = e => {
        e.preventDefault();

        const trimmedDescription = description.trim();
        const numericAmount = Number(amount);

        if (!trimmedDescription) {
            alert("Please enter a description.");
            return;
        }

        if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
            alert("Amount must be greater than zero.");
            return;
        }

        if (!type) {
            alert("Please select transaction type.");
            return;
        }

        if (!category) {
            alert("Please select a category.");
            return;
        }

        if (!date) {
            alert("Please select a date.");
            return;
        }

        onSave({
            description: trimmedDescription,
            amount: numericAmount,
            type,
            category,
            date
        });
    };

    const handleBackdropClick = e => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className={`modal ${isOpen ? "show" : ""}`}
            id="transactionModal"
            onClick={handleBackdropClick}
        >
            <div className="modal-content">
                <div className="modal-header">
                    <h2 id="modalTitle">
                        {editingTransaction
                            ? "Edit Transaction"
                            : "Add Transaction"}
                    </h2>
                    <button
                        className="close-btn"
                        id="closeModal"
                        onClick={onClose}
                    >
                        &times;
                    </button>
                </div>

                <form id="transactionForm" onSubmit={handleSubmit}>
                    <input
                        type="hidden"
                        id="editId"
                        value={editingTransaction ? editingTransaction.id : ""}
                    />

                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <input
                            type="text"
                            id="description"
                            placeholder="Example: Grocery shopping"
                            required
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="amount">Amount</label>
                        <input
                            type="number"
                            id="amount"
                            min="1"
                            step="0.01"
                            placeholder="Enter amount"
                            required
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="transactionType">Type</label>
                        <select
                            id="transactionType"
                            required
                            value={type}
                            onChange={e => setType(e.target.value)}
                        >
                            <option value="">Select type</option>
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="category">Category</label>
                        <select
                            id="category"
                            required
                            value={category}
                            onChange={e => setCategory(e.target.value)}
                        >
                            <option value="">Select category</option>
                            <option value="Salary">Salary</option>
                            <option value="Food">Food</option>
                            <option value="Travel">Travel</option>
                            <option value="Shopping">Shopping</option>
                            <option value="Education">Education</option>
                            <option value="Bills">Bills</option>
                            <option value="Entertainment">Entertainment</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="transactionDate">Date</label>
                        <input
                            type="date"
                            id="transactionDate"
                            required
                            value={date}
                            onChange={e => setDate(e.target.value)}
                        />
                    </div>

                    <button type="submit" className="save-btn">
                        Save Transaction
                    </button>
                </form>
            </div>
        </div>
    );
}
