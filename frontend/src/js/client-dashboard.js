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