// ==========================================
// CURRENCY FORMATTER
// ==========================================

export function formatCurrency(amount) {
    const numericAmount = Number(amount) || 0;

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: numericAmount % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2
    }).format(numericAmount);
}

// ==========================================
// DATE FORMATTER
// ==========================================

export function formatDate(date) {
    if (!date) return "";
    return new Date(date + "T00:00:00").toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

// ==========================================
// MONTH LABEL FORMATTER
// ==========================================

export function formatMonthLabel(yearMonth) {
    if (!yearMonth) return "Selected Month";
    const [year, month] = yearMonth.split("-");
    const dateObj = new Date(Number(year), Number(month) - 1, 1);
    return dateObj.toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric"
    });
}
