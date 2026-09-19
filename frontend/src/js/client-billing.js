
// =====================================
// CLIENT BILLING & PAYMENTS
// =====================================

import { loadClientName } from './client-name.js';

const API_URL = "http://localhost:3001/api/reservations";


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
                    <td colspan="5" style="text-align:center;">
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

                    </tr>
                `;

            }).join("");


} catch (error) {

        console.error(
            "Client billing error:",
            error
        );


        billingList.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;">
                    Unable to load payment records.
                </td>
            </tr>
        `;
    }
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
        loadClientName();
        loadBilling();
    }
);