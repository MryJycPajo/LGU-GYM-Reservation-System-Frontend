// =========================================
// CLIENT SERVICES
// =========================================

import { loadClientName } from './client-name.js';

const accountId = localStorage.getItem('account_id');

loadClientName();

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

const reservationService =
    document.querySelector('#reservation-service');

const reservationDate =
    document.querySelector('#reservation-date');

const reservationTime =
    document.querySelector('#reservation-time');

const reservationPurpose =
    document.querySelector('#reservation-purpose');

const reservationEndTime =
    document.querySelector('#reservation-end-time');

const reservationParticipants =
    document.querySelector('#reservation-participants');

const reservationDetails =
    document.querySelector('#reservation-details');

const submitReservationBtn =
    document.querySelector('#submit-reservation-btn');

// =========================================
// SUBMIT RESERVATION
// =========================================

if (submitReservationBtn) {

    submitReservationBtn.addEventListener('click', async () => {

        const service = reservationService.value.trim();
        const purpose = reservationPurpose.value.trim();
        const date = reservationDate.value;
        const startTime = reservationTime.value;
        const endTime = reservationEndTime.value;
        const participants = reservationParticipants.value.trim();
        const details = reservationDetails.value.trim();

        // =========================================
        // REQUIRED FIELDS
        // =========================================

        if (
            !service ||
            !purpose ||
            !date ||
            !startTime ||
            !endTime ||
            !participants ||
            !details
        ) {

            alert('Please fill in all reservation details.');

            return;
        }

        if (Number(participants) < 1) {
            alert('Number of participants must be at least 1.');
            return;
        }

        if (endTime <= startTime) {
            alert('End time must be later than start time.');
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
                        purpose: purpose,
                        reservation_date: date,
                        reservation_time: startTime,
                        end_time: endTime,
                        participants: Number(participants),
                        reservation_details: details

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
                reservationPurpose.value = '';
                reservationEndTime.value = '';
                reservationParticipants.value = '';
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