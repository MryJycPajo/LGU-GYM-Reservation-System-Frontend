// =====================================
// ADMIN RESERVATIONS
// =====================================

const API_URL = 'http://localhost:3001/api/reservations';

let allReservations = [];
let currentFilter = 'All';

// =====================================
// LOAD RESERVATIONS
// =====================================

async function loadReservations() {
    const tableBody = document.querySelector('#admin-reservations-list');

    if (!tableBody) {
        console.error('admin-reservations-list not found.');
        return;
    }

    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        console.log('ADMIN RESERVATIONS RESPONSE:', data);

        if (!data.success) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8">
                        Unable to load reservations.
                    </td>
                </tr>
            `;
            return;
        }

        allReservations = data.reservations || [];

        displayReservations();

    } catch (error) {
        console.error('ADMIN RESERVATIONS ERROR:', error);

        tableBody.innerHTML = `
            <tr>
                <td colspan="8">
                    Cannot connect to the server.
                </td>
            </tr>
        `;
    }
}

// =====================================
// DISPLAY RESERVATIONS
// =====================================

function displayReservations() {
    const tableBody = document.querySelector('#admin-reservations-list');
    const searchInput = document.querySelector('#admin-reservation-search');

    if (!tableBody) return;

    const searchValue = searchInput
        ? searchInput.value.toLowerCase().trim()
        : '';

    const filteredReservations = allReservations.filter(reservation => {

        // STATUS FILTER
        if (
            currentFilter !== 'All' &&
            reservation.status !== currentFilter
        ) {
            return false;
        }

        // SEARCH FILTER
        if (searchValue !== '') {

            const reservationId = String(
                reservation.reservation_id
            ).toLowerCase();

            const clientName = String(
                reservation.client_name || ''
            ).toLowerCase();

            return (
                reservationId.includes(searchValue) ||
                clientName.includes(searchValue)
            );
        }

        return true;
    });

    // NO RESULTS
    if (filteredReservations.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="8">
                    No reservations found.
                </td>
            </tr>
        `;

        return;
    }

    // DISPLAY ROWS
    tableBody.innerHTML = filteredReservations.map(reservation => {

        return `
            <tr>

                <td>
                    #${reservation.reservation_id}
                </td>

                <td>
                    ${escapeHtml(
                        reservation.client_name || '-'
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        reservation.service || '-'
                    )}
                </td>

                <td>
                    ${formatDate(
                        reservation.reservation_date
                    )}
                </td>

                <td>
                    ${formatTime(
                        reservation.reservation_time
                    )}
                </td>

                <td>
                    <span class="status ${getStatusClass(
                        reservation.status
                    )}">
                        ${escapeHtml(
                            reservation.status || '-'
                        )}
                    </span>
                </td>

                <td>
                    <span class="status ${getPaymentClass(
                        reservation.payment_status
                    )}">
                        ${escapeHtml(
                            reservation.payment_status || '-'
                        )}
                    </span>
                </td>

                <td>

                    <!-- VIEW -->
                    <button
                        class="table-button view-reservation-btn"
                        type="button"
                        data-id="${reservation.reservation_id}"
                    >
                        View
                    </button>

                    <!-- APPROVE / DECLINE -->
                    ${
                        reservation.status === 'Pending'
                        ? `
                            <button
                                class="table-button approve-btn"
                                type="button"
                                data-id="${reservation.reservation_id}"
                            >
                                Approve
                            </button>

                            <button
                                class="table-button decline-btn"
                                type="button"
                                data-id="${reservation.reservation_id}"
                            >
                                Decline
                            </button>
                        `
                        : ''
                    }

                    <!-- MARK PAID -->
                    ${
                        reservation.status === 'Approved' &&
                        reservation.payment_status === 'Unpaid'
                        ? `
                            <button
                                class="table-button paid-btn"
                                type="button"
                                data-id="${reservation.reservation_id}"
                            >
                                Mark Paid
                            </button>
                        `
                        : ''
                    }

                    <!-- COMPLETE -->
                    ${
                        reservation.status === 'Approved' &&
                        reservation.payment_status === 'Paid'
                        ? `
                            <button
                                class="table-button complete-btn"
                                type="button"
                                data-id="${reservation.reservation_id}"
                            >
                                Complete
                            </button>
                        `
                        : ''
                    }

                </td>

            </tr>
        `;

    }).join('');

    setupActionButtons();
}

// =====================================
// ACTION BUTTONS
// =====================================

