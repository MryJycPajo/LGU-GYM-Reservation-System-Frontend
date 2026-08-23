
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

    // Personnel name
    const nameElement = document.querySelector('#personnel-name');

    if (nameElement) {
        nameElement.textContent =
            personnelData.firstname + ' ' +
            personnelData.lastname;
    }

    // Welcome message
    const welcomeName = document.querySelector('#welcome-name');

    if (welcomeName) {
        welcomeName.textContent =
            personnelData.firstname + ' ' +
            personnelData.lastname;
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


        const clients = data.clients || [];


        if (clients.length === 0) {

            table.innerHTML =
                '<tr><td colspan="4">No clients found.</td></tr>';

            return;
        }


        // Build table without template literals
        table.innerHTML = clients.map(function (client) {

            return (
                '<tr>' +

                '<td>' +
                (client.firstname || '') +
                ' ' +
                (client.lastname || '') +
                '</td>' +

                '<td>' +
                (client.email || '-') +
                '</td>' +

                '<td>' +
                (client.phone_number || '-') +
                '</td>' +

                '<td>' +
                '<span class="status">' +
                (client.status || '-') +
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


// =====================================
// RUN FUNCTIONS
// =====================================

loadDashboard();
loadClientList();

