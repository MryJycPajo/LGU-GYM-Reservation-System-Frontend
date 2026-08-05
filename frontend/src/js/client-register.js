const form = document.querySelector('#client-form');
const idInput = document.querySelector('#client-id');
const modal = document.querySelector('#success-modal');

// Generate temporary client ID
function generateClientId() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

idInput.value = generateClientId();

function showError(field, text = '') {
    const wrapper = field.closest('.field');

    if (!wrapper) return;

    wrapper.classList.toggle('invalid', Boolean(text));

    const error = wrapper.querySelector('.error');

    if (error) {
        error.textContent = text;
    }
}

function isValid() {

    let valid = true;

    form.querySelectorAll('[required]').forEach(field => {

        let error = '';

        if (!field.value.trim()) {
            error = 'This field is required.';
        }

        if (
            !error &&
            field.type === 'email' &&
            !field.validity.valid
        ) {
            error = 'Invalid email address.';
        }

        if (
            !error &&
            field.id === 'contact' &&
            !/^09\d{9}$/.test(field.value.trim())
        ) {
            error = 'Enter a valid phone number.';
        }

        if (
            !error &&
            field.id === 'password' &&
            field.value.length < 8
        ) {
            error = 'Password must be at least 8 characters.';
        }

        showError(field, error);

        if (error) valid = false;

    });

    return valid;
}

form.addEventListener('submit', async (event) => {

    event.preventDefault();

    if (!isValid()) return;

    const clientData = {
        lastname: document.querySelector('#last-name').value.trim(),
        firstname: document.querySelector('#first-name').value.trim(),
        middlename: document.querySelector('#middle-name').value.trim(),
        birthdate: document.querySelector('#birthdate').value,
        gender: document.querySelector('#gender').value,
        address: document.querySelector('#address').value.trim(),
        phone: document.querySelector('#contact').value.trim(),
        email: document.querySelector('#email').value.trim(),
        username: document.querySelector('#username').value.trim(),
        password: document.querySelector('#password').value
    };

    try {

        const response = await fetch(
            'http://localhost:3001/api/clients/register',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(clientData)
            }
        );

        const data = await response.json();

        if (data.success) {

            idInput.value = data.account_id;

            modal.classList.add('visible');
            modal.setAttribute('aria-hidden', 'false');

            form.reset();

        } else {

            alert(data.message);

        }

    } catch (err) {

        console.error(err);
        alert('Cannot connect to the server.');

    }

});

// Reset form
form.addEventListener('reset', () => {

    setTimeout(() => {

        form.querySelectorAll('.field').forEach(field => {
            field.classList.remove('invalid');
        });

        form.querySelectorAll('.error').forEach(error => {
            error.textContent = '';
        });

        idInput.value = generateClientId();

    });

});

// Close modal
document.querySelector('#modal-close').addEventListener('click', () => {

    window.location.href = './login.html';

});