import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { formatCurrency, formatMonthLabel } from "../utils/formatters";

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

export default function VisualChartsModal({
    isOpen,
    onClose,
    transactions,
    selectedMonth
}) {
    const doughnutCanvasRef = useRef(null);
    const barCanvasRef = useRef(null);
    const lineCanvasRef = useRef(null);

    const doughnutChartRef = useRef(null);
    const barChartRef = useRef(null);
    const lineChartRef = useRef(null);

    const monthLabel = formatMonthLabel(selectedMonth);

    // Filter ONLY expenses for the selected month
    const monthlyExpenses = transactions.filter(t => {
        const isExpense = t.type === "expense";
        const matchesMonth =
            !selectedMonth ||
            (t.date && String(t.date).startsWith(selectedMonth));
        return isExpense && matchesMonth;
    });

    const categoryTotals = {};
    let totalExpense = 0;

    monthlyExpenses.forEach(t => {
        const cat = t.category ? t.category.trim() : "Other";
        const amt = Number(t.amount) || 0;
        categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;
        totalExpense += amt;
    });

    const categories = Object.keys(categoryTotals);
    const hasExpenseData = categories.length > 0 && totalExpense > 0;

    // Filter all transactions for selected month (Income vs Expense)
    const monthlyTransactions = transactions.filter(t => {
        return (
            !selectedMonth ||
            (t.date && String(t.date).startsWith(selectedMonth))
        );
    });

    let totalIncome = 0;
    let totalMonthExpense = 0;

    monthlyTransactions.forEach(t => {
        const amt = Number(t.amount) || 0;
        if (t.type === "income") totalIncome += amt;
        else if (t.type === "expense") totalMonthExpense += amt;
    });

    const hasComparisonData =
        monthlyTransactions.length > 0 &&
        (totalIncome > 0 || totalMonthExpense > 0);
    const netBalance = totalIncome - totalMonthExpense;

    // Filter all expenses across all dates for Monthly Spending Trend
    const allExpenses = transactions.filter(
        t => t.type === "expense" && t.date
    );

    const monthlySpending = {};
    allExpenses.forEach(t => {
        const monthKey = String(t.date).slice(0, 7);
        if (/^\d{4}-\d{2}$/.test(monthKey)) {
            const amt = Number(t.amount) || 0;
            monthlySpending[monthKey] = (monthlySpending[monthKey] || 0) + amt;
        }
    });

    const sortedMonthKeys = Object.keys(monthlySpending).sort();
    const hasTrendData = sortedMonthKeys.length > 0;

    useEffect(() => {
        if (!isOpen) return;

        // Clean up any existing instances
        if (doughnutChartRef.current) {
            doughnutChartRef.current.destroy();
            doughnutChartRef.current = null;
        }
        if (barChartRef.current) {
            barChartRef.current.destroy();
            barChartRef.current = null;
        }
        if (lineChartRef.current) {
            lineChartRef.current.destroy();
            lineChartRef.current = null;
        }

        // 1. Doughnut Chart (Expense Breakdown)
        if (hasExpenseData && doughnutCanvasRef.current) {
            const amounts = categories.map(cat => categoryTotals[cat]);
            const bgColors = categories.map((cat, i) =>
                getCategoryColor(cat, i)
            );

            const ctx = doughnutCanvasRef.current.getContext("2d");
            doughnutChartRef.current = new Chart(ctx, {
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
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    const val = context.raw || 0;
                                    const pct =
                                        totalExpense > 0
                                            ? (
                                                  (val / totalExpense) *
                                                  100
                                              ).toFixed(1)
                                            : 0;
                                    return ` ${context.label}: ${formatCurrency(val)} (${pct}%)`;
                                }
                            }
                        }
                    }
                }
            });
        }

        // 2. Bar Chart (Income vs Expense)
        if (hasComparisonData && barCanvasRef.current) {
            const ctx = barCanvasRef.current.getContext("2d");
            barChartRef.current = new Chart(ctx, {
                type: "bar",
                data: {
                    labels: ["Income", "Expense"],
                    datasets: [
                        {
                            data: [totalIncome, totalMonthExpense],
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
                        legend: { display: false },
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
                            grid: { display: false },
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

        // 3. Line Chart (Monthly Spending Trend)
        if (hasTrendData && lineCanvasRef.current) {
            const labels = sortedMonthKeys.map(key => formatMonthLabel(key));
            const values = sortedMonthKeys.map(key => monthlySpending[key]);

            const ctx = lineCanvasRef.current.getContext("2d");
            lineChartRef.current = new Chart(ctx, {
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
                        legend: { display: false },
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
                            grid: { display: false },
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

        return () => {
            if (doughnutChartRef.current) {
                doughnutChartRef.current.destroy();
                doughnutChartRef.current = null;
            }
            if (barChartRef.current) {
                barChartRef.current.destroy();
                barChartRef.current = null;
            }
            if (lineChartRef.current) {
                lineChartRef.current.destroy();
                lineChartRef.current = null;
            }
        };
    }, [
        isOpen,
        hasExpenseData,
        hasComparisonData,
        hasTrendData,
        transactions,
        selectedMonth
    ]);

    if (!isOpen) return null;

    const handleBackdropClick = e => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className={`modal ${isOpen ? "show" : ""}`}
            id="chartsModal"
            onClick={handleBackdropClick}
        >
            <div className="modal-content charts-modal-content">
                <div className="modal-header">
                    <div className="charts-title-group">
                        <h2 id="chartsModalTitle">Visual Charts</h2>
                        <p id="chartsMonthSubtitle">
                            Financial analytics for {monthLabel}
                        </p>
                    </div>
                    <button
                        className="close-btn"
                        id="closeChartsModal"
                        onClick={onClose}
                    >
                        &times;
                    </button>
                </div>

                <div className="charts-grid">
                    {/* CHART 1: EXPENSE BREAKDOWN */}
                    <div className="chart-card">
                        <div className="chart-card-header">
                            <h3>Expense Breakdown</h3>
                            <span
                                className="chart-card-badge"
                                id="expenseMonthBadge"
                            >
                                {monthLabel}
                            </span>
                        </div>

                        <div className="chart-canvas-wrap">
                            <canvas
                                ref={doughnutCanvasRef}
                                id="expenseBreakdownChart"
                                style={{
                                    display: hasExpenseData ? "block" : "none"
                                }}
                            ></canvas>
                        </div>

                        <div
                            id="expenseBreakdownEmpty"
                            className="chart-empty-state"
                            style={{
                                display: hasExpenseData ? "none" : "block"
                            }}
                        >
                            <p>No expense data available for this month.</p>
                        </div>

                        <div
                            id="expenseBreakdownDetails"
                            className="chart-details"
                            style={{
                                display: hasExpenseData ? "block" : "none"
                            }}
                        >
                            <div
                                id="expenseCategoryList"
                                className="category-breakdown-list"
                            >
                                {categories.map((cat, i) => {
                                    const amt = categoryTotals[cat];
                                    const pct =
                                        totalExpense > 0
                                            ? (
                                                  (amt / totalExpense) *
                                                  100
                                              ).toFixed(0)
                                            : 0;
                                    const color = getCategoryColor(cat, i);

                                    return (
                                        <div
                                            key={cat}
                                            className="category-breakdown-item"
                                        >
                                            <span
                                                className="category-dot"
                                                style={{
                                                    backgroundColor: color
                                                }}
                                            ></span>
                                            <span>
                                                {cat}:{" "}
                                                <strong>
                                                    {formatCurrency(amt)}
                                                </strong>{" "}
                                                ({pct}%)
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="chart-total-row">
                                <span>Total Expenses:</span>
                                <strong id="expenseBreakdownTotal">
                                    {formatCurrency(totalExpense)}
                                </strong>
                            </div>
                        </div>
                    </div>

                    {/* CHART 2: INCOME VS EXPENSE */}
                    <div className="chart-card">
                        <div className="chart-card-header">
                            <h3>Income vs Expense</h3>
                            <span
                                className="chart-card-badge"
                                id="incomeExpenseMonthBadge"
                            >
                                {monthLabel}
                            </span>
                        </div>

                        <div className="chart-canvas-wrap">
                            <canvas
                                ref={barCanvasRef}
                                id="incomeVsExpenseChart"
                                style={{
                                    display: hasComparisonData ? "block" : "none"
                                }}
                            ></canvas>
                        </div>

                        <div
                            id="incomeVsExpenseEmpty"
                            className="chart-empty-state"
                            style={{
                                display: hasComparisonData ? "none" : "block"
                            }}
                        >
                            <p>No transaction data available for this month.</p>
                        </div>

                        <div
                            id="incomeVsExpenseDetails"
                            className="chart-details"
                            style={{
                                display: hasComparisonData ? "block" : "none"
                            }}
                        >
                            <div className="comparison-summary">
                                <div className="comparison-pill comparison-income">
                                    <span>Income</span>
                                    <strong id="chartIncomeTotal">
                                        {formatCurrency(totalIncome)}
                                    </strong>
                                </div>
                                <div className="comparison-pill comparison-expense">
                                    <span>Expense</span>
                                    <strong id="chartExpenseTotal">
                                        {formatCurrency(totalMonthExpense)}
                                    </strong>
                                </div>
                                <div className="comparison-pill comparison-net">
                                    <span>Net Balance</span>
                                    <strong
                                        id="chartNetTotal"
                                        style={{
                                            color:
                                                netBalance >= 0
                                                    ? "#059669"
                                                    : "#dc2626"
                                        }}
                                    >
                                        {formatCurrency(netBalance)}
                                    </strong>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CHART 3: MONTHLY SPENDING TREND */}
                    <div className="chart-card chart-trend-card">
                        <div className="chart-card-header">
                            <div>
                                <h3>Monthly Spending Trend</h3>
                                <p className="chart-card-subtext">
                                    Historical expense totals over time
                                </p>
                            </div>
                            <span className="chart-card-badge">All Months</span>
                        </div>

                        <div className="chart-canvas-wrap trend-canvas-wrap">
                            <canvas
                                ref={lineCanvasRef}
                                id="monthlySpendingTrendChart"
                                style={{
                                    display: hasTrendData ? "block" : "none"
                                }}
                            ></canvas>
                        </div>

                        <div
                            id="monthlySpendingTrendEmpty"
                            className="chart-empty-state"
                            style={{
                                display: hasTrendData ? "none" : "block"
                            }}
                        >
                            <p>
                                Insufficient data to display spending trend. Add
                                expenses across months to visualize.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
