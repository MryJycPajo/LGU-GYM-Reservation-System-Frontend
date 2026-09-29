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

const reservationPurpose =
    document.querySelector('#reservation-purpose');

const reservationParticipants =
    document.querySelector('#reservation-participants');

const reservationDetails =
    document.querySelector('#reservation-details');

const submitReservationBtn =
    document.querySelector('#submit-reservation-btn');

const reservationDateMessage =
    document.querySelector('#reservation-date-message');

const RESERVATION_START_TIME = '08:00:00';
const RESERVATION_END_TIME = '22:00:00';
const RESERVATIONS_API_URL = 'http://localhost:3001/api/reservations';
const DUPLICATE_DATE_MESSAGE = 'Sorry, this date is already reserved. Please select another available date.';
const INACTIVE_RESERVATION_STATUSES = new Set([
    'Declined',
    'Rejected',
    'Cancelled',
    'Completed'
]);

function setDateAvailabilityMessage(message = '') {
    if (!reservationDateMessage) {
        return;
    }

    reservationDateMessage.textContent = message;
    reservationDateMessage.style.display = message ? 'block' : 'none';
    reservationDateMessage.style.marginTop = '.35rem';
    reservationDateMessage.style.color = '#b42318';
}

function showDateUnavailableMessage() {
    showMessage(
        'Reservation Date Unavailable',
        DUPLICATE_DATE_MESSAGE,
        '!'
    );
}

async function isDateReserved(date) {
    const response = await fetch(RESERVATIONS_API_URL);
    const data = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to check reservation availability.');
    }

    return (data.reservations || []).some((reservation) => {
        const reservationDate = String(reservation.reservation_date || '').slice(0, 10);
        const status = String(reservation.status || '').trim();

        return reservationDate === date && !INACTIVE_RESERVATION_STATUSES.has(status);
    });
}

if (reservationDate) {
    reservationDate.addEventListener('change', async () => {
        const date = reservationDate.value;

        setDateAvailabilityMessage('');

        if (!date) {
            return;
        }

        try {
            if (await isDateReserved(date) && reservationDate.value === date) {
                showDateUnavailableMessage();
            }
        } catch (error) {
            console.error('DATE AVAILABILITY ERROR:', error);
            setDateAvailabilityMessage(
                'Unable to verify this date. Please try again before submitting.'
            );
        }
    });
}

// =========================================
// SUBMIT RESERVATION
// =========================================

if (submitReservationBtn) {

    submitReservationBtn.addEventListener('click', async () => {

        const service = reservationService.value.trim();
        const purpose = reservationPurpose.value.trim();
        const date = reservationDate.value;
        const participants = reservationParticipants.value.trim();
        const details = reservationDetails.value.trim();

        // =========================================
        // REQUIRED FIELDS
        // =========================================

        if (
            !service ||
            !purpose ||
            !date ||
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

        try {
            if (await isDateReserved(date)) {
                showDateUnavailableMessage();
                return;
            }
        } catch (error) {
            console.error('DATE AVAILABILITY ERROR:', error);
            alert('Unable to verify reservation availability. Please try again.');
            return;
        }

        // =========================================
        // SEND TO BACKEND
        // =========================================

        try {

            const response = await fetch(
                RESERVATIONS_API_URL,
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
                        reservation_time: RESERVATION_START_TIME,
                        start_time: RESERVATION_START_TIME,
                        end_time: RESERVATION_END_TIME,
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
                reservationPurpose.value = '';
                reservationParticipants.value = '';
                reservationDetails.value = '';
                setDateAvailabilityMessage('');

            } else {

                if (data.message === DUPLICATE_DATE_MESSAGE) {
                    showDateUnavailableMessage();
                } else {
                    alert(
                        data.message ||
                        'Failed to submit reservation.'
                    );
                }

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