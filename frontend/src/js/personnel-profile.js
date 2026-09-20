// =====================================
// PERSONNEL PROFILE
// =====================================

document.addEventListener('DOMContentLoaded', () => {

    // =====================================
    // GET LOGGED-IN PERSONNEL
    // =====================================

    const personnelData = localStorage.getItem('personnel');

    console.log('PERSONNEL LOCALSTORAGE:', personnelData);

    if (!personnelData) {
        console.error('No personnel session found.');
        return;
    }

    let personnel;

    try {
        personnel = JSON.parse(personnelData);
    } catch (error) {
        console.error('Invalid personnel data:', error);
        return;
    }

    console.log('Logged-in personnel:', personnel);


    // =====================================
    // TOPBAR NAME
    // =====================================

    updateTopbar(personnel);


    // =====================================
    // DISPLAY PROFILE
    // =====================================

    loadProfile(personnel);


    // =====================================
    // EDIT BUTTON
    // =====================================

   const editButton = document.getElementById(
    'edit-personnel-profile-btn'
);

if (editButton) {

    editButton.onclick = () => {

        console.log('Edit Profile clicked');

        enableEditMode(personnel);

    };

} else {

    console.error(
        'Edit Profile button not found.'
    );

}
});


// =====================================
// UPDATE TOPBAR
// =====================================

function updateTopbar(personnel) {

    const fullName =
        `${personnel.firstname || ''} ${personnel.lastname || ''}`.trim();

    const topbarName =
        document.querySelector('#topbar-personnel-name');

    if (topbarName) {
        topbarName.textContent =
            fullName || 'Personnel';
    }


    // =====================================
    // AVATAR
    // =====================================

    const avatar =
        document.querySelector('#profile-avatar');

    if (avatar && personnel.firstname) {

        avatar.textContent =
            personnel.firstname
                .charAt(0)
                .toUpperCase();

    }

}


// =====================================
// LOAD PROFILE
// =====================================

function loadProfile(personnel) {

    setText(
        'personnel-id',
        personnel.account_id || personnel.personnel_id
    );

    setStatus(
        'personnel-status',
        personnel.status
    );

    setText(
        'personnel-role',
        personnel.position ||
        personnel.role ||
        'LGU Gym Staff'
    );

    setText(
        'personnel-lastname',
        personnel.lastname
    );

    setText(
        'personnel-firstname',
        personnel.firstname
    );

    setText(
        'personnel-middlename',
        personnel.middlename
    );

    setText(
        'personnel-birthdate',
        formatBirthdate(personnel.birthdate)
    );

    setText(
        'personnel-gender',
        personnel.gender
    );

    setText(
        'personnel-address',
        personnel.address
    );

    setText(
        'personnel-email',
        personnel.email
    );

    setText(
        'personnel-phone',
        personnel.phone_number ||
        personnel.phone
    );

    setText(
        'personnel-username',
        personnel.username
    );

}


// =====================================
// EDIT MODE
// =====================================

