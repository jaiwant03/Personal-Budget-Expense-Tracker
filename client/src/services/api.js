const BASE_URL = "/api";

async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
        headers: {
            "Content-Type": "application/json"
        },
        ...options
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || "Something went wrong.");
    }

    return data;
}

export async function getTransactions() {
    return apiRequest(`${BASE_URL}/transactions`);
}

export async function addTransaction(transactionData) {
    return apiRequest(`${BASE_URL}/transactions`, {
        method: "POST",
        body: JSON.stringify(transactionData)
    });
}

export async function updateTransaction(id, transactionData) {
    return apiRequest(`${BASE_URL}/transactions/${id}`, {
        method: "PUT",
        body: JSON.stringify(transactionData)
    });
}

export async function deleteTransaction(id) {
    return apiRequest(`${BASE_URL}/transactions/${id}`, {
        method: "DELETE"
    });
}

export async function clearAllTransactions() {
    return apiRequest(`${BASE_URL}/transactions`, {
        method: "DELETE"
    });
}

export async function getBudget() {
    return apiRequest(`${BASE_URL}/budget`);
}

export async function saveBudget(amount) {
    return apiRequest(`${BASE_URL}/budget`, {
        method: "POST",
        body: JSON.stringify({ amount })
    });
}
