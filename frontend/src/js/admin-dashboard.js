async function loadDashboard() {

    try {

        const response = await fetch(
            'http://localhost:3001/api/auth/dashboard'
        );

        const data = await response.json();

        if (!data.success) return;

        document.querySelector('#total-clients').textContent =
            data.totalClients;

        document.querySelector('#total-personnel').textContent =
            data.totalPersonnel;

        document.querySelector('#pending-personnel').textContent =
            data.pending;

        document.querySelector('#approved-accounts').textContent =
            data.approved;

    } catch (err) {

        console.error(err);

    }

}

loadDashboard();

document.querySelector('#menu-button')
.addEventListener('click', () => {

    document.querySelector('#sidebar')
    .classList.toggle('open');

});

// =====================================
// LOAD PENDING ACCOUNTS
// =====================================

async function loadPendingAccounts() {

    const pendingList =
        document.querySelector('#dashboard-pending-list');

    if (!pendingList) return;

    try {

        const response = await fetch(
            'http://localhost:3001/api/admin/pending'
        );

        const data = await response.json();

        if (!data.success) {

            console.error(data.message);

            return;
        }

        pendingList.innerHTML = '';

        // No pending accounts
        if (!data.accounts || data.accounts.length === 0) {

            pendingList.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align:center;">
                        No pending accounts.
                    </td>
                </tr>
            `;

            return;
        }

        // Display pending accounts
        data.accounts.forEach(account => {

            const row = document.createElement('tr');

            const fullName =
                `${account.firstname || ''} ${account.middlename || ''} ${account.lastname || ''}`
                    .replace(/\s+/g, ' ')
                    .trim();

            const typeClass =
                (account.account_type || 'Client').toLowerCase();

            row.innerHTML = `
                <td>
                    ${account.account_id}
                </td>

                <td>
                    ${fullName}
                </td>

                <td>
                    <span class="type-pill ${typeClass}">
                        ${account.account_type}
                    </span>
                </td>

                <td>
                    <a
                        class="table-button"
                        href="./pending-approvals.html">
                        View
                    </a>
                </td>
            `;

            pendingList.appendChild(row);

        });

    } catch (error) {

        console.error(
            'Failed to load dashboard pending accounts:',
            error
        );

        pendingList.innerHTML = `
            <tr>
                <td colspan="4" style="text-align:center;">
                    Unable to load pending accounts.
                </td>
            </tr>
        `;
    }
}

loadPendingAccounts();