// =====================================
// CLIENT DASHBOARD JS
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
// GET LOGGED-IN CLIENT DATA
// =====================================

const clientData = JSON.parse(
    localStorage.getItem('client')
);

if (!clientData) {

    console.log('No client session found');

} else {

    // -----------------------------
    // CLIENT NAME
    // -----------------------------

    const fullName =
        `${clientData.firstname || ''} ${clientData.lastname || ''}`.trim();

    const nameElement =
        document.querySelector('#client-name');

    if (nameElement) {
        nameElement.textContent =
            fullName || 'Client';
    }


    // -----------------------------
    // PROFILE AVATAR
    // -----------------------------

    const avatar =
        document.querySelector('.profile-avatar');

    if (avatar && clientData.firstname) {

        avatar.textContent =
            clientData.firstname
                .charAt(0)
                .toUpperCase();

    }


    // -----------------------------
    // WELCOME MESSAGE
    // -----------------------------

    const welcomeTitle =
        document.querySelector('#welcome-title');

    if (welcomeTitle) {

        welcomeTitle.textContent =
            `Welcome, ${fullName || 'Client'}!`;

    }


    // =====================================
    // LOAD CLIENT RESERVATIONS
    // =====================================

    loadClientReservations(clientData.account_id);
}


// =====================================
// LOAD CLIENT RESERVATIONS
// =====================================

async function loadClientReservations(accountId) {

    if (!accountId) {

        console.error(
            'No account_id found in client session.'
        );

        return;
    }


    try {

        console.log(
            'Loading reservations for account:',
            accountId
        );


        const response = await fetch(
            `http://localhost:3001/api/reservations/${accountId}`
        );


        const data = await response.json();


        console.log(
            'Client reservations response:',
            data
        );


        if (!data.success) {

            console.error(
                data.message ||
                'Failed to load reservations.'
            );

            return;
        }


        const reservations =
            data.reservations || [];


        // =====================================
        // COUNT RESERVATIONS
        // =====================================

        const totalReservations =
            reservations.length;


        const pendingReservations =
            reservations.filter(
                reservation =>
                    reservation.status === 'Pending'
            ).length;


        const completedReservations =
            reservations.filter(
                reservation =>
                    reservation.status === 'Completed'
            ).length;


        // =====================================
        // DISPLAY COUNTS
        // =====================================

        const totalElement =
            document.querySelector(
                '#total-reservations'
            );

        if (totalElement) {

            totalElement.textContent =
                totalReservations;

        }


        const pendingElement =
            document.querySelector(
                '#pending-reservations'
            );

        if (pendingElement) {

            pendingElement.textContent =
                pendingReservations;

        }


        const completedElement =
            document.querySelector(
                '#completed-reservations'
            );

        if (completedElement) {

            completedElement.textContent =
                completedReservations;

        }


        // =====================================
        // RECENT RESERVATIONS
        // =====================================

        const recentList =
            document.querySelector(
                '#recent-reservations-list'
            );


        if (!recentList) {

            console.warn(
                'recent-reservations-list not found.'
            );

            return;
        }


        // No reservations
        if (reservations.length === 0) {

            recentList.innerHTML = `
                <tr>
                    <td colspan="3"
                        style="text-align: center;">
                        No reservations yet.
                    </td>
                </tr>
            `;

            return;
        }


        // Get latest 5 reservations
        const recentReservations =
            reservations.slice(0, 5);


        recentList.innerHTML =
            recentReservations.map(
                reservation => {

                    const date =
                        formatDate(
                            reservation.reservation_date
                        );


                    const statusClass =
                        getStatusClass(
                            reservation.status
                        );


                    return `
                        <tr>

                            <td>
                                ${date}
                            </td>

                            <td>
                                ${escapeHTML(
                                    reservation.service
                                )}
                            </td>

                            <td>
                                <span class="status ${statusClass}">
                                    ${reservation.status}
                                </span>
                            </td>

                        </tr>
                    `;

                }
            ).join('');


    } catch (error) {

        console.error(
            'Error loading client reservations:',
            error
        );

    }

}


// =====================================
// FORMAT DATE
// =====================================

function formatDate(dateValue) {

    if (!dateValue) {
        return '-';
    }


    const date =
        new Date(dateValue);


    if (isNaN(date.getTime())) {
        return dateValue;
    }


    return date.toLocaleDateString(
        'en-US',
        {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }
    );

}


// =====================================
// STATUS CLASS
// =====================================

function getStatusClass(status) {

    switch (status) {

        case 'Completed':
            return 'completed';

        case 'Approved':
            return 'approved';

        case 'Pending':
            return 'pending-approval';

        case 'Declined':
            return 'declined';

        default:
            return '';

    }

}


// =====================================
// ESCAPE HTML
// =====================================

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return '';
    }


    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

}


// =====================================
// CLIENT RESERVATION SUBMISSION
// =====================================

const submitReservationBtn =
    document.querySelector(
        '#submit-reservation-btn'
    );

const reservationService =
    document.querySelector(
        '#reservation-service'
    );

const reservationDate =
    document.querySelector(
        '#reservation-date'
    );

const reservationTime =
    document.querySelector(
        '#reservation-time'
    );

const reservationDetails =
    document.querySelector(
        '#reservation-details'
    );


if (submitReservationBtn) {

    submitReservationBtn.addEventListener(
        'click',
        async () => {

            // Check client session
            const client =
                JSON.parse(
                    localStorage.getItem('client')
                );


            if (!client) {

                alert(
                    'Please log in first.'
                );

                return;
            }


            // Check required fields
            if (
                !reservationService ||
                !reservationDate ||
                !reservationTime
            ) {

                console.error(
                    'Reservation form elements not found.'
                );

                return;
            }


            if (
                !reservationService.value ||
                !reservationDate.value ||
                !reservationTime.value
            ) {

                alert(
                    'Please complete the reservation details.'
                );

                return;
            }


            // Prepare reservation data
            const reservationData = {

                account_id:
                    client.account_id,

                service:
                    reservationService.value,

                reservation_date:
                    reservationDate.value,

                reservation_time:
                    reservationTime.value,

                reservation_details:
                    reservationDetails
                        ? reservationDetails.value
                        : null

            };


            console.log(
                'Sending reservation:',
                reservationData
            );


            try {

                const response =
                    await fetch(
                        'http://localhost:3001/api/reservations',
                        {
                            method: 'POST',

                            headers: {
                                'Content-Type':
                                    'application/json'
                            },

                            body:
                                JSON.stringify(
                                    reservationData
                                )
                        }
                    );


                const data =
                    await response.json();


                console.log(
                    'Reservation response:',
                    data
                );


                if (!data.success) {

                    alert(
                        data.message ||
                        'Failed to submit reservation.'
                    );

                    return;
                }


                alert(
                    `Reservation submitted successfully!\n\nReservation ID: ${data.reservation_id}`
                );


                // Clear form
                reservationDate.value = '';
                reservationTime.value = '';

                if (reservationDetails) {
                    reservationDetails.value = '';
                }


                // Refresh dashboard counts
                if (client.account_id) {
                    loadClientReservations(
                        client.account_id
                    );
                }


            } catch (error) {

                console.error(
                    'Reservation submission error:',
                    error
                );

                alert(
                    'Cannot connect to the server.'
                );

            }

        }
    );

}