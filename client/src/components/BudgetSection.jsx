import React from "react";
import { formatCurrency } from "../utils/formatters";

export default function BudgetSection({
    monthlyBudget,
    totalExpense,
    onOpenBudgetModal
}) {
    let budgetDisplay = 0;
    let spentDisplay = totalExpense;
    let remainingDisplay = 0;
    let progressWidth = "0%";
    let progressBg = "#00b865";
    let usedText = "0.0% of budget used";
    let remainingText = "";
    let remainingStyle = {};
    let budgetRemainingColor = "";

    if (!monthlyBudget || monthlyBudget <= 0) {
        budgetDisplay = 0;
        spentDisplay = totalExpense;
        remainingDisplay = 0;
        progressWidth = "0%";
        progressBg = "#00b865";
        usedText = "0.0% of budget used";
        remainingText = "";
    } else {
        const remaining = monthlyBudget - totalExpense;
        const percentage = (totalExpense / monthlyBudget) * 100;

        budgetDisplay = monthlyBudget;
        spentDisplay = totalExpense;
        remainingDisplay = remaining;
        progressWidth = Math.min(percentage, 100) + "%";
        usedText = `${percentage.toFixed(1)}% of budget used`;

        if (totalExpense > monthlyBudget) {
            const exceededAmount = totalExpense - monthlyBudget;
            remainingText = `Budget exceeded by ${formatCurrency(exceededAmount)}`;
            remainingStyle = { color: "#dc2626", fontWeight: "600" };
            progressBg = "#dc2626";
            budgetRemainingColor = "#dc2626";
        } else if (totalExpense === monthlyBudget) {
            remainingText = "Budget fully used";
            remainingStyle = { color: "#4b5563", fontWeight: "500" };
            progressBg = "#dc2626";
        } else {
            const remainingPercent =
                ((monthlyBudget - totalExpense) / monthlyBudget) * 100;
            remainingText = `${remainingPercent.toFixed(1)}% remaining`;
            remainingStyle = { color: "#4b5563", fontWeight: "500" };
            progressBg = percentage >= 75 ? "#f59e0b" : "#00b865";
        }
    }

    return (
        <section className="budget-section">
            <div className="section-heading">
                <div>
                    <h2>Monthly Budget</h2>
                    <p>Monitor your monthly spending limit.</p>
                </div>

                <button id="setBudgetBtn" onClick={onOpenBudgetModal}>
                    Set Budget
                </button>
            </div>

            <div className="budget-info">
                <div>
                    <p>Budget</p>
                    <h3 id="budgetAmount">{formatCurrency(budgetDisplay)}</h3>
                </div>

                <div>
                    <p>Spent</p>
                    <h3 id="budgetSpent">{formatCurrency(spentDisplay)}</h3>
                </div>

                <div>
                    <p>Remaining</p>
                    <h3
                        id="budgetRemaining"
                        style={
                            budgetRemainingColor
                                ? { color: budgetRemainingColor }
                                : {}
                        }
                    >
                        {formatCurrency(remainingDisplay)}
                    </h3>
                </div>
            </div>

            <div className="progress-container">
                <div
                    id="budgetProgress"
                    className="progress-bar"
                    style={{
                        width: progressWidth,
                        background: progressBg
                    }}
                ></div>
            </div>

            <p id="budgetPercentage" className="budget-percentage">
                <span id="budgetUsedText">{usedText}</span>
                <span id="budgetRemainingText" style={remainingStyle}>
                    {remainingText}
                </span>
            </p>
        </section>
    );
}
