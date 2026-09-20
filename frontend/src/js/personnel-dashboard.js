
// =====================================
// PERSONNEL DASHBOARD
// =====================================

// SIDEBAR
const menuButton = document.querySelector('#menu-button');
const sidebar = document.querySelector('#sidebar');

if (menuButton && sidebar) {
    menuButton.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });
}


// =====================================
// GET LOGGED-IN PERSONNEL
// =====================================

const personnelData = JSON.parse(
    localStorage.getItem('personnel')
);

if (personnelData) {

    const fullName = `${personnelData.firstname || ''} ${personnelData.lastname || ''}`.trim();

    // Personnel name
    const nameElement = document.querySelector('#personnel-name');

    if (nameElement) {
        nameElement.textContent = fullName || 'Personnel';
    }

    const topbarName = document.querySelector('#topbar-personnel-name');

    if (topbarName) {
        topbarName.textContent = fullName || 'Personnel';
    }

    // Welcome message
    const welcomeName = document.querySelector('#welcome-name');

    if (welcomeName) {
        welcomeName.textContent = fullName || 'Personnel';
    }

    // Avatar
    const avatar = document.querySelector('.profile-avatar');

    if (avatar && personnelData.firstname) {
        avatar.textContent =
            personnelData.firstname
                .charAt(0)
                .toUpperCase();
    }

} else {

    console.log('No personnel session found.');

}


// =====================================
// LOAD PERSONNEL DASHBOARD
// =====================================

async function loadDashboard() {

    try {

        const response = await fetch(
            'http://localhost:3001/api/auth/accounts'
        );

        const data = await response.json();

        if (!data.success) {
            console.log('Failed to load accounts.');
            return;
        }

        const users = data.users || [];

        const clients = users.filter(
            user => user.account_type === 'Client'
        );


        // Total Clients
        const totalClients =
            document.querySelector('#totalClients');

        if (totalClients) {
            totalClients.textContent =
                clients.length;
        }


        // Pending Clients
        const pendingClients =
            document.querySelector('#pendingClients');

        if (pendingClients) {
            pendingClients.textContent =
                clients.filter(
                    client => client.status === 'Pending'
                ).length;
        }


        // Approved Clients
        const approvedClients =
            document.querySelector('#approvedClients');

        if (approvedClients) {
            approvedClients.textContent =
                clients.filter(
                    client => client.status === 'Approved'
                ).length;
        }

    } catch (error) {

        console.error(
            'Dashboard loading error:',
            error
        );

    }

}


// =====================================
// LOAD CLIENT LIST
// =====================================

async function loadClientList() {

    try {

        const response = await fetch(
            'http://localhost:3001/api/auth/clients'
        );

        const data = await response.json();

        const table =
            document.querySelector('#client-list');

        if (!table) {
            return;
        }


        if (!data.success) {

            table.innerHTML =
                '<tr><td colspan="4">Unable to load clients.</td></tr>';

            return;
        }


        const clients = (data.clients || [])
            .filter(client => client.status === 'Approved')
            .sort((firstClient, secondClient) => {
                return getApprovalTimestamp(secondClient) - getApprovalTimestamp(firstClient);
            });


        if (clients.length === 0) {

            table.innerHTML =
                '<tr><td colspan="4">No approved clients found.</td></tr>';

            return;
        }


        // Build the approved-client table with the newest approval first.
        table.innerHTML = clients.map(function (client, index) {

            return (
            '<tr class="' + (index === 0 ? 'newest-approved' : '') + '">' +

                '<td>' +
            escapeHtml((client.firstname || '') +
                ' ' +
            (client.lastname || '')) +
                '</td>' +

                '<td>' +
            escapeHtml(client.email || '-') +
                '</td>' +

                '<td>' +
            escapeHtml(client.phone_number || '-') +
                '</td>' +

                '<td>' +
            '<span class="status approved">' +
            'Approved' +
                '</span>' +
                '</td>' +

                '</tr>'
            );

        }).join('');

    } catch (error) {

        console.error(
            'Client list loading error:',
            error
        );

    }

}

function getApprovalTimestamp(client) {
    const timestamp = client.approved_at ||
        client.approvedAt ||
        client.updated_at ||
        client.updatedAt ||
        client.created_at ||
        client.createdAt;
    const parsedTimestamp = timestamp ? Date.parse(timestamp) : 0;
    return Number.isNaN(parsedTimestamp) ? 0 : parsedTimestamp;
}

function escapeHtml(value) {
    return String(value ?? '-')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}


// =====================================
// RUN FUNCTIONS
// =====================================

loadDashboard();
loadClientList();

