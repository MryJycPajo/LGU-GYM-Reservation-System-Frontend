// =========================================
// CLIENT RESERVATIONS
// =========================================

import { loadClientName } from './client-name.js';

const accountId = localStorage.getItem('account_id');

let loggedInClient = {};

try {
    loggedInClient = JSON.parse(
        localStorage.getItem('client') || '{}'
    );
} catch (error) {
    console.error('CLIENT SESSION DATA ERROR:', error);
}

loadClientName();

// =========================================
// CHECK LOGIN SESSION
// =========================================

if (!accountId) {

    alert(
        'Your account session was not found. Please login again.'
    );

    window.location.href = '../login.html';

}

// =========================================
// LOAD CLIENT RESERVATIONS
// =========================================

async function loadClientReservations() {

    const reservationsTable =
        document.querySelector('#client-reservations');

    if (!reservationsTable) {
        return;
    }

    try {

        const response = await fetch(
            `http://localhost:3001/api/reservations/${accountId}`
        );

        const data = await response.json();

        console.log(
            'CLIENT RESERVATIONS RESPONSE:',
            data
        );

        if (!data.success) {

            reservationsTable.innerHTML = `
                <tr>
                    <td colspan="10">
                        Unable to load your reservations.
                    </td>
                </tr>
            `;

            return;
        }

        const reservations = data.reservations;

        // =========================================
        // NO RESERVATIONS
        // =========================================

        if (reservations.length === 0) {

            reservationsTable.innerHTML = `
                <tr>
                    <td colspan="10">
                        You have no reservations yet.
                    </td>
                </tr>
            `;

            return;
        }

        // =========================================
        // DISPLAY RESERVATIONS
        // =========================================

        reservationsTable.innerHTML = '';

        reservations.forEach(reservation => {

            const row = document.createElement('tr');

            row.innerHTML = `
                <td>
                    #${reservation.reservation_id}
                </td>

                <td>
                    ${escapeHtml(reservation.service || '—')}
                </td>

                <td>
                    ${escapeHtml(reservation.purpose || '—')}
                </td>

                <td>
                    ${formatDate(reservation.reservation_date)}
                </td>

                <td>
                    ${formatTime(reservation.reservation_time)}
                </td>

                <td>
                    ${formatTime(reservation.end_time)}
                </td>

                <td>
                    ${escapeHtml(reservation.participants ?? '—')}
                </td>

                <td>
                    <span class="status ${getStatusClass(reservation.status)}">
                        ${escapeHtml(reservation.status || '—')}
                    </span>
                </td>

                <td>
                    <span class="status ${getPaymentStatusClass(reservation.payment_status)}">
                        ${escapeHtml(reservation.payment_status || '—')}
                    </span>
                </td>

                <td>
                    <button
                        class="table-button view-reservation-btn"
                        type="button"
                        data-id="${reservation.reservation_id}"
                    >
                        View
                    </button>
                </td>
            `;

            reservationsTable.appendChild(row);

        });

        // =========================================
        // VIEW BUTTONS
        // =========================================

        const viewButtons =
            document.querySelectorAll(
                '.view-reservation-btn'
            );

        viewButtons.forEach(button => {

            button.addEventListener('click', () => {

                const reservationId =
                    button.dataset.id;

                const reservation =
                    reservations.find(
                        item =>
                            String(item.reservation_id) ===
                            String(reservationId)
                    );

                if (reservation) {

                    showReservationDetails(
                        reservation
                    );

                }

            });

        });

    } catch (error) {

        console.error(
            'CLIENT RESERVATIONS ERROR:',
            error
        );

        reservationsTable.innerHTML = `
            <tr>
                <td colspan="10">
                    Cannot connect to the server.
                </td>
            </tr>
        `;

    }

}

// =========================================
// FORMAT DATE
// =========================================

function formatDate(dateValue) {

    if (!dateValue) {
        return '-';
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return dateValue;
    }

    return date.toLocaleDateString(
        'en-US',
        {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }
    );

}

// =========================================
// FORMAT TIME
// =========================================

function formatTime(timeValue) {

    if (!timeValue) {
        return '-';
    }

    const parts = timeValue.split(':');

    if (parts.length < 2) {
        return timeValue;
    }

    let hours =
        parseInt(parts[0], 10);

    const minutes =
        parts[1];

    const period =
        hours >= 12 ? 'PM' : 'AM';

    hours =
        hours % 12 || 12;

    return `${hours}:${minutes} ${period}`;

}

// =========================================
// STATUS CLASS
// =========================================

function getStatusClass(status) {

    switch (status) {

        case 'Approved':
            return 'approved';

        case 'Pending':
            return 'pending-approval';

        case 'Declined':
            return 'declined';

        case 'Completed':
            return 'approved';

        default:
            return '';

    }

}

// =========================================
// PAYMENT STATUS CLASS
// =========================================

function getPaymentStatusClass(status) {

    switch (status) {

        case 'Paid':
            return 'paid';

        case 'Unpaid':
            return 'unpaid';

        default:
            return '';

    }

}

// =========================================
// VIEW RESERVATION DETAILS
// =========================================

function showReservationDetails(reservation) {

    const details =
        reservation.reservation_details
        || reservation.details
        || '—';

    const clientName = [
        reservation.firstname || loggedInClient.firstname,
        reservation.lastname || loggedInClient.lastname
    ]
        .filter(Boolean)
        .join(' ') || reservation.client_name || '—';

    const modalValues = {
        '#modal-reservation-id': reservation.reservation_id || '—',
        '#modal-client-name': clientName,
        '#modal-account-id': reservation.account_id || accountId || '—',
        '#modal-service': reservation.service || '—',
        '#modal-purpose': reservation.purpose || '—',
        '#modal-date': formatDate(reservation.reservation_date),
        '#modal-start-time': formatTime(reservation.reservation_time),
        '#modal-end-time': formatTime(reservation.end_time),
        '#modal-participants': reservation.participants ?? '—',
        '#modal-details': details,
        '#modal-status': reservation.status || '—',
        '#modal-payment-status': reservation.payment_status || '—'
    };

    Object.entries(modalValues).forEach(([selector, value]) => {
        const element = document.querySelector(selector);

        if (element) {
            element.textContent = value;
        }
    });

    const overlay = document.querySelector('#message-overlay');
    const messageTitle = document.querySelector('#message-title');
    const okButton = document.querySelector('#message-ok-btn');

    if (overlay && messageTitle) {
        messageTitle.textContent = 'Reservation Details';
        overlay.classList.add('show');

        if (okButton) {
            okButton.onclick = () => {
                overlay.classList.remove('show');
            };
        }
    }

}

// =========================================
// CUSTOM CENTER MESSAGE
// =========================================

function showMessage(
    title,
    message,
    icon = '✓'
) {

    const overlay =
        document.querySelector(
            '#message-overlay'
        );

    const messageTitle =
        document.querySelector(
            '#message-title'
        );

    const messageText =
        document.querySelector(
            '#message-text'
        );

    const messageIcon =
        document.querySelector(
            '#message-icon'
        );

    const okButton =
        document.querySelector(
            '#message-ok-btn'
        );

    if (!overlay) {

        alert(message);

        return;

    }

    messageTitle.textContent =
        title;

    messageText.textContent =
        message;

    messageIcon.textContent =
        icon;

    overlay.classList.add('show');

    okButton.onclick = () => {

        overlay.classList.remove('show');

    };

}

// =========================================
// ESCAPE HTML
// =========================================

function escapeHtml(value) {

    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

}

// =========================================
// LOAD RESERVATIONS
// =========================================

if (accountId) {

    loadClientReservations();

}