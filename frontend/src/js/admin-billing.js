const API_URL = 'http://localhost:3001/api/reservations';
const PAYMENTS_API_URL = 'http://localhost:3001/api/payments';
let billingRecords = [];
let selectedReservation = null;

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

function rentalDays(record) {
    const value = record.rental_days ?? record.number_of_rental_days ?? record.rental_duration_days;
    if (Number.isFinite(Number(value)) && Number(value) > 0) return Number(value);
    return record.reservation_date ? 1 : null;
}

function ratePerDay(record, days) {
    const configuredRate = record.rate_per_day ?? record.daily_rate;
    if (configuredRate !== undefined && configuredRate !== null) return Number(configuredRate);
    if (days && record.amount !== undefined && record.amount !== null) return Number(record.amount) / days;
    return null;
}

function totalDue(record, days, rate) {
    if (record.total_amount_due !== undefined && record.total_amount_due !== null) return Number(record.total_amount_due);
    if (days && rate !== null) return days * rate;
    return record.amount === undefined || record.amount === null ? null : Number(record.amount);
}

function formatCurrency(value) {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return 'Not provided';
    return `₱${Number(value).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function getAuthHeaders() {
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

function renderBilling() {
    const table = document.querySelector('#admin-billing-list');
    const search = document.querySelector('#admin-billing-search')?.value.toLowerCase().trim() || '';
    if (!table) return;

    const rows = billingRecords.filter(record => {
        if (record.status !== 'Approved' || record.payment_status !== 'Unpaid') return false;
        return !search || [record.reservation_id, record.client_name, record.service, record.reservation_date]
            .some(value => String(value || '').toLowerCase().includes(search));
    });

    if (!rows.length) {
        table.innerHTML = '<tr><td colspan="10">No approved unpaid reservations found.</td></tr>';
        return;
    }

    table.innerHTML = rows.map(record => {
        const days = rentalDays(record);
        const rate = ratePerDay(record, days);
        const total = totalDue(record, days, rate);
        return `<tr>
            <td>#${escapeHtml(record.reservation_id)}</td>
            <td>${escapeHtml(record.client_name)}</td>
            <td>${escapeHtml(record.service)}</td>
            <td>${formatDate(record.reservation_date)}</td>
            <td>${days ?? 'Not provided'}</td>
            <td>${formatCurrency(rate)}</td>
            <td>${formatCurrency(total)}</td>
            <td><span class="status pending-approval">Unpaid</span></td>
            <td>${formatCurrency(total)}</td>
            <td><button class="table-button record-payment-btn" type="button" data-id="${escapeHtml(record.reservation_id)}">Record Payment</button></td>
        </tr>`;
    }).join('');

    table.querySelectorAll('.record-payment-btn').forEach(button => {
        button.addEventListener('click', () => openPaymentModal(button.dataset.id));
    });
}

function openPaymentModal(id) {
    selectedReservation = billingRecords.find(record => String(record.reservation_id) === String(id));
    if (!selectedReservation) return;

    const days = rentalDays(selectedReservation);
    const rate = ratePerDay(selectedReservation, days);
    const total = totalDue(selectedReservation, days, rate);
    const name = selectedReservation.client_name || 'Client';
    const initials = name.split(/\s+/).filter(Boolean).map(part => part[0]).join('').slice(0, 2).toUpperCase();

    document.querySelector('#billing-client-initials').textContent = initials || 'C';
    document.querySelector('#billing-client-name').textContent = name;
    document.querySelector('#billing-client-id').textContent = selectedReservation.account_id || 'Not provided';
    document.querySelector('#billing-reservation-id').textContent = `#${selectedReservation.reservation_id}`;
    document.querySelector('#billing-rental-date').textContent = formatDate(selectedReservation.reservation_date);
    document.querySelector('#billing-rental-days').textContent = days === null ? 'Not provided' : `${days} day${days === 1 ? '' : 's'}`;
    document.querySelector('#billing-rate-per-day').textContent = formatCurrency(rate);
    document.querySelector('#billing-total-due').textContent = formatCurrency(total);
    document.querySelector('#billing-payment-date').value = new Date().toISOString().slice(0, 10);
    document.querySelector('#billing-payment-error').hidden = true;
    document.querySelector('#billing-payment-modal').classList.add('show');
}

function closePaymentModal() {
    document.querySelector('#billing-payment-modal')?.classList.remove('show');
    document.querySelector('#billing-payment-form')?.reset();
    selectedReservation = null;
}

function normalizePaymentForm() {
    const method = document.querySelector('#billing-payment-method');
    if (method) {
        method.innerHTML = '<option value="Cash" selected>Cash</option>';
        method.value = 'Cash';
    }

    ['#billing-payment-reference', '#billing-payment-remarks'].forEach(selector => {
        document.querySelector(selector)?.closest('label')?.remove();
    });
}

function showPaymentError(message) {
    const error = document.querySelector('#billing-payment-error');
    error.textContent = message;
    error.hidden = false;
}

function showPaymentSuccess(reservationId) {
    const overlay = document.querySelector('#billing-payment-success');
    document.querySelector('#billing-payment-success-text').textContent =
        `Payment for reservation #${reservationId} was recorded successfully.`;
    overlay.classList.add('show');
    overlay.setAttribute('aria-hidden', 'false');
}

async function submitPayment() {
    const form = document.querySelector('#billing-payment-form');
    const submitButton = document.querySelector('#billing-payment-confirm');
    const token = localStorage.getItem('auth_token');

    if (!form.reportValidity() || !selectedReservation) return;
    if (!token) {
        showPaymentError('Your login session is missing or expired. Please log in again.');
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Saving...';

    try {
        const response = await fetch(PAYMENTS_API_URL, {
            method: 'POST',
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                reservation_id: Number(selectedReservation.reservation_id),
                payment_method: document.querySelector('#billing-payment-method').value,
                payment_date: document.querySelector('#billing-payment-date').value
            })
        });
        const data = await response.json();

        if (response.status === 401) throw new Error('Your login session is missing or expired. Please log in again.');
        if (response.status === 403) throw new Error('You are not authorized to record payments.');
        if (!response.ok || !data.success) throw new Error(data.message || 'The payment could not be saved.');

        const reservationId = selectedReservation.reservation_id;
        closePaymentModal();
        showPaymentSuccess(reservationId);
        await loadBilling();
    } catch (error) {
        console.error('PAYMENT SUBMISSION ERROR:', error);
        showPaymentError(error.message || 'The payment could not be saved.');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Confirm Payment';
    }
}

async function loadBilling() {
    const table = document.querySelector('#admin-billing-list');
    if (!table) return;

    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.message || 'Unable to load billing records.');
        billingRecords = data.reservations || [];
        renderBilling();
    } catch (error) {
        console.error('BILLING LOAD ERROR:', error);
        table.innerHTML = `<tr><td colspan="10">${escapeHtml(error.message || 'Unable to load billing records.')}</td></tr>`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadPersonnelIdentity();
    normalizePaymentForm();
    document.querySelector('#admin-billing-search')?.addEventListener('input', renderBilling);
    document.querySelector('#billing-payment-cancel')?.addEventListener('click', closePaymentModal);
    document.querySelector('#billing-payment-close')?.addEventListener('click', closePaymentModal);
    document.querySelector('#billing-payment-modal')?.addEventListener('click', event => {
        if (event.target.id === 'billing-payment-modal') closePaymentModal();
    });
    document.querySelector('#billing-payment-form')?.addEventListener('submit', event => {
        event.preventDefault();
        submitPayment();
    });
    document.querySelector('#billing-payment-success-close')?.addEventListener('click', () => {
        const overlay = document.querySelector('#billing-payment-success');
        overlay.classList.remove('show');
        overlay.setAttribute('aria-hidden', 'true');
    });
    loadBilling();
});