function setupActionButtons() {

    // =================================
    // VIEW
    // =================================

    document
        .querySelectorAll('.view-reservation-btn')
        .forEach(button => {

            button.addEventListener('click', () => {

                const id = button.dataset.id;

                const reservation = allReservations.find(
                    item =>
                        String(item.reservation_id) === String(id)
                );

                if (reservation) {
                    showReservationDetails(reservation);
                }

            });

        });


    // =================================
    // APPROVE
    // =================================

    document
        .querySelectorAll('.approve-btn')
        .forEach(button => {

            button.addEventListener('click', async () => {

                const id = button.dataset.id;

                const reservation = allReservations.find(
                    item =>
                        String(item.reservation_id) === String(id)
                );

                if (!reservation) return;

                await updateReservationStatus(
                    id,
                    'Approved'
                );

            });

        });


    // =================================
    // DECLINE
    // =================================

    document
        .querySelectorAll('.decline-btn')
        .forEach(button => {

            button.addEventListener('click', async () => {

                const id = button.dataset.id;

                const reservation = allReservations.find(
                    item =>
                        String(item.reservation_id) === String(id)
                );

                if (!reservation) return;

                await updateReservationStatus(
                    id,
                    'Declined'
                );

            });

        });


    // =================================
    // MARK PAID
    // =================================

    document
        .querySelectorAll('.paid-btn')
        .forEach(button => {

            button.addEventListener('click', async () => {

                const id = button.dataset.id;

                await updatePaymentStatus(
                    id,
                    'Paid'
                );

            });

        });


    // =================================
    // COMPLETE
    // =================================

    document
        .querySelectorAll('.complete-btn')
        .forEach(button => {

            button.addEventListener('click', async () => {

                const id = button.dataset.id;

                await updateReservationStatus(
                    id,
                    'Completed'
                );

            });

        });

}

// =====================================
// UPDATE RESERVATION STATUS
// =====================================

async function updateReservationStatus(id, status) {

    try {

        const response = await fetch(
            `${API_URL}/${id}/status`,
            {
                method: 'PUT',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify({
                    status: status
                })
            }
        );

        const data = await response.json();

        console.log('STATUS UPDATE RESPONSE:', data);

        if (!data.success) {

            showMessage(
                'Update Failed',
                data.message || 'Unable to update reservation.',
                '!'
            );

            return;
        }

        // =================================
        // SUCCESS MESSAGE
        // =================================

        let successMessage = '';

        if (status === 'Approved') {

            successMessage =
                `Reservation #${id} has been approved successfully.`;

        } else if (status === 'Declined') {

            successMessage =
                `Reservation #${id} has been declined.`;

        } else if (status === 'Completed') {

            successMessage =
                `Reservation #${id} has been marked as completed.`;

        } else {

            successMessage =
                `Reservation #${id} has been updated successfully.`;
        }

        // SHOW CENTER MESSAGE
        showMessage(
            `Reservation ${status}`,
            successMessage,
            '✓'
        );

        // Reload table
        await loadReservations();

    } catch (error) {

        console.error(
            'Update reservation status error:',
            error
        );

        showMessage(
            'Server Error',
            'Cannot connect to the server.',
            '!'
        );

    }

}

// =====================================
// UPDATE PAYMENT STATUS
// =====================================

async function updatePaymentStatus(id, paymentStatus) {

    try {

        const response = await fetch(
            `${API_URL}/${id}/payment`,
            {
                method: 'PUT',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify({
                    payment_status: paymentStatus
                })
            }
        );

        const data = await response.json();

        console.log('PAYMENT UPDATE RESPONSE:', data);

        if (!data.success) {

            showMessage(
                'Payment Update Failed',
                data.message || 'Unable to update payment status.',
                '!'
            );

            return;
        }

        // =================================
        // PAYMENT SUCCESS MESSAGE
        // =================================

        showMessage(
            'Payment Updated',
            `Reservation #${id} has been marked as ${paymentStatus}.`,
            '✓'
        );

        await loadReservations();

    } catch (error) {

        console.error(
            'Update payment status error:',
            error
        );

        showMessage(
            'Server Error',
            'Cannot connect to the server.',
            '!'
        );

    }

}

// =====================================
// FILTER BUTTONS
// =====================================

function setupFilters() {

    const filterButtons =
        document.querySelectorAll('.filter-chip');

    filterButtons.forEach(button => {

        button.addEventListener('click', () => {

            filterButtons.forEach(btn =>
                btn.classList.remove('active')
            );

            button.classList.add('active');

            currentFilter =
                button.textContent.trim();

            displayReservations();

        });

    });

}