function enableEditMode(personnel) {

    const editButton =
        document.getElementById(
            'edit-personnel-profile-btn'
        );

    if (!editButton) {
        return;
    }


    // =====================================
    // EDITABLE FIELDS
    // =====================================

    const fields = [

        {
            id: 'personnel-lastname',
            key: 'lastname',
            type: 'text',
            placeholder: 'Enter last name'
        },

        {
            id: 'personnel-firstname',
            key: 'firstname',
            type: 'text',
            placeholder: 'Enter first name'
        },

        {
            id: 'personnel-middlename',
            key: 'middlename',
            type: 'text',
            placeholder: 'Enter middle name'
        },

        {
            id: 'personnel-birthdate',
            key: 'birthdate',
            type: 'date',
            placeholder: ''
        },

        {
            id: 'personnel-gender',
            key: 'gender',
            type: 'select',
            placeholder: ''
        },

        {
            id: 'personnel-address',
            key: 'address',
            type: 'text',
            placeholder: 'Enter address'
        },

        {
            id: 'personnel-email',
            key: 'email',
            type: 'email',
            placeholder: 'Enter email address'
        },

        {
            id: 'personnel-phone',
            key: 'phone',
            type: 'text',
            placeholder: 'Enter phone number'
        }

    ];


    // =====================================
    // CREATE INPUTS
    // =====================================

    fields.forEach(field => {

        const element =
            document.getElementById(field.id);

        if (!element) {
            console.warn(
                `Element not found: ${field.id}`
            );
            return;
        }


        let value =
            personnel[field.key] || '';


        // =====================================
        // BIRTHDATE
        // =====================================

        if (
            field.key === 'birthdate' &&
            value
        ) {

            // If already YYYY-MM-DD
            if (
                /^\d{4}-\d{2}-\d{2}$/.test(value)
            ) {

                // Keep as-is

            } else {

                const date =
                    new Date(value);

                if (
                    !Number.isNaN(
                        date.getTime()
                    )
                ) {

                    value =
                        date
                            .toISOString()
                            .split('T')[0];

                }

            }

        }


        // =====================================
        // TEXT / EMAIL / DATE
        // =====================================

        if (
            field.type === 'text' ||
            field.type === 'email' ||
            field.type === 'date'
        ) {

            element.innerHTML = `
                <input
                    type="${field.type}"
                    id="${field.id}-input"
                    value="${escapeHTML(value)}"
                    placeholder="${field.placeholder}"
                >
            `;

        }


        // =====================================
        // GENDER
        // =====================================

        if (
            field.type === 'select'
        ) {

            const currentGender =
                String(value).toLowerCase();

            element.innerHTML = `
                <select id="${field.id}-input">

                    <option value="">
                        Select Gender
                    </option>

                    <option
                        value="Male"
                        ${
                            currentGender === 'male'
                                ? 'selected'
                                : ''
                        }
                    >
                        Male
                    </option>

                    <option
                        value="Female"
                        ${
                            currentGender === 'female'
                                ? 'selected'
                                : ''
                        }
                    >
                        Female
                    </option>

                </select>
            `;

        }

    });


    // =====================================
    // CHANGE BUTTON
    // =====================================

    editButton.textContent =
        'Save Changes';

    editButton.classList.add(
        'save-mode'
    );


    // =====================================
    // SAVE BUTTON
    // =====================================

    editButton.onclick = () => {

        saveProfile(personnel);

    };


    // =====================================
    // CANCEL BUTTON
    // =====================================

    let cancelButton =
        document.getElementById(
            'cancel-personnel-edit'
        );


    if (!cancelButton) {

        cancelButton =
            document.createElement('button');

        cancelButton.id =
            'cancel-personnel-edit';

        cancelButton.type =
            'button';

        cancelButton.className =
            'outline-button';

        cancelButton.textContent =
            'Cancel';


        editButton.parentElement.appendChild(
            cancelButton
        );

    }


    cancelButton.onclick = () => {

        window.location.reload();

    };

}


// =====================================
// SAVE PROFILE TO MYSQL
// =====================================

