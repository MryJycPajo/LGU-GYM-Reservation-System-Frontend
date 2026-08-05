async function loadDashboard() {

    try {

        const response = await fetch(
            'http://localhost:3001/api/auth/accounts'
        );

        const data = await response.json();

        if (!data.success) return;

        const clients = data.users.filter(
            u => u.account_type === 'Client'
        );

        document.querySelector('#totalClients').textContent =
            clients.length;

        document.querySelector('#pendingClients').textContent =
            clients.filter(c => c.status === 'Pending').length;

        document.querySelector('#approvedClients').textContent =
            clients.filter(c => c.status === 'Approved').length;

    } catch (err) {

        console.log(err);

    }

}

loadDashboard();