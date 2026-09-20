const API_URL = 'http://localhost:3001/api/reservations';
let reservations = [];
let currentFilter = 'All';

const personnel = JSON.parse(localStorage.getItem('personnel') || '{}');
const personnelName = document.querySelector('#personnel-name');
const personnelAvatar = document.querySelector('#personnel-avatar');

if (personnelName) {
    personnelName.textContent = `${personnel.firstname || ''} ${personnel.lastname || ''}`.trim() || 'Personnel';
}

if (personnelAvatar && personnel.firstname) {
    personnelAvatar.textContent = personnel.firstname.charAt(0).toUpperCase();
}

document.querySelector('#menu-button')?.addEventListener('click', () => {
    document.querySelector('#sidebar')?.classList.toggle('open');
});

function escapeHtml(value) {
    return String(value ?? '—')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function formatDate(value) {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
    });
}

function formatTime(value) {
    if (!value) return '—';
    const parts = String(value).split(':');
    if (parts.length < 2) return value;
    let hours = Number(parts[0]);
    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${parts[1]} ${period}`;
}

function statusClass(status) {
    if (status === 'Approved' || status === 'Completed') return 'approved';
    if (status === 'Declined') return 'declined';
    return 'pending-approval';
}

async function loadReservations() {
    const table = document.querySelector('#personnel-reservations-list');
    if (!table) return;

    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        if (!data.success) throw new Error(data.message || 'Unable to load reservations.');
        reservations = data.reservations || [];
        renderReservations(table);
    } catch (error) {
        console.error('PERSONNEL RESERVATIONS ERROR:', error);
        table.innerHTML = '<tr><td colspan="9">Unable to load reservations.</td></tr>';
    }
}

function renderReservations(table) {
    const searchInput = document.querySelector('#personnel-reservation-search');
    const searchValue = searchInput
        ? searchInput.value.toLowerCase().trim()
        : '';

    const filteredReservations = reservations.filter(reservation => {
        if (currentFilter !== 'All' && reservation.status !== currentFilter) {
            return false;
        }

        if (!searchValue) {
            return true;
        }

        return [
            reservation.reservation_id,
            reservation.client_name,
            reservation.service,
            reservation.status,
            reservation.payment_status
        ].some(value => String(value || '').toLowerCase().includes(searchValue));
    });

    if (filteredReservations.length === 0) {
        table.innerHTML = '<tr><td colspan="9">No reservations found.</td></tr>';
        return;
    }

    table.innerHTML = filteredReservations.map(reservation => `
        <tr>
            <td>#${escapeHtml(reservation.reservation_id)}</td>
            <td>${escapeHtml(reservation.client_name)}</td>
            <td>${escapeHtml(reservation.service)}</td>
            <td>${formatDate(reservation.reservation_date)}</td>
            <td>${formatTime(reservation.reservation_time)}</td>
            <td>${formatTime(reservation.end_time)}</td>
            <td><span class="status ${statusClass(reservation.status)}">${escapeHtml(reservation.status)}</span></td>
            <td><span class="status">${escapeHtml(reservation.payment_status)}</span></td>
            <td>
                <button class="table-button view-personnel-reservation" data-id="${escapeHtml(reservation.reservation_id)}" type="button">View</button>
                ${reservation.status === 'Pending' ? `
                    <button class="table-button approve-personnel-reservation" data-id="${escapeHtml(reservation.reservation_id)}" type="button">Approve</button>
                    <button class="table-button decline-personnel-reservation" data-id="${escapeHtml(reservation.reservation_id)}" type="button">Decline</button>
                ` : ''}
                ${reservation.status === 'Approved' && reservation.payment_status === 'Paid' ? `
                    <button class="table-button complete-personnel-reservation" data-id="${escapeHtml(reservation.reservation_id)}" type="button">Complete</button>
                ` : ''}
            </td>
        </tr>
    `).join('');

    table.querySelectorAll('.view-personnel-reservation').forEach(button => {
        button.addEventListener('click', () => {
            const reservation = reservations.find(item => String(item.reservation_id) === button.dataset.id);
            if (reservation) showReservationDetails(reservation);
        });
    });

    table.querySelectorAll('.approve-personnel-reservation, .decline-personnel-reservation').forEach(button => {
        button.addEventListener('click', () => {
            const status = button.classList.contains('approve-personnel-reservation') ? 'Approved' : 'Declined';
            if (window.confirm(`Are you sure you want to mark this reservation as ${status.toLowerCase()}?`)) {
                updateReservationStatus(button.dataset.id, status);
            }
        });
    });

    table.querySelectorAll('.complete-personnel-reservation').forEach(button => {
        button.addEventListener('click', () => {
            updateReservationStatus(button.dataset.id, 'Completed');
        });
    });
}

function setupFilters() {
    document.querySelectorAll('.filter-chip').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.filter-chip').forEach(item => {
                item.classList.remove('active');
            });

            button.classList.add('active');
            currentFilter = button.dataset.status || 'All';
            renderReservations(document.querySelector('#personnel-reservations-list'));
        });
    });
}

function setupSearch() {
    document.querySelector('#personnel-reservation-search')?.addEventListener('input', () => {
        renderReservations(document.querySelector('#personnel-reservations-list'));
    });
}

async function updateReservationStatus(id, status) {
    try {
        const response = await fetch(`${API_URL}/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        const data = await response.json();
        if (!data.success) throw new Error(data.message || 'Unable to update reservation.');
        const successMessage = status === 'Approved'
            ? `Reservation #${id} has been approved successfully.`
            : `Reservation #${id} has been ${status.toLowerCase()}.`;

        if (status === 'Approved') {
            showMessage(
                'Reservation Approved',
                successMessage,
                () => loadReservations()
            );
            return;
        }

        showMessage(`Reservation ${status}`, successMessage);
        await loadReservations();
    } catch (error) {
        console.error('PERSONNEL STATUS UPDATE ERROR:', error);
        showMessage('Update Failed', 'Unable to update this reservation.');
    }
}