async function saveProfile(personnel) {

    console.log(
        '========== SAVING PROFILE =========='
    );


    // =====================================
    // GET INPUTS
    // =====================================

    const firstnameInput =
        document.getElementById(
            'personnel-firstname-input'
        );

    const lastnameInput =
        document.getElementById(
            'personnel-lastname-input'
        );

    const middlenameInput =
        document.getElementById(
            'personnel-middlename-input'
        );

    const birthdateInput =
        document.getElementById(
            'personnel-birthdate-input'
        );

    const genderInput =
        document.getElementById(
            'personnel-gender-input'
        );

    const addressInput =
        document.getElementById(
            'personnel-address-input'
        );

    const emailInput =
        document.getElementById(
            'personnel-email-input'
        );

    const phoneInput =
        document.getElementById(
            'personnel-phone-input'
        );


    // =====================================
    // GET VALUES
    // =====================================

    const firstname =
        firstnameInput
            ? firstnameInput.value.trim()
            : personnel.firstname;

    const lastname =
        lastnameInput
            ? lastnameInput.value.trim()
            : personnel.lastname;

    const middlename =
        middlenameInput
            ? middlenameInput.value.trim()
            : personnel.middlename;

    const birthdate =
        birthdateInput
            ? birthdateInput.value
            : personnel.birthdate;

    const gender =
        genderInput
            ? genderInput.value
            : personnel.gender;

    const address =
        addressInput
            ? addressInput.value.trim()
            : personnel.address;

    const email =
        emailInput
            ? emailInput.value.trim()
            : personnel.email;

    const phone =
        phoneInput
            ? phoneInput.value.trim()
            : (
                personnel.phone_number ||
                personnel.phone ||
                ''
            );


    // =====================================
    // DEBUG
    // =====================================

    console.log(
        'FIRSTNAME:',
        firstname
    );

    console.log(
        'LASTNAME:',
        lastname
    );

    console.log(
        'MIDDLENAME:',
        middlename
    );

    console.log(
        'BIRTHDATE:',
        birthdate
    );

    console.log(
        'GENDER:',
        gender
    );

    console.log(
        'ADDRESS:',
        address
    );

    console.log(
        'EMAIL:',
        email
    );

    console.log(
        'PHONE:',
        phone
    );


    // =====================================
    // VALIDATION
    // =====================================

    if (!firstname) {

        alert(
            'Please enter your first name.'
        );

        return;

    }


    if (!lastname) {

        alert(
            'Please enter your last name.'
        );

        return;

    }


    if (!email) {

        alert(
            'Please enter your email address.'
        );

        return;

    }


    // =====================================
    // ACCOUNT ID
    // =====================================

    const accountId =
        personnel.account_id;


    if (!accountId) {

        alert(
            'Personnel account ID not found.'
        );

        return;

    }


    // =====================================
    // DATA FOR MYSQL
    // =====================================

    const profileData = {

        firstname,
        lastname,
        middlename,
        birthdate,
        gender,
        address,
        phone,
        email

    };


    console.log(
        'DATA SENT TO MYSQL:',
        profileData
    );


    try {

        // =====================================
        // SEND TO BACKEND
        // =====================================

        const response =
            await fetch(
                `http://localhost:3001/api/personnel/profile/${accountId}`,
                {

                    method: 'PUT',

                    headers: {
                        'Content-Type':
                            'application/json'
                    },

                    body:
                        JSON.stringify(
                            profileData
                        )

                }
            );


        console.log(
            'HTTP STATUS:',
            response.status
        );


        const result =
            await response.json();


        console.log(
            'SERVER RESPONSE:',
            result
        );


        // =====================================
        // CHECK SERVER RESPONSE
        // =====================================

        if (
            !response.ok ||
            !result.success
        ) {

            alert(
                result.message ||
                'Failed to update profile.'
            );

            return;

        }


        // =====================================
        // UPDATE LOCALSTORAGE
        // =====================================

        const updatedPersonnel = {

            ...personnel,

            firstname,
            lastname,
            middlename,
            birthdate,
            gender,
            address,
            email,

            phone_number:
                phone

        };


        localStorage.setItem(
            'personnel',
            JSON.stringify(
                updatedPersonnel
            )
        );


        console.log(
            'LOCALSTORAGE UPDATED:',
            updatedPersonnel
        );


        // =====================================
        // SUCCESS
        // =====================================

        showPersonnelSuccessModal();


    } catch (error) {

        console.error(
            'PROFILE UPDATE ERROR:',
            error
        );


        alert(
            'Unable to connect to the server. Please make sure the backend server is running.'
        );

    }

}

function showPersonnelSuccessModal() {
    const overlay = document.querySelector('#personnel-success-overlay');
    const okButton = document.querySelector('#personnel-success-ok');

    if (!overlay || !okButton) {
        window.location.reload();
        return;
    }

    overlay.classList.add('show');
    overlay.setAttribute('aria-hidden', 'false');
    okButton.focus();
    okButton.onclick = () => {
        overlay.classList.remove('show');
        overlay.setAttribute('aria-hidden', 'true');
        window.location.reload();
    };
}


// =====================================
// SET TEXT
// =====================================

function setText(id, value) {

    const element =
        document.getElementById(id);

    if (!element) {
        return;
    }


    element.textContent =
        value !== undefined &&
        value !== null &&
        value !== ''
            ? value
            : '-';

}


// =====================================
// SET STATUS
// =====================================

function setStatus(id, status) {

    const element =
        document.getElementById(id);

    if (!element) {
        return;
    }


    const value =
        status || 'Pending';


    element.innerHTML = `
        <span class="status ${getStatusClass(value)}">
            ${value}
        </span>
    `;

}


// =====================================
// STATUS CLASS
// =====================================

function getStatusClass(status) {

    const value =
        String(status).toLowerCase();


    if (
        value === 'approved' ||
        value === 'active'
    ) {

        return 'approved';

    }


    if (
        value === 'declined' ||
        value === 'inactive'
    ) {

        return 'declined';

    }


    return 'pending';

}


// =====================================
// FORMAT BIRTHDATE
// =====================================

function formatBirthdate(dateValue) {

    if (!dateValue) {
        return '-';
    }


    // YYYY-MM-DD
    if (
        /^\d{4}-\d{2}-\d{2}$/.test(
            dateValue
        )
    ) {

        const [
            year,
            month,
            day
        ] =
            dateValue.split('-');


        const date =
            new Date(
                Number(year),
                Number(month) - 1,
                Number(day)
            );


        return date.toLocaleDateString(
            'en-US',
            {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }
        );

    }


    const date =
        new Date(dateValue);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return dateValue;

    }


    return date.toLocaleDateString(
        'en-US',
        {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }
    );

}


// =====================================
// ESCAPE HTML
// =====================================

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

}