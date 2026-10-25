const pendingAccountsList = document.querySelector('#pending-accounts-list');
const filterButtons = document.querySelectorAll('.filter-chip');

const API_URL = 'http://localhost:3001/api';
let pendingAccounts = [];
let selectedAccountId = null;
let selectedFilter = 'all';
let decisionInProgress = false;

function authHeaders() {
    const token = localStorage.getItem('auth_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function accountName(account) {
    return `${account.firstname || ''} ${account.middlename || ''} ${account.lastname || ''}`
        .replace(/\s+/g, ' ')
        .trim();
}

function showMessage(message, type = 'success') {
    document.querySelector('#system-message')?.remove();

    const popup = document.createElement('div');
    popup.id = 'system-message';
    popup.innerHTML = `
        <div class="system-message-box">
            <div class="system-message-icon">${type === 'success' ? '✓' : '!'}</div>
            <h2>${type === 'success' ? 'Success' : 'Notice'}</h2>
            <p>${escapeHtml(message)}</p>
            <button type="button" id="system-message-close">OK</button>
        </div>
    `;
    document.body.appendChild(popup);
    requestAnimationFrame(() => popup.classList.add('show'));
    popup.querySelector('#system-message-close').addEventListener('click', () => popup.remove());
}

function renderAccounts() {
    const accounts = selectedFilter === 'all'
        ? pendingAccounts
        : pendingAccounts.filter(account => account.account_type === selectedFilter);

    pendingAccountsList.innerHTML = accounts.length
        ? accounts.map(account => `
            <tr>
                <td>${escapeHtml(account.account_id)}</td>
                <td>${escapeHtml(accountName(account))}</td>
                <td><span class="type-pill ${(account.account_type || 'Client').toLowerCase()}">${escapeHtml(account.account_type || 'Client')}</span></td>
                <td><span class="status pending-approval">${escapeHtml(account.status || 'Pending')}</span></td>
                <td>
                    <button class="table-button view-account-btn" type="button" data-account-id="${escapeHtml(account.account_id)}">View</button>
                    <button class="approve-action row-decision-btn" type="button" data-account-id="${escapeHtml(account.account_id)}">Approve</button>
                    <button class="decline-action row-decision-btn" type="button" data-account-id="${escapeHtml(account.account_id)}">Reject</button>
                </td>
            </tr>
        `).join('')
        : '<tr><td colspan="5" style="text-align:center;">No pending accounts found.</td></tr>';

    pendingAccountsList.querySelectorAll('.view-account-btn').forEach(button => {
        button.addEventListener('click', () => {
            const account = pendingAccounts.find(item =>
                String(item.account_id) === String(button.dataset.accountId)
            );
            if (account) selectAccount(account);
        });
    });

    pendingAccountsList.querySelectorAll('.row-decision-btn').forEach(button => {
        button.addEventListener('click', () => {
            decideAccount(button.classList.contains('approve-action') ? 'approve' : 'decline', button.dataset.accountId);
        });
    });
}

async function loadPendingAccounts() {
    try {
        if (!localStorage.getItem('auth_token')) {
            showMessage('Your session has expired. Please log in again.', 'error');
            return;
        }

        const response = await fetch(`${API_URL}/admin/pending`, {
            headers: authHeaders()
        });
        const data = await response.json();

        if (response.status === 401) {
            showMessage('Your session has expired. Please log in again.', 'error');
            return;
        }

        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Failed to load pending accounts.');
        }

        pendingAccounts = Array.isArray(data.accounts) ? data.accounts : [];
        if (selectedAccountId && !pendingAccounts.some(account =>
            String(account.account_id) === String(selectedAccountId)
        )) {
            clearAccountDetails();
        }
        renderAccounts();
    } catch (error) {
        console.error('Failed to load pending accounts:', error);
        showMessage(error.message || 'Cannot connect to the server.', 'error');
    }
}

function selectAccount(account) {
    selectedAccountId = account.account_id;
    const details = {
        '#details-account-id': account.account_id || '—',
        '#details-name': accountName(account) || '—',
        '#details-type': account.account_type || '—',
        '#details-email': account.email || '—',
        '#details-phone': account.phone_number || account.phone || '—',
        '#details-position': account.position || account.role || '—',
        '#details-status': account.status || '—',
        '#details-created': account.created_at ? new Date(account.created_at).toLocaleString() : 'N/A'
    };

    Object.entries(details).forEach(([selector, value]) => {
        const element = document.querySelector(selector);
        if (element) element.textContent = value;
    });

    const modal = document.querySelector('#details-modal');
    modal.classList.add('visible');
    modal.setAttribute('aria-hidden', 'false');
    document.querySelector('#close-details')?.focus();
}

function closeDetailsModal() {
    const modal = document.querySelector('#details-modal');
    modal.classList.remove('visible');
    modal.setAttribute('aria-hidden', 'true');
}

function clearAccountDetails() {
    document.querySelectorAll('#details-content b').forEach(element => {
        element.textContent = '—';
    });
    closeDetailsModal();
    selectedAccountId = null;
}

async function decideAccount(decision, accountIdOverride = selectedAccountId) {
    if (!accountIdOverride || decisionInProgress) return;

    const accountId = accountIdOverride;
    decisionInProgress = true;
    pendingAccountsList.querySelectorAll('.row-decision-btn').forEach(button => {
        button.disabled = true;
    });

    try {
        const response = await fetch(`${API_URL}/personnel/${decision}/${encodeURIComponent(accountId)}`, {
            method: 'PUT',
            headers: authHeaders()
        });
        const data = await response.json();

        if (response.status === 401) {
            throw new Error('Your session has expired. Please log in again.');
        }

        if (!response.ok || !data.success) {
            throw new Error(data.message || `Failed to ${decision} account.`);
        }

        if (String(selectedAccountId) === String(accountId)) {
            clearAccountDetails();
        }
        showMessage(data.message || `Account ${accountId} ${decision === 'approve' ? 'approved' : 'rejected'} successfully.`);
        await loadPendingAccounts();
    } catch (error) {
        console.error(`${decision} account error:`, error);
        showMessage(error.message || 'Cannot connect to the server.', 'error');
    } finally {
        decisionInProgress = false;
        pendingAccountsList.querySelectorAll('.row-decision-btn').forEach(button => {
            button.disabled = false;
        });
    }
}

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        selectedFilter = button.dataset.filter;
        filterButtons.forEach(item => item.classList.toggle('active', item === button));
        renderAccounts();
    });
});

document.querySelector('#modal-x')?.addEventListener('click', closeDetailsModal);
document.querySelector('#close-details')?.addEventListener('click', closeDetailsModal);
document.querySelector('#details-modal')?.addEventListener('click', event => {
    if (event.target.id === 'details-modal') closeDetailsModal();
});
document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeDetailsModal();
});

loadPendingAccounts();
