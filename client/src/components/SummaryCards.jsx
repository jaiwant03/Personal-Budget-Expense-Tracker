import React from "react";
import { formatCurrency } from "../utils/formatters";

export default function SummaryCards({ totalIncome, totalExpense, balance }) {
    return (
        <section className="summary-grid">
            <div className="summary-card balance-card">
                <p>Total Balance</p>
                <h2 id="balance">{formatCurrency(balance)}</h2>
                <span>Income - Expenses</span>
            </div>

            <div className="summary-card">
                <p>Total Income</p>
                <h2 className="income-text" id="income">
                    {formatCurrency(totalIncome)}
                </h2>
                <span>This month</span>
            </div>

            <div className="summary-card">
                <p>Total Expenses</p>
                <h2 className="expense-text" id="expense">
                    {formatCurrency(totalExpense)}
                </h2>
                <span>This month</span>
            </div>

            <div className="summary-card">
                <p>Total Savings</p>
                <h2 className="saving-text" id="savings">
                    {formatCurrency(balance)}
                </h2>
                <span>Your remaining amount</span>
            </div>
        </section>
    );
}
