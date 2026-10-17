import React from "react";

export default function Navbar({ onOpenCharts, onOpenAddTransaction }) {
    return (
        <nav className="navbar">
            <div>
                <h2>BudgetFlow</h2>
                <p>Personal Finance Tracker</p>
            </div>

            <div className="nav-actions">
                <button
                    id="visualChartsBtn"
                    className="charts-nav-btn"
                    onClick={onOpenCharts}
                >
                    Visual Charts
                </button>
                <button
                    id="addTransactionBtn"
                    onClick={onOpenAddTransaction}
                >
                    + Add Transaction
                </button>
            </div>
        </nav>
    );
}
