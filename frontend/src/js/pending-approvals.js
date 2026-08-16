const pendingAccountsList = document.querySelector('#pending-accounts-list');
const approveButton = document.querySelector('#approve-account-btn');
const declineButton = document.querySelector('#decline-account-btn');

let selectedAccountId = null;


// =====================================
// CENTER POPUP
// =====================================

function showMessage(message, type = 'success') {

    // Remove old popup if naa
    const oldPopup = document.querySelector('#system-message');

    if (oldPopup) {
        oldPopup.remove();
    }

    // Create popup
    const popup = document.createElement('div');

    popup.id = 'system-message';

    popup.innerHTML = `
        <div class="system-message-box">

            <div class="system-message-icon">
                ${type === 'success' ? '✓' : '!'}
            </div>

            <h2>
                ${type === 'success' ? 'Success' : 'Notice'}
            </h2>

            <p>${message}</p>

            <button type="button" id="system-message-close">
                OK
            </button>

        </div>
    `;

    document.body.appendChild(popup);

    // Show popup
    requestAnimationFrame(() => {
        popup.classList.add('show');
    });

    // Close
    popup.querySelector('#system-message-close')
        .addEventListener('click', () => {
            popup.remove();
        });
}


// =====================================
// LOAD PENDING ACCOUNTS
// =====================================

async function loadPendingAccounts() {

    try {

        const response = await fetch(
            'http://localhost:3001/api/admin/pending'
        );

        const data = await response.json();

        console.log('Pending accounts:', data);

        if (!data.success) {

            showMessage(
                data.message || 'Failed to load accounts.',
                'error'
            );

            return;
        }

        pendingAccountsList.innerHTML = '';

        // No pending accounts
        if (!data.accounts || data.accounts.length === 0) {

            pendingAccountsList.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align:center;">
                        No pending accounts found.
                    </td>
                </tr>
            `;

            approveButton.disabled = true;
            declineButton.disabled = true;

             clearAccountDetails();

            return;
        }


        // =====================================
        // DISPLAY ACCOUNTS
        // =====================================

        data.accounts.forEach(account => {

            const row = document.createElement('tr');

            const fullName =
                `${account.firstname || ''} ${account.middlename || ''} ${account.lastname || ''}`
                    .replace(/\s+/g, ' ')
                    .trim();

            const typeClass =
                (account.account_type || 'Client').toLowerCase();

            row.innerHTML = `
                <td>${account.account_id}</td>

                <td>${fullName}</td>

                <td>
                    <span class="type-pill ${typeClass}">
                        ${account.account_type}
                    </span>
                </td>

                <td>
                    <span class="status pending-approval">
                        ${account.status}
                    </span>
                </td>

                <td>
                    <button
                        class="table-button view-account-btn"
                        type="button"
                        data-account-id="${account.account_id}">
                        View
                    </button>
                </td>
            `;

            pendingAccountsList.appendChild(row);

        });


        // =====================================
        // VIEW BUTTONS
        // =====================================

        document
            .querySelectorAll('.view-account-btn')
            .forEach(button => {

                button.addEventListener('click', () => {

                    const accountId =
                        button.dataset.accountId;

                    const account =
                        data.accounts.find(
                            item =>
                                String(item.account_id) ===
                                String(accountId)
                        );

                    if (!account) return;

                    selectAccount(account);
                });

            });

    } catch (error) {

        console.error(
            'Failed to load pending accounts:',
            error
        );

        showMessage(
            'Cannot connect to the server.',
            'error'
        );
    }
}


// =====================================
// SELECT ACCOUNT
// =====================================

function selectAccount(account) {

    selectedAccountId = account.account_id;

    const fullName =
        `${account.firstname || ''} ${account.middlename || ''} ${account.lastname || ''}`
            .replace(/\s+/g, ' ')
            .trim();

    const detailsCard =
        document.querySelector('.details-card');

    if (!detailsCard) return;

    const details =
        detailsCard.querySelectorAll(
            '.details-grid > div'
        );

    details[0].querySelector('b').textContent =
        account.account_id;

    details[1].querySelector('b').textContent =
        fullName;

    details[2].querySelector('b').textContent =
        account.account_type;

    details[3].querySelector('b').textContent =
        account.status;

    details[4].querySelector('b').textContent =
        account.created_by || 'Personnel';

    details[5].querySelector('b').textContent =
        account.created_at
            ? new Date(account.created_at).toLocaleDateString()
            : 'N/A';

    details[6].querySelector('b').textContent =
        'Waiting for Admin Approval';

    approveButton.disabled = false;
    declineButton.disabled = false;

    console.log('Selected account:', account.account_id);
}

// =====================================
// CLEAR ACCOUNT DETAILS
// =====================================

function clearAccountDetails() {

    const detailsCard = document.querySelector('.details-card');

    if (!detailsCard) return;

    const details = detailsCard.querySelectorAll(
        '.details-grid > div'
    );

    details[0].querySelector('b').textContent = '—';
    details[1].querySelector('b').textContent = '—';
    details[2].querySelector('b').textContent = '—';
    details[3].querySelector('b').textContent = '—';
    details[4].querySelector('b').textContent = '—';
    details[5].querySelector('b').textContent = '—';

    details[6].querySelector('b').textContent =
        'Select a pending account to review.';

    selectedAccountId = null;

    approveButton.disabled = true;
    declineButton.disabled = true;
}


// =====================================
// APPROVE
// =====================================

approveButton.addEventListener('click', async () => {

    if (!selectedAccountId) {

        showMessage(
            'Please select an account first.',
            'error'
        );

        return;
    }

    const accountId = selectedAccountId;

    try {

        approveButton.disabled = true;
        declineButton.disabled = true;

        const response = await fetch(
            `http://localhost:3001/api/personnel/approve/${accountId}`,
            {
                method: 'PUT'
            }
        );

        const data = await response.json();

        console.log('Approve response:', data);

        if (!data.success) {

            showMessage(
                data.message || 'Failed to approve account.',
                'error'
            );

            approveButton.disabled = false;
            declineButton.disabled = false;

            return;
        }

        selectedAccountId = null;

clearAccountDetails();

// SHOW POPUP
showMessage(
    `Account ${accountId} approved successfully.`,
    'success'
);

// Refresh table
await loadPendingAccounts();

    } catch (error) {

        console.error('Approve error:', error);

        showMessage(
            'Cannot connect to the server.',
            'error'
        );

    }

});


// =====================================
// DECLINE
// =====================================

declineButton.addEventListener('click', async () => {

    if (!selectedAccountId) {

        showMessage(
            'Please select an account first.',
            'error'
        );

        return;
    }

    const accountId = selectedAccountId;

    try {

        approveButton.disabled = true;
        declineButton.disabled = true;

        const response = await fetch(
            `http://localhost:3001/api/personnel/decline/${accountId}`,
            {
                method: 'PUT'
            }
        );

        const data = await response.json();

        console.log('Decline response:', data);

        if (!data.success) {

            showMessage(
                data.message || 'Failed to decline account.',
                'error'
            );

            approveButton.disabled = false;
            declineButton.disabled = false;

            return;
        }

clearAccountDetails();

showMessage(
    `Account ${accountId} declined successfully.`,
    'success'
);

await loadPendingAccounts();

    } catch (error) {

        console.error('Decline error:', error);

        showMessage(
            'Cannot connect to the server.',
            'error'
        );

    }

});


// =====================================
// INITIAL STATE
// =====================================

approveButton.disabled = true;
declineButton.disabled = true;


// =====================================
// START
// =====================================

loadPendingAccounts();