// =====================================
// SEARCH
// =====================================

function setupSearch() {

    const searchInput =
        document.querySelector(
            '#admin-reservation-search'
        );

    if (!searchInput) return;

    searchInput.addEventListener(
        'input',
        () => {
            displayReservations();
        }
    );

}

// =====================================
// VIEW RESERVATION DETAILS - MODAL
// =====================================

function showReservationDetails(reservation) {

    const modal =
        document.querySelector('#reservation-modal');

    if (!modal) {

        console.error(
            'Reservation modal not found.'
        );

        return;
    }

    document.querySelector(
        '#modal-reservation-id'
    ).textContent =
        `#${reservation.reservation_id}`;

    document.querySelector(
        '#modal-client-name'
    ).textContent =
        reservation.client_name || '-';

    document.querySelector(
        '#modal-account-id'
    ).textContent =
        reservation.account_id || '-';

    document.querySelector(
        '#modal-service'
    ).textContent =
        reservation.service || '-';

    document.querySelector(
        '#modal-date'
    ).textContent =
        formatDate(
            reservation.reservation_date
        );

    document.querySelector(
        '#modal-time'
    ).textContent =
        formatTime(
            reservation.reservation_time
        );

    document.querySelector(
        '#modal-status'
    ).textContent =
        reservation.status || '-';

    document.querySelector(
        '#modal-payment'
    ).textContent =
        reservation.payment_status || '-';

    document.querySelector(
        '#modal-details'
    ).textContent =
        reservation.reservation_details ||
        'No reservation details provided.';

    modal.classList.add('show');
}

// =====================================
// CLOSE RESERVATION MODAL
// =====================================

function closeReservationModal() {

    const modal =
        document.querySelector(
            '#reservation-modal'
        );

    if (modal) {

        modal.classList.remove('show');

    }

}

// =====================================
// MODAL EVENTS
// =====================================

function setupReservationModal() {

    const closeButton =
        document.querySelector(
            '#close-reservation-modal'
        );

    const modalCloseButton =
        document.querySelector(
            '#modal-close-btn'
        );

    const modal =
        document.querySelector(
            '#reservation-modal'
        );

    if (closeButton) {

        closeButton.addEventListener(
            'click',
            closeReservationModal
        );

    }

    if (modalCloseButton) {

        modalCloseButton.addEventListener(
            'click',
            closeReservationModal
        );

    }

    if (modal) {

        modal.addEventListener(
            'click',
            event => {

                if (event.target === modal) {

                    closeReservationModal();

                }

            }
        );

    }

}

// =====================================
// STATUS CLASS
// =====================================

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

// =====================================
// PAYMENT CLASS
// =====================================

function getPaymentClass(status) {

    switch (status) {

        case 'Paid':
            return 'paid';

        case 'Unpaid':
            return 'unpaid';

        default:
            return '';

    }

}

// =====================================
// FORMAT DATE
// =====================================

function formatDate(value) {

    if (!value) return '-';

    const date = new Date(value);

    if (isNaN(date.getTime())) {
        return value;
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

// =====================================
// FORMAT TIME
// =====================================

function formatTime(value) {

    if (!value) return '-';

    const parts = value.split(':');

    if (parts.length < 2) {
        return value;
    }

    let hours =
        parseInt(parts[0], 10);

    const minutes =
        parts[1];

    const period =
        hours >= 12
            ? 'PM'
            : 'AM';

    hours = hours % 12;

    if (hours === 0) {
        hours = 12;
    }

    return `${hours}:${minutes} ${period}`;

}

// =====================================
// ESCAPE HTML
// =====================================

function escapeHtml(value) {

    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

}

// =====================================
// CUSTOM CENTER MESSAGE
// =====================================

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

    // IMPORTANT:
    // If custom modal is missing,
    // DO NOT use alert().
    if (!overlay) {

        console.error(
            'message-overlay not found.'
        );

        return;
    }

    if (messageTitle) {
        messageTitle.textContent = title;
    }

    if (messageText) {
        messageText.textContent = message;
    }

    if (messageIcon) {
        messageIcon.textContent = icon;
    }

    overlay.classList.add('show');

    if (okButton) {

        okButton.onclick = () => {

            overlay.classList.remove('show');

        };

    }

}

// =====================================
// INITIALIZE
// =====================================

document.addEventListener(
    'DOMContentLoaded',
    () => {

        setupFilters();

        setupSearch();

        setupReservationModal();

        loadReservations();

    }
);