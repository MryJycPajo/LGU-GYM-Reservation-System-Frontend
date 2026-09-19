const API_URL = 'http://localhost:3001/api/reservations';

function formatDate(value) {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? value
        : date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
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

function escapeHtml(value) {
    return String(value ?? '—')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function statusClass(status) {
    if (status === 'Approved' || status === 'Completed') return 'approved';
    if (status === 'Declined') return 'declined';
    return 'pending-approval';
}

async function loadPersonnelHistory() {
    const table = document.querySelector('#personnel-history-list');
    if (!table) return;

    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Unable to load reservation history.');
        }

        const reservations = (data.reservations || [])
            .filter(reservation => reservation.status !== 'Pending');

        if (reservations.length === 0) {
            table.innerHTML = '<tr><td colspan="10">No reservation history found.</td></tr>';
            return;
        }

        table.innerHTML = reservations.map(reservation => `
            <tr>
                <td>#${escapeHtml(reservation.reservation_id)}</td>
                <td>${escapeHtml(reservation.client_name)}</td>
                <td>${escapeHtml(reservation.service)}</td>
                <td>${escapeHtml(reservation.purpose)}</td>
                <td>${formatDate(reservation.reservation_date)}</td>
                <td>${formatTime(reservation.reservation_time)}</td>
                <td>${formatTime(reservation.end_time)}</td>
                <td>${escapeHtml(reservation.participants)}</td>
                <td><span class="status ${statusClass(reservation.status)}">${escapeHtml(reservation.status)}</span></td>
                <td><span class="status">${escapeHtml(reservation.payment_status)}</span></td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('PERSONNEL HISTORY ERROR:', error);
        table.innerHTML = '<tr><td colspan="10">Unable to load reservation history.</td></tr>';
    }
}

loadPersonnelHistory();
