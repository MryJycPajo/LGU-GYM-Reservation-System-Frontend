// =====================================
// ADMIN BILLING & PAYMENTS
// =====================================

const API_URL = 'http://localhost:3001/api/reservations';

let allBillingRecords = [];
let currentPaymentFilter = 'All';

// =====================================
// LOAD BILLING RECORDS
// =====================================

async function loadBillingRecords() {

    const tableBody = document.querySelector('#admin-billing-list');

    if (!tableBody) {
        console.error('admin-billing-list not found.');
        return;
    }

    try {

        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center;">
                    Loading billing records...
                </td>
            </tr>
        `;

        const response = await fetch(API_URL);
        const data = await response.json();

        console.log('BILLING RESPONSE:', data);

        if (!data.success) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align:center;">
                        Unable to load billing records.
                    </td>
                </tr>
            `;

            return;
        }

        allBillingRecords = data.reservations || [];

        displayBillingRecords();

    } catch (error) {

        console.error('Billing load error:', error);

        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center;">
                    Cannot connect to the server.
                </td>
            </tr>
        `;
    }
}


// =====================================
// DISPLAY BILLING RECORDS
// =====================================

function displayBillingRecords() {

    const tableBody =
        document.querySelector('#admin-billing-list');

    const searchInput =
        document.querySelector('#admin-billing-search');

    if (!tableBody) return;

    const searchValue = searchInput
        ? searchInput.value.toLowerCase().trim()
        : '';

    const filteredRecords = allBillingRecords.filter(record => {

        // PAYMENT FILTER
        if (
            currentPaymentFilter !== 'All' &&
            record.payment_status !== currentPaymentFilter
        ) {
            return false;
        }

        // SEARCH
        if (searchValue !== '') {

            const reservationId =
                String(record.reservation_id || '')
                    .toLowerCase();

            const clientName =
                String(record.client_name || '')
                    .toLowerCase();

            const paymentDate =
                String(record.payment_date || '')
                    .toLowerCase();

            const service =
                String(record.service || '')
                    .toLowerCase();

            return (
                reservationId.includes(searchValue) ||
                clientName.includes(searchValue) ||
                paymentDate.includes(searchValue) ||
                service.includes(searchValue)
            );
        }

        return true;
    });


    // NO RESULTS
    if (filteredRecords.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center;">
                    No billing records found.
                </td>
            </tr>
        `;

        return;
    }


    // DISPLAY
    tableBody.innerHTML = filteredRecords.map(record => {

        const amount =
            Number(record.amount || 0);

        const paymentStatus =
            record.payment_status || 'Unpaid';

        return `
            <tr>

                <td>
                    #${record.reservation_id}
                </td>

                <td>
                    ${escapeHtml(record.client_name || '-')}
                </td>

                <td>
                    ${escapeHtml(record.service || '-')}
                </td>

                <td>
                    ₱${amount.toFixed(2)}
                </td>

                <td>
                    <span class="status ${getPaymentClass(paymentStatus)}">
                        ${escapeHtml(paymentStatus)}
                    </span>
                </td>

                <td>
                    ${
                        record.payment_date
                            ? formatPaymentDate(record.payment_date)
                            : '—'
                    }
                </td>

            </tr>
        `;

    }).join('');
}


// =====================================
// PAYMENT FILTERS
// =====================================

function setupPaymentFilters() {

    const filterButtons =
        document.querySelectorAll('.filter-chip');

    filterButtons.forEach(button => {

        button.addEventListener('click', () => {

            filterButtons.forEach(btn => {
                btn.classList.remove('active');
            });

            button.classList.add('active');

            currentPaymentFilter =
                button.textContent.trim();

            displayBillingRecords();
        });

    });
}


// =====================================
// SEARCH
// =====================================

function setupBillingSearch() {

    const searchInput =
        document.querySelector('#admin-billing-search');

    if (!searchInput) return;

    searchInput.addEventListener('input', () => {
        displayBillingRecords();
    });
}


// =====================================
// PAYMENT STATUS CLASS
// =====================================

function getPaymentClass(status) {

    switch (status) {

        case 'Paid':
            return 'approved';

        case 'Unpaid':
            return 'pending-approval';

        default:
            return '';
    }
}


// =====================================
// FORMAT PAYMENT DATE
// =====================================

function formatPaymentDate(value) {

    if (!value) return '—';

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
// INITIALIZE
// =====================================

document.addEventListener(
    'DOMContentLoaded',
    () => {

        setupPaymentFilters();

        setupBillingSearch();

        loadBillingRecords();

    }
);