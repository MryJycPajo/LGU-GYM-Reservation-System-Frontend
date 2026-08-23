// =========================================
// CLIENT PROFILE
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
// LOAD CLIENT PROFILE
// =========================================

async function loadClientProfile() {

    try {

        const response = await fetch(
            `http://localhost:3001/api/auth/clients/${accountId}`
        );

        const data = await response.json();

        console.log('CLIENT PROFILE RESPONSE:', data);

        if (!data.success) {
            alert(data.message || 'Unable to load your profile.');
            return;
        }

        const client = data.client;

        // Save client data temporarily
        window.currentClientProfile = client;

        // =========================================
        // DISPLAY PROFILE
        // =========================================

        document.querySelector('#profile-client-id').textContent =
            client.account_id || '-';

        document.querySelector('#profile-status').textContent =
            client.status || '-';

        document.querySelector('#profile-lastname').textContent =
            client.lastname || '-';

        document.querySelector('#profile-firstname').textContent =
            client.firstname || '-';

        document.querySelector('#profile-middlename').textContent =
            client.middlename || '-';

        document.querySelector('#profile-birthdate').textContent =
            formatDisplayDate(client.birthdate);

        document.querySelector('#profile-gender').textContent =
            client.gender || '-';

        document.querySelector('#profile-address').textContent =
            client.address || '-';

        document.querySelector('#profile-email').textContent =
            client.email || '-';

        document.querySelector('#profile-phone').textContent =
            client.phone_number || '-';

        document.querySelector('#profile-username').textContent =
            client.username || '-';

        // =========================================
        // CLIENT NAME IN TOPBAR
        // =========================================

        const clientName = document.querySelector('#client-name');

        if (clientName) {

            const fullName = [
                client.firstname,
                client.lastname
            ]
                .filter(Boolean)
                .join(' ');

            clientName.textContent = fullName || 'Client';
        }

    } catch (error) {

        console.error('CLIENT PROFILE ERROR:', error);

        alert('Cannot connect to the server.');
    }
}


// =========================================
// EDIT PROFILE
// =========================================

const editProfileButton =
    document.querySelector('#edit-profile-btn');

if (editProfileButton) {

    editProfileButton.addEventListener('click', startEditProfile);
}


// =========================================
// START EDIT PROFILE
// =========================================

function startEditProfile() {

    const client = window.currentClientProfile;

    if (!client) {
        alert('Profile data is not loaded yet.');
        return;
    }

    console.log('EDITING CLIENT:', client);

    // =========================================
    // LAST NAME
    // =========================================

    document.querySelector('#profile-lastname').innerHTML = `
        <input
            type="text"
            id="edit-lastname"
            value="${escapeHtml(client.lastname || '')}"
        >
    `;

    // =========================================
    // FIRST NAME
    // =========================================

    document.querySelector('#profile-firstname').innerHTML = `
        <input
            type="text"
            id="edit-firstname"
            value="${escapeHtml(client.firstname || '')}"
        >
    `;

    // =========================================
    // MIDDLE NAME
    // =========================================

    document.querySelector('#profile-middlename').innerHTML = `
        <input
            type="text"
            id="edit-middlename"
            value="${escapeHtml(client.middlename || '')}"
        >
    `;

    // =========================================
    // BIRTHDATE
    // =========================================

    document.querySelector('#profile-birthdate').innerHTML = `
        <input
            type="date"
            id="edit-birthdate"
            value="${formatDateForInput(client.birthdate)}"
        >
    `;

    // =========================================
    // GENDER
    // =========================================

    document.querySelector('#profile-gender').innerHTML = `
        <select id="edit-gender">
            <option value="">Select Gender</option>

            <option
                value="Male"
                ${client.gender === 'Male' ? 'selected' : ''}
            >
                Male
            </option>

            <option
                value="Female"
                ${client.gender === 'Female' ? 'selected' : ''}
            >
                Female
            </option>
        </select>
    `;

    // =========================================
    // ADDRESS
    // =========================================

    document.querySelector('#profile-address').innerHTML = `
        <input
            type="text"
            id="edit-address"
            value="${escapeHtml(client.address || '')}"
        >
    `;

    // =========================================
    // EMAIL
    // =========================================

    document.querySelector('#profile-email').innerHTML = `
        <input
            type="email"
            id="edit-email"
            value="${escapeHtml(client.email || '')}"
        >
    `;

    // =========================================
    // PHONE
    // =========================================

    document.querySelector('#profile-phone').innerHTML = `
        <input
            type="text"
            id="edit-phone"
            value="${escapeHtml(client.phone_number || '')}"
        >
    `;

    // =========================================
    // USERNAME
    // =========================================

    document.querySelector('#profile-username').innerHTML = `
        <input
            type="text"
            id="edit-username"
            value="${escapeHtml(client.username || '')}"
        >
    `;

    // =========================================
    // CHANGE BUTTON
    // =========================================

    editProfileButton.textContent = 'Save Changes';

    editProfileButton.removeEventListener(
        'click',
        startEditProfile
    );

    editProfileButton.addEventListener(
        'click',
        saveProfile
    );

}


