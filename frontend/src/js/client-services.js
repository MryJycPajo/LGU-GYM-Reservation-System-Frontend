// =========================================
// CLIENT SERVICES
// =========================================

const accountId = localStorage.getItem('account_id');

// =========================================
// CHECK LOGIN SESSION
// =========================================

if (!accountId) {
    alert('Your account session was not found. Please login again.');
    window.location.href = '../login.html';
}

// =========================================
// ELEMENTS
// =========================================

const selectServiceBtn =
    document.querySelector('#select-service-btn');

const reservationService =
    document.querySelector('#reservation-service');

const reservationDate =
    document.querySelector('#reservation-date');

const reservationTime =
    document.querySelector('#reservation-time');

const reservationDetails =
    document.querySelector('#reservation-details');

const submitReservationBtn =
    document.querySelector('#submit-reservation-btn');

// =========================================
// SELECT SERVICE
// =========================================

if (selectServiceBtn) {

    selectServiceBtn.addEventListener('click', () => {

        reservationService.focus();

        reservationService.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });

    });

}

// =========================================
// SUBMIT RESERVATION
// =========================================

if (submitReservationBtn) {

    submitReservationBtn.addEventListener('click', async () => {

        const service = reservationService.value.trim();
        const date = reservationDate.value;
        const time = reservationTime.value;
        const details = reservationDetails.value.trim();

        // =========================================
        // REQUIRED FIELDS
        // =========================================

        if (!service || !date || !time || !details) {

            alert('Please fill in all reservation details.');

            return;
        }

        // =========================================
        // CHECK DATE
        // =========================================

        const selectedDate = new Date(date);
        const today = new Date();

        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {

            alert('Please select a future reservation date.');

            return;
        }

        // =========================================
        // SEND TO BACKEND
        // =========================================

        try {

            const response = await fetch(
                'http://localhost:3001/api/reservations',
                {
                    method: 'POST',

                    headers: {
                        'Content-Type': 'application/json'
                    },

                    body: JSON.stringify({

                        account_id: accountId,
                        service: service,
                        reservation_date: date,
                        reservation_time: time,
                        details: details

                    })
                }
            );

            const data = await response.json();

            console.log(
                'RESERVATION RESPONSE:',
                data
            );

            if (data.success) {

showMessage(
    'Reservation Submitted!',
    'Reservation submitted successfully! Please wait for approval.',
    '✓'
);

                reservationDate.value = '';
                reservationTime.value = '';
                reservationDetails.value = '';

            } else {

                alert(
                    data.message ||
                    'Failed to submit reservation.'
                );

            }

        } catch (error) {

            console.error(
                'RESERVATION ERROR:',
                error
            );

            alert(
                'Cannot connect to the server.'
            );

        }

    });

}

// =========================================
// CUSTOM CENTER MESSAGE
// =========================================

function showMessage(title, message, icon = '✓') {

    const overlay =
        document.querySelector('#message-overlay');

    const messageTitle =
        document.querySelector('#message-title');

    const messageText =
        document.querySelector('#message-text');

    const messageIcon =
        document.querySelector('#message-icon');

    const okButton =
        document.querySelector('#message-ok-btn');

    if (!overlay) {
        return;
    }

    messageTitle.textContent = title;
    messageText.textContent = message;
    messageIcon.textContent = icon;

    overlay.classList.add('show');

    okButton.onclick = () => {
        overlay.classList.remove('show');
    };
}