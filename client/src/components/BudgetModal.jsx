import React, { useState, useEffect } from "react";

export default function BudgetModal({
    isOpen,
    onClose,
    currentBudget,
    onSaveBudget
}) {
    const [budgetAmount, setBudgetAmount] = useState("");

    useEffect(() => {
        if (isOpen) {
            setBudgetAmount(currentBudget > 0 ? String(currentBudget) : "");
        }
    }, [isOpen, currentBudget]);

    if (!isOpen) return null;

    const handleSubmit = e => {
        e.preventDefault();
        const numericAmount = Number(budgetAmount);

        if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
            alert("Budget amount must be greater than zero.");
            return;
        }

        onSaveBudget(numericAmount);
    };

    const handleBackdropClick = e => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className={`modal ${isOpen ? "show" : ""}`}
            id="budgetModal"
            onClick={handleBackdropClick}
        >
            <div className="modal-content small-modal">
                <div className="modal-header">
                    <h2>Set Monthly Budget</h2>
                    <button
                        className="close-btn"
                        id="closeBudgetModal"
                        onClick={onClose}
                    >
                        &times;
                    </button>
                </div>

                <form id="budgetForm" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="budgetInput">
                            Monthly Budget Amount
                        </label>
                        <input
                            type="number"
                            id="budgetInput"
                            min="1"
                            placeholder="Example: 20000"
                            required
                            value={budgetAmount}
                            onChange={e => setBudgetAmount(e.target.value)}
                        />
                    </div>

                    <button type="submit" className="save-btn">
                        Save Budget
                    </button>
                </form>
            </div>
        </div>
    );
}
