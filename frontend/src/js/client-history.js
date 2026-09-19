const API_URL = "http://localhost:3001/api/reservations";

import { loadClientName } from './client-name.js';

document.addEventListener("DOMContentLoaded", () => {
    loadClientName();
    loadHistory();
});

async function loadHistory() {
    const historyList = document.getElementById("history-list");

    if (!historyList) {
        console.error("History list element not found.");
        return;
    }

    // Get logged-in client's account ID
    const accountId = localStorage.getItem("account_id");

    if (!accountId) {
        historyList.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center;">
                    No account information found.
                </td>
            </tr>
        `;

        console.error("No account_id found in localStorage.");
        return;
    }

    try {
        const response = await fetch(
            `${API_URL}/${encodeURIComponent(accountId)}`
        );

        if (!response.ok) {
            throw new Error("Failed to load reservation history.");
        }

        const data = await response.json();

        if (!data.success || !Array.isArray(data.reservations)) {
            throw new Error("Invalid reservation data.");
        }

        // Only show completed reservations
        const completedReservations = data.reservations.filter(
            reservation => reservation.status === "Completed"
        );

        if (completedReservations.length === 0) {
            historyList.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center;">
                        No completed reservations yet.
                    </td>
                </tr>
            `;
            return;
        }

        historyList.innerHTML = completedReservations
            .map(reservation => {
                const reservationId = reservation.reservation_id;

                const date = formatDate(
                    reservation.reservation_date
                );

                const service =
                    reservation.service || "Gym Reservation";

                const paymentStatus =
                    reservation.payment_status || "Unpaid";

                return `
                    <tr>
                        <td>
                            #${reservationId}
                        </td>

                        <td>
                            ${date}
                        </td>

                        <td>
                            ${escapeHTML(service)}
                        </td>

                        <td>
                            <span class="status completed">
                                Completed
                            </span>
                        </td>

                        <td>
                            <span class="status ${
                                paymentStatus === "Paid"
                                    ? "paid"
                                    : "pending-approval"
                            }">
                                ${escapeHTML(paymentStatus)}
                            </span>
                        </td>
                    </tr>
                `;
            })
            .join("");

    } catch (error) {
        console.error(
            "Error loading history:",
            error
        );

        historyList.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center;">
                    Unable to load reservation history.
                </td>
            </tr>
        `;
    }
}


// Format database date
function formatDate(dateValue) {
    if (!dateValue) {
        return "—";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return dateValue;
    }

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
}


// Prevent HTML injection when displaying database values
function escapeHTML(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}