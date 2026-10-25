const body = document.querySelector('#accounts-body');
const empty = document.querySelector('#empty-state');
const search = document.querySelector('#search-input');
const filter = document.querySelector('#filter-select');
const accountCount = document.querySelector('#account-count');

let users = [];
let loading = false;

function authHeaders() {
    const token = localStorage.getItem('auth_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

function requireLogin(message) {
    localStorage.removeItem('auth_token');
    alert(message);
    window.location.href = './login.html';
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function showTableMessage(message) {
    body.innerHTML = `<tr><td colspan="5" style="text-align:center;">${escapeHtml(message)}</td></tr>`;
    empty.hidden = true;
}

function render() {
    const keyword = search.value.toLowerCase().trim();
    const selected = filter.value;
    const filtered = users.filter(user => {
        const role = user.account_type || user.role || '';
        const status = user.status || '';
        const text = `${user.account_id || ''} ${user.username || ''} ${role} ${status}`.toLowerCase();

        if (keyword && !text.includes(keyword)) return false;
        if (selected === 'all') return true;
        if (selected === 'client') return role.toLowerCase() === 'client';
        if (selected === 'personnel') return role.toLowerCase() === 'personnel';
        return status.toLowerCase() === selected;
    });

    accountCount.textContent = `${filtered.length} account(s)`;
    empty.hidden = filtered.length > 0;

    if (!filtered.length) {
        body.innerHTML = '';
        return;
    }

    body.innerHTML = filtered.map(user => {
        const role = user.account_type || user.role || '-';
        const status = user.status || '-';

        return `
            <tr>
                <td>${escapeHtml(user.account_id || '-')}</td>
                <td>${escapeHtml(user.username || '-')}</td>
                <td>
                    <span class="password-mask">••••••••</span>
                    <button
                        class="password-toggle"
                        type="button"
                        data-account-id="${escapeHtml(user.account_id)}"
                        aria-label="Password is unavailable; use the secure password reset workflow"
                        aria-pressed="false"
                        title="Passwords cannot be revealed. Use the secure password reset workflow.">
                        ◉
                    </button>
                </td>
                <td>${escapeHtml(role)}</td>
                <td><span class="status ${status.toLowerCase() === 'pending' ? 'pending-approval' : status.toLowerCase()}">${escapeHtml(status)}</span></td>
            </tr>
        `;
    }).join('');
}

async function loadUsers() {
    if (loading) return;
    if (!localStorage.getItem('auth_token')) {
        requireLogin('Your session has expired. Please log in again.');
        return;
    }

    loading = true;
    showTableMessage('Loading accounts...');

    try {
        const response = await fetch(
            'http://localhost:3001/api/auth/accounts',
            { headers: authHeaders() }
        );
        const data = await response.json();

        if (response.status === 401) {
            requireLogin('Your session has expired. Please log in again.');
            return;
        }

        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Failed to load user accounts.');
        }

        users = Array.isArray(data.users) ? data.users : [];
        render();
    } catch (error) {
        console.error('Failed to load user accounts:', error);
        showTableMessage(error.message || 'Cannot connect to server.');
    } finally {
        loading = false;
    }
}

body.addEventListener('click', event => {
    const passwordToggle = event.target.closest('.password-toggle');
    if (!passwordToggle) return;

    const isShown = passwordToggle.getAttribute('aria-pressed') === 'true';
    passwordToggle.setAttribute('aria-pressed', String(!isShown));

    if (!isShown) {
        alert('Passwords are stored securely and cannot be revealed. Use the secure password reset workflow instead.');
    }
});

search.addEventListener('input', render);
filter.addEventListener('change', render);

document.querySelector('#menu-button').addEventListener('click', () => {
    document.querySelector('#sidebar').classList.toggle('open');
});

loadUsers();
