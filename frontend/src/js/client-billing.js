
// =====================================
// CLIENT BILLING & PAYMENTS
// =====================================

import { loadClientName } from './client-name.js';

const API_URL = "http://localhost:3001/api/reservations";
const PAYMENTS_API_URL = "http://localhost:3001/api/payments";

function authHeaders() {
    const token = localStorage.getItem("auth_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
}


// =====================================
// LOAD BILLING RECORDS
// =====================================

async function loadBilling() {

    const billingList =
        document.getElementById("billing-list");

    if (!billingList) {
        console.error("billing-list not found.");
        return;
    }


    // Get logged-in client's account ID
    const accountId =
        localStorage.getItem("account_id");


    if (!accountId) {

        billingList.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;">
                    Client account information not found.
                </td>
            </tr>
        `;

        console.error(
            "No account_id found in localStorage."
        );

        return;
    }


    try {

        const response = await fetch(
            `${API_URL}/${encodeURIComponent(accountId)}`
        );


        if (!response.ok) {
            throw new Error(
                `Server returned ${response.status}`
            );
        }


        const data = await response.json();


        console.log(
            "CLIENT BILLING DATA:",
            data
        );


        if (
            !data.success ||
            !Array.isArray(data.reservations)
        ) {

            throw new Error(
                "Invalid reservation data."
            );
        }


        const reservations =
            data.reservations;


        // =====================================
        // NO RECORDS
        // =====================================

        if (reservations.length === 0) {

            billingList.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align:center;">
                        No payment records found.
                    </td>
                </tr>
            `;

            return;
        }


        // =====================================
        // DISPLAY BILLING RECORDS
        // =====================================

        billingList.innerHTML =
            reservations.map(reservation => {

                const reservationId =
                    reservation.reservation_id;

                const service =
                    reservation.service ||
                    "Gym Reservation";

                const amount =
                    Number(reservation.amount || 0);

                const paymentStatus =
                    reservation.payment_status ||
                    "Unpaid";

                const paymentDate =
                    formatPaymentDate(
                        reservation.payment_date
                    );


                return `
                    <tr>

                        <td>
                            #${reservationId}
                        </td>

                        <td>
                            ${escapeHTML(service)}
                        </td>

                        <td>
                            ₱${amount.toLocaleString(
                                "en-PH",
                                {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                }
                            )}
                        </td>

                        <td>
                            <span class="status ${
                                paymentStatus === "Paid"
                                    ? "paid"
                                    : "unpaid"
                            }">
                                ${paymentStatus}
                            </span>
                        </td>

                        <td>
                            ${paymentDate}
                        </td>

                        <td>
                            ${paymentStatus === "Paid"
                                ? `<button class="table-button client-receipt-btn" type="button" data-reservation-id="${escapeHTML(reservationId)}">View Receipt</button>`
                                : "—"}
                        </td>

                    </tr>
                `;

            }).join("");

        billingList.querySelectorAll(".client-receipt-btn").forEach(button => {
            button.addEventListener("click", () => loadReceipt(button.dataset.reservationId));
        });

} catch (error) {

        console.error(
            "Client billing error:",
            error
        );


        billingList.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center;">
                    Unable to load payment records.
                </td>
            </tr>
        `;
    }
}

async function loadReceipt(reservationId) {
    try {
        const response = await fetch(
            `${PAYMENTS_API_URL}/${encodeURIComponent(reservationId)}/receipt`,
            { headers: authHeaders() }
        );
        const data = await response.json();

        if (response.status === 401) {
            throw new Error("Your login session is missing or expired. Please log in again.");
        }

        if (response.status === 403) {
            throw new Error("You are not authorized to view this receipt.");
        }

        if (!response.ok || !data.success || !data.receipt) {
            throw new Error(data.message || "Unable to load receipt.");
        }

        showReceipt(data.receipt);
    } catch (error) {
        console.error("CLIENT RECEIPT ERROR:", error);
        window.alert(error.message || "Unable to load receipt.");
    }
}

function showReceipt(receipt) {
    const name = receipt.client_name || "Client";
    document.querySelector("#client-receipt-initials").textContent =
        name.split(/\s+/).filter(Boolean).map(part => part[0]).join("").slice(0, 2).toUpperCase() || "C";
    document.querySelector("#client-receipt-client-name").textContent = name;
    document.querySelector("#client-receipt-transaction-id").textContent = `#${receipt.transaction_id}`;
    document.querySelector("#client-receipt-reservation-id").textContent = `#${receipt.reservation_id}`;
    document.querySelector("#client-receipt-rental-date").textContent = formatPaymentDate(receipt.reservation_date);
    document.querySelector("#client-receipt-rental-days").textContent = receipt.rental_days
        ? `${receipt.rental_days} day${receipt.rental_days === 1 ? "" : "s"}`
        : "—";
    document.querySelector("#client-receipt-daily-rate").textContent = formatCurrency(receipt.daily_rate);
    document.querySelector("#client-receipt-amount").textContent = formatCurrency(receipt.amount);
    document.querySelector("#client-receipt-payment-date").textContent = formatPaymentDate(receipt.payment_date);
    document.querySelector("#client-receipt-payment-method").textContent = receipt.payment_method || "—";
    document.querySelector("#client-receipt-modal").classList.add("show");
}

function formatCurrency(value) {
    if (value === undefined || value === null || value === "") return "—";
    return `₱${Number(value).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}


// =====================================
// FORMAT PAYMENT DATE
// =====================================

function formatPaymentDate(dateValue) {

    if (!dateValue) {
        return "—";
    }


    const date = new Date(dateValue);


    if (Number.isNaN(date.getTime())) {
        return "—";
    }


    return date.toLocaleDateString(
        "en-US",
        {
            month: "short",
            day: "numeric",
            year: "numeric"
        }
    );
}


// =====================================
// ESCAPE HTML
// =====================================

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// =====================================
// START
// =====================================

document.addEventListener(
    "DOMContentLoaded",
    () => {
        const receiptModal = document.querySelector("#client-receipt-modal");
        const closeReceipt = () => receiptModal?.classList.remove("show");

        document.querySelector("#client-receipt-close")?.addEventListener("click", closeReceipt);
        document.querySelector("#client-receipt-close-action")?.addEventListener("click", closeReceipt);
        receiptModal?.addEventListener("click", event => {
            if (event.target === receiptModal) closeReceipt();
        });

        loadClientName();
        loadBilling();
    }
);