// =========================================
// SAVE PROFILE
// =========================================

async function saveProfile() {

    const accountId =
        localStorage.getItem('account_id');

    if (!accountId) {

        alert(
            'Your account session was not found. Please login again.'
        );

        window.location.href =
            '../login.html';

        return;
    }

    // =========================================
    // GET INPUTS
    // =========================================

    const lastnameInput =
        document.querySelector('#edit-lastname');

    const firstnameInput =
        document.querySelector('#edit-firstname');

    const middlenameInput =
        document.querySelector('#edit-middlename');

    const birthdateInput =
        document.querySelector('#edit-birthdate');

    const genderInput =
        document.querySelector('#edit-gender');

    const addressInput =
        document.querySelector('#edit-address');

    const emailInput =
        document.querySelector('#edit-email');

    const phoneInput =
        document.querySelector('#edit-phone');

    const usernameInput =
        document.querySelector('#edit-username');


    console.log('EDIT INPUTS:', {
        lastnameInput,
        firstnameInput,
        middlenameInput,
        birthdateInput,
        genderInput,
        addressInput,
        emailInput,
        phoneInput,
        usernameInput
    });


    // =========================================
    // CHECK INPUTS
    // =========================================

    if (
        !lastnameInput ||
        !firstnameInput ||
        !middlenameInput ||
        !birthdateInput ||
        !genderInput ||
        !addressInput ||
        !emailInput ||
        !phoneInput ||
        !usernameInput
    ) {

        alert(
            'Profile edit fields were not found. Please refresh the page and try again.'
        );

        return;
    }


    // =========================================
    // GET VALUES
    // =========================================

    const lastname =
        lastnameInput.value.trim();

    const firstname =
        firstnameInput.value.trim();

    const middlename =
        middlenameInput.value.trim();

    const birthdate =
        birthdateInput.value;

    const gender =
        genderInput.value;

    const address =
        addressInput.value.trim();

    const email =
        emailInput.value.trim();

    const phoneNumber =
        phoneInput.value.trim();

    const username =
        usernameInput.value.trim();


    console.log(
        'PROFILE DATA TO SAVE:',
        {
            accountId,
            lastname,
            firstname,
            middlename,
            birthdate,
            gender,
            address,
            email,
            phoneNumber,
            username
        }
    );


    // =========================================
    // REQUIRED FIELDS
    // =========================================

    if (
        lastname === '' ||
        firstname === '' ||
        birthdate === '' ||
        gender === '' ||
        address === '' ||
        email === '' ||
        phoneNumber === '' ||
        username === ''
    ) {

        alert(
            'Please fill in all required fields.'
        );

        return;
    }


    // =========================================
    // SEND UPDATE TO BACKEND
    // =========================================

    try {

        const response = await fetch(
            `http://localhost:3001/api/auth/clients/${accountId}`,
            {
                method: 'PUT',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify({

                    lastname,
                    firstname,
                    middlename,
                    birthdate,
                    gender,
                    address,
                    email,
                    phone_number: phoneNumber,
                    username

                })
            }
        );


        const data =
            await response.json();


        console.log(
            'UPDATE PROFILE RESPONSE:',
            data
        );


if (data.success) {

    showMessage(
        'Profile Updated!',
        'Your profile information has been updated successfully.'
    );

} else {

    showMessage(
        'Update Failed',
        data.message || 'Failed to update profile.',
        '!'
    );
}


    } catch (error) {

        console.error(
            'UPDATE PROFILE ERROR:',
            error
        );

        alert(
            'Cannot connect to the server.'
        );
    }

}


// =========================================
// FORMAT DATE FOR INPUT
// =========================================

function formatDateForInput(value) {

    if (!value || value === '-') {
        return '';
    }

    const dateString =
        String(value);

    // Example:
    // 2003-07-07T16:00:00.000Z

    if (dateString.includes('T')) {

        return dateString
            .split('T')[0];
    }

    // Already YYYY-MM-DD

    if (
        /^\d{4}-\d{2}-\d{2}$/.test(
            dateString
        )
    ) {

        return dateString;
    }

    return '';
}


// =========================================
// FORMAT DATE FOR DISPLAY
// =========================================

function formatDisplayDate(value) {

    if (!value || value === '-') {
        return '-';
    }

    const dateString =
        String(value);

    if (dateString.includes('T')) {

        return dateString
            .split('T')[0];
    }

    return dateString;
}


// =========================================
// ESCAPE HTML
// =========================================

function escapeHtml(value) {

    return String(value)

        .replace(/&/g, '&amp;')

        .replace(/</g, '&lt;')

        .replace(/>/g, '&gt;')

        .replace(/"/g, '&quot;')

        .replace(/'/g, '&#039;');
}


// =========================================
// LOAD PROFILE
// =========================================

if (accountId) {

    loadClientProfile();
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