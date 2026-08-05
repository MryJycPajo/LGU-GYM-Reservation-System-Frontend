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