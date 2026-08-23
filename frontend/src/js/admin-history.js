
// =====================================
// ADMIN HISTORY
// =====================================

const historyList = document.querySelector('#admin-history-list');
const searchInput = document.querySelector('#admin-history-search');
const filterButtons = document.querySelectorAll('.filter-chip');

let allHistoryRecords = [];
let currentFilter = 'all';


// =====================================
// LOAD HISTORY RECORDS
// =====================================

async function loadHistory() {

    if (!historyList) {
        console.error('admin-history-list not found.');
        return;
    }

    historyList.innerHTML = `
        <tr>
            <td colspan="7">
                Loading history records...
            </td>
        </tr>
    `;

    try {

        const response = await fetch(
            'http://localhost:3001/api/reservations'
        );

        const data = await response.json();

        console.log('History response:', data);

        if (!data.success) {

            historyList.innerHTML = `
                <tr>
                    <td colspan="7">
                        Failed to load history records.
                    </td>
                </tr>
            `;

            return;
        }

        /*
         * We use the reservations table as the source
         * of history records.
         *
         * Only Completed reservations are shown
         * in Admin History.
         */

        allHistoryRecords = data.reservations.filter(
            reservation =>
                reservation.status === 'Completed'
        );

        renderHistory();

    } catch (error) {

        console.error(
            'Admin history loading error:',
            error
        );

        historyList.innerHTML = `
            <tr>
                <td colspan="7">
                    Cannot connect to the server.
                </td>
            </tr>
        `;
    }
}


// =====================================
// RENDER HISTORY
// =====================================

function renderHistory() {

    if (!historyList) return;

    const searchValue =
        searchInput?.value
            .trim()
            .toLowerCase() || '';

    let filteredRecords =
        [...allHistoryRecords];


    // =================================
    // FILTER
    // =================================

    if (currentFilter === 'completed') {

        filteredRecords =
            filteredRecords.filter(
                reservation =>
                    reservation.status === 'Completed'
            );

    }

    if (currentFilter === 'paid') {

        filteredRecords =
            filteredRecords.filter(
                reservation =>
                    reservation.payment_status === 'Paid'
            );

    }


    // =================================
    // SEARCH
    // =================================

    if (searchValue) {

        filteredRecords =
            filteredRecords.filter(
                reservation => {

                    const reservationId =
                        String(
                            reservation.reservation_id || ''
                        ).toLowerCase();

                    const accountId =
                        String(
                            reservation.account_id || ''
                        ).toLowerCase();

                    const clientName =
                        String(
                            reservation.client_name || ''
                        ).toLowerCase();

                    const service =
                        String(
                            reservation.service || ''
                        ).toLowerCase();

                    return (
                        reservationId.includes(searchValue) ||
                        accountId.includes(searchValue) ||
                        clientName.includes(searchValue) ||
                        service.includes(searchValue)
                    );
                }
            );
    }


    // =================================
    // NO RECORDS
    // =================================

    if (filteredRecords.length === 0) {

        historyList.innerHTML = `
            <tr>
                <td colspan="7">
                    No history records found.
                </td>
            </tr>
        `;

        return;
    }


    // =================================
    // DISPLAY RECORDS
    // =================================

    historyList.innerHTML =
        filteredRecords.map(
            reservation => {

                const date =
                    formatDate(
                        reservation.reservation_date
                    );

                const amount =
                    Number(
                        reservation.amount || 0
                    ).toLocaleString(
                        'en-PH',
                        {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        }
                    );


                const paymentClass =
                    reservation.payment_status === 'Paid'
                        ? 'paid'
                        : 'unpaid';


                return `
                    <tr>

                        <td>
                            ${date}
                        </td>

                        <td>
                            #${reservation.reservation_id}
                        </td>

                        <td>
                            ${escapeHTML(
                                reservation.client_name ||
                                reservation.account_id ||
                                'Unknown Client'
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                reservation.service ||
                                '—'
                            )}
                        </td>

                        <td>
                            ₱${amount}
                        </td>

                        <td>
                            <span class="status completed">
                                ${escapeHTML(
                                    reservation.status
                                )}
                            </span>
                        </td>

                        <td>
                            <span class="status ${paymentClass}">
                                ${escapeHTML(
                                    reservation.payment_status ||
                                    'Unpaid'
                                )}
                            </span>
                        </td>

                    </tr>
                `;
            }
        ).join('');
}


// =====================================
// DATE FORMAT
// =====================================

function formatDate(dateValue) {

    if (!dateValue) {
        return '—';
    }

    const date =
        new Date(dateValue);

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


// =====================================
// SEARCH
// =====================================

if (searchInput) {

    searchInput.addEventListener(
        'input',
        renderHistory
    );

}


// =====================================
// FILTER BUTTONS
// =====================================

filterButtons.forEach(
    button => {

        button.addEventListener(
            'click',
            () => {

                filterButtons.forEach(
                    btn =>
                        btn.classList.remove(
                            'active'
                        )
                );

                button.classList.add(
                    'active'
                );

                currentFilter =
                    button.dataset.filter ||
                    'all';

                renderHistory();

            }
        );

    }
);


// =====================================
// HTML ESCAPE
// =====================================

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}


// =====================================
// START
// =====================================

loadHistory();