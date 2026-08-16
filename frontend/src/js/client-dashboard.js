// CLIENT DASHBOARD JS

const menuButton = document.querySelector('#menu-button');
const sidebar = document.querySelector('#sidebar');


// SIDEBAR TOGGLE
if (menuButton) {

    menuButton.addEventListener('click', () => {

        sidebar.classList.toggle('open');

    });

}



// GET LOGGED IN CLIENT DATA
const clientData = JSON.parse(
    localStorage.getItem('client')
);



if (clientData) {


    const nameElement = document.querySelector('#client-name');


    if (nameElement) {

        nameElement.textContent =
            `${clientData.firstname} ${clientData.lastname}`;

    }



    const avatar =
        document.querySelector('.profile-avatar');


    if (avatar && clientData.firstname) {

        avatar.textContent =
            clientData.firstname.charAt(0).toUpperCase();

    }



} else {


    console.log("No client session found");


}



// RESERVATION PLACEHOLDER
const reservationList =
document.querySelector('#reservation-list');


if (reservationList) {


    reservationList.innerHTML = `

        <div class="empty-state">

            <span>▣</span>

            <h2>No reservations yet</h2>

            <p>
            You don't have any gym reservations.
            </p>

        </div>

    `;


}

// =====================================
// CLIENT RESERVATION SUBMISSION
// =====================================

const submitReservationBtn =
    document.querySelector('#submit-reservation-btn');

const reservationService =
    document.querySelector('#reservation-service');

const reservationDate =
    document.querySelector('#reservation-date');

const reservationTime =
    document.querySelector('#reservation-time');

const reservationDetails =
    document.querySelector('#reservation-details');


if (submitReservationBtn) {

    submitReservationBtn.addEventListener('click', async () => {

        // Check client session
        const client = JSON.parse(
            localStorage.getItem('client')
        );

        if (!client) {

            alert('Please log in first.');

            return;
        }


        // Check required fields
        if (
            !reservationService.value ||
            !reservationDate.value ||
            !reservationTime.value
        ) {

            alert('Please complete the reservation details.');

            return;
        }


        // Prepare reservation data
        const reservationData = {

            account_id: client.account_id,

            service: reservationService.value,

            reservation_date: reservationDate.value,

            reservation_time: reservationTime.value,

            reservation_details:
                reservationDetails.value

        };


        console.log(
            'Sending reservation:',
            reservationData
        );


        try {

            const response = await fetch(
                'http://localhost:3001/api/reservations',
                {
                    method: 'POST',

                    headers: {
                        'Content-Type': 'application/json'
                    },

                    body: JSON.stringify(reservationData)
                }
            );


            const data = await response.json();


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
            reservationDetails.value = '';


        } catch (error) {

            console.error(
                'Reservation submission error:',
                error
            );

            alert(
                'Cannot connect to the server.'
            );

        }

    });

}