function showReservationDetails(reservation) {
    const modal = document.querySelector('#reservation-modal');
    if (!modal) return;

    document.querySelector('#modal-reservation-id').textContent = `#${reservation.reservation_id || '—'}`;
    document.querySelector('#modal-client-name').textContent = reservation.client_name || '—';
    document.querySelector('#modal-account-id').textContent = reservation.account_id || '—';
    document.querySelector('#modal-service').textContent = reservation.service || '—';
    document.querySelector('#modal-date').textContent = formatDate(reservation.reservation_date);
    document.querySelector('#modal-time').textContent = formatTime(reservation.reservation_time);
    document.querySelector('#modal-end-time').textContent = formatTime(reservation.end_time);
    document.querySelector('#modal-status').textContent = reservation.status || '—';
    document.querySelector('#modal-payment').textContent = reservation.payment_status || '—';
    document.querySelector('#modal-details').textContent = reservation.reservation_details || 'No reservation details provided.';
    modal.classList.add('show');
}

function closeReservationModal() {
    document.querySelector('#reservation-modal')?.classList.remove('show');
}

function showMessage(title, message, onClose) {
    const overlay = document.querySelector('#personnel-message-overlay');
    const titleElement = document.querySelector('#personnel-message-title');
    const messageElement = document.querySelector('#personnel-message-text');
    const closeButton = document.querySelector('#personnel-message-ok');
    if (!overlay || !titleElement || !messageElement) return;
    titleElement.textContent = title;
    messageElement.textContent = message;
    overlay.classList.add('show');
    overlay.setAttribute('aria-hidden', 'false');
    closeButton.onclick = () => {
        overlay.classList.remove('show');
        overlay.setAttribute('aria-hidden', 'true');
        onClose?.();
    };
}

document.querySelector('#close-reservation-modal')?.addEventListener('click', closeReservationModal);
document.querySelector('#modal-close-btn')?.addEventListener('click', closeReservationModal);
document.querySelector('#reservation-modal')?.addEventListener('click', event => {
    if (event.target.id === 'reservation-modal') closeReservationModal();
});
document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeReservationModal();
});

setupFilters();
setupSearch();
loadReservations();
