const API_URL = 'http://localhost:3001/api/payments';
const ACCOUNTS_API_URL = 'http://localhost:3001/api/auth/accounts';
let transactions = [];
let recorderNames = new Map();

function authHeaders() {
    const token = localStorage.getItem('auth_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

function loadPersonnelIdentity() {
    let personnel = {};
    try {
        personnel = JSON.parse(localStorage.getItem('personnel') || '{}');
    } catch (error) {
        console.error('PERSONNEL SESSION DATA ERROR:', error);
    }

    const fullName = `${personnel.firstname || ''} ${personnel.lastname || ''}`.trim() || 'Personnel';
    const nameElement = document.querySelector('#personnel-name');
    const avatarElement = document.querySelector('#personnel-avatar');

    if (nameElement) nameElement.textContent = fullName;
    if (avatarElement && personnel.firstname) {
        avatarElement.textContent = personnel.firstname.charAt(0).toUpperCase();
    }
}

function escapeHtml(value) {
    return String(value ?? '—')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function formatDate(value) {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? escapeHtml(value) : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatCurrency(value) {
    if (value === undefined || value === null || value === '') return '—';
    return `₱${Number(value).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

async function loadRecorderNames() {
    try {
        const response = await fetch(ACCOUNTS_API_URL, { headers: authHeaders() });
        const data = await response.json();
        if (!response.ok || !data.success || !Array.isArray(data.users)) return;

        recorderNames = new Map(data.users.map(user => [
            String(user.account_id),
            [user.firstname, user.lastname].filter(Boolean).join(' ').trim()
        ]));
    } catch (error) {
        console.warn('RECORDER NAME LOOKUP ERROR:', error);
    }
}

function recorderName(payment) {
    return recorderNames.get(String(payment.recorded_by)) ||
        payment.recorded_by_name ||
        payment.recorded_by ||
        '—';
}

function renderPayments() {
    const table = document.querySelector('#payments-list');
    const search = document.querySelector('#payments-search')?.value.toLowerCase().trim() || '';
    if (!table) return;

    const rows = transactions.filter(transaction => !search || [
        transaction.transaction_id,
        transaction.reservation_id,
        transaction.client_name,
        transaction.payment_date,
        transaction.payment_method
    ].some(value => String(value || '').toLowerCase().includes(search)));

    if (!rows.length) {
        table.innerHTML = '<tr><td colspan="9">No saved payment transactions found.</td></tr>';
        return;
    }

    table.innerHTML = rows.map(transaction => `<tr>
        <td>#${escapeHtml(transaction.transaction_id)}</td>
        <td>#${escapeHtml(transaction.reservation_id)}</td>
        <td>${escapeHtml(transaction.client_name)}</td>
        <td>${formatCurrency(transaction.amount)}</td>
        <td>${formatDate(transaction.payment_date)}</td>
        <td>${escapeHtml(transaction.payment_method)}</td>
        <td>${escapeHtml(recorderName(transaction))}</td>
        <td><span class="status approved">Paid</span></td>
        <td><button class="table-button receipt-btn" type="button" data-reservation-id="${escapeHtml(transaction.reservation_id)}">View Receipt</button></td>
    </tr>`).join('');

    table.querySelectorAll('.receipt-btn').forEach(button => {
        button.addEventListener('click', () => loadReceipt(button.dataset.reservationId));
    });
}

function showError(message) {
    const table = document.querySelector('#payments-list');
    if (table) table.innerHTML = `<tr><td colspan="9">${escapeHtml(message)}</td></tr>`;
}

async function loadPayments() {
    const token = localStorage.getItem('auth_token');
    if (!token) {
        showError('Your login session is missing or expired. Please log in again.');
        return;
    }

    try {
        const response = await fetch(API_URL, { headers: authHeaders() });
        const data = await response.json();
        if (response.status === 401) throw new Error('Your login session is missing or expired. Please log in again.');
        if (response.status === 403) throw new Error('You are not authorized to view payment transactions.');
        if (!response.ok || !data.success) throw new Error(data.message || 'Unable to load payment transactions.');
        transactions = Array.isArray(data.transactions) ? data.transactions : [];
        await loadRecorderNames();
        renderPayments();
    } catch (error) {
        console.error('PAYMENTS LOAD ERROR:', error);
        showError(error.message || 'Unable to load payment transactions.');
    }
}

async function loadReceipt(reservationId) {
    try {
        const response = await fetch(`${API_URL}/${encodeURIComponent(reservationId)}/receipt`, { headers: authHeaders() });
        const data = await response.json();
        if (response.status === 401) throw new Error('Your login session is missing or expired. Please log in again.');
        if (response.status === 403) throw new Error('You are not authorized to view this receipt.');
        if (!response.ok || !data.success || !data.receipt) throw new Error(data.message || 'Unable to load receipt.');
        renderReceipt(data.receipt);
    } catch (error) {
        console.error('RECEIPT LOAD ERROR:', error);
        showError(error.message || 'Unable to load receipt.');
    }
}

function renderReceipt(receipt) {
    const name = receipt.client_name || 'Client';
    document.querySelector('#receipt-initials').textContent = name.split(/\s+/).filter(Boolean).map(part => part[0]).join('').slice(0, 2).toUpperCase() || 'LG';
    document.querySelector('#receipt-client-name').textContent = name;
    document.querySelector('#receipt-transaction-id').textContent = `#${receipt.transaction_id}`;
    document.querySelector('#receipt-reservation-id').textContent = `#${receipt.reservation_id}`;
    document.querySelector('#receipt-rental-date').textContent = formatDate(receipt.reservation_date);
    document.querySelector('#receipt-rental-days').textContent = receipt.rental_days ? `${receipt.rental_days} day${receipt.rental_days === 1 ? '' : 's'}` : '—';
    document.querySelector('#receipt-daily-rate').textContent = formatCurrency(receipt.daily_rate);
    document.querySelector('#receipt-amount').textContent = formatCurrency(receipt.amount);
    document.querySelector('#receipt-payment-date').textContent = formatDate(receipt.payment_date);
    document.querySelector('#receipt-payment-method').textContent = receipt.payment_method || '—';
    document.querySelector('#receipt-recorded-by').textContent = recorderName(receipt);
    document.querySelector('#receipt-modal').classList.add('show');
}

function closeReceipt() {
    document.querySelector('#receipt-modal')?.classList.remove('show');
}

function ensureReceiptModal() {
    if (document.querySelector('#receipt-modal')) return;

    const modal = document.createElement('div');
    modal.className = 'billing-payment-modal';
    modal.id = 'receipt-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'receipt-title');
    modal.innerHTML = `
        <div class="billing-payment-card">
            <div class="billing-modal-heading">
                <div class="billing-avatar" id="receipt-initials">LG</div>
                <div><p class="eyebrow">LGU GYM RESERVATION SYSTEM</p><h2 id="receipt-title">Payment Receipt</h2><strong id="receipt-client-name">—</strong></div>
                <button type="button" class="modal-close" id="receipt-close" aria-label="Close receipt">×</button>
            </div>
            <div class="billing-detail-grid">
                <div><span>Transaction ID</span><strong id="receipt-transaction-id">—</strong></div>
                <div><span>Reservation ID</span><strong id="receipt-reservation-id">—</strong></div>
                <div><span>Rental date(s)</span><strong id="receipt-rental-date">—</strong></div>
                <div><span>Rental days</span><strong id="receipt-rental-days">—</strong></div>
                <div><span>Daily rental rate</span><strong id="receipt-daily-rate">—</strong></div>
                <div class="billing-total"><span>Total amount paid</span><strong id="receipt-amount">—</strong></div>
                <div><span>Payment date</span><strong id="receipt-payment-date">—</strong></div>
                <div><span>Payment method</span><strong id="receipt-payment-method">—</strong></div>
                <div><span>Recorded by</span><strong id="receipt-recorded-by">—</strong></div>
            </div>
            <div class="billing-modal-actions"><button type="button" class="table-button" id="receipt-print">Print Receipt</button><button type="button" class="message-ok-btn" id="receipt-close-action">Close</button></div>
        </div>`;
    document.body.appendChild(modal);
}

document.addEventListener('DOMContentLoaded', () => {
    ensureReceiptModal();
    loadPersonnelIdentity();
    document.querySelector('.payment-contract-notice')?.remove();
    document.querySelector('#menu-button')?.addEventListener('click', () => document.querySelector('#sidebar')?.classList.toggle('open'));
    document.querySelector('#payments-search')?.addEventListener('input', renderPayments);
    document.querySelector('#receipt-close')?.addEventListener('click', closeReceipt);
    document.querySelector('#receipt-close-action')?.addEventListener('click', closeReceipt);
    document.querySelector('#receipt-modal')?.addEventListener('click', event => {
        if (event.target.id === 'receipt-modal') closeReceipt();
    });
    document.querySelector('#receipt-print')?.addEventListener('click', () => window.print());
    loadPayments();
});
