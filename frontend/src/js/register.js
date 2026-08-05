const form = document.querySelector('#registration-form');
const idInput = document.querySelector('#personnel-id');
const modal = document.querySelector('#success-modal');
const recordsKey = 'lguGymPersonnel';

const records = () => JSON.parse(localStorage.getItem(recordsKey) || '[]');

function newPersonnelId() {
  const used = new Set(records().map((record) => record.personnelId));
  let id;
  do id = String(Math.floor(100000 + Math.random() * 900000)); while (used.has(id));
  return id;
}

function setError(field, text = '') {
  const container = field.closest('.field');
  container.classList.toggle('invalid', Boolean(text));
  container.querySelector('.error').textContent = text;
}

function validate() {
  let valid = true;
  const fields = [...form.querySelectorAll('[required]')];
  fields.forEach((field) => {
    let error = !field.value.trim() ? 'This field is required.' : '';
    if (!error && field.type === 'email' && !field.validity.valid) error = 'Enter a valid email address.';
    if (!error && field.name === 'contact' && !/^\d+$/.test(field.value.trim())) error = 'Use numbers only.';
    if (!error && field.name === 'password' && field.value.length < 8) error = 'Password must be at least 8 characters.';
    if (!error && field.name === 'confirmPassword' && field.value !== form.elements.password.value) error = 'Passwords do not match.';
    setError(field, error);
    valid &&= !error;
  });
  return valid;
}

idInput.value = newPersonnelId();

 form.addEventListener('submit', async (event) => {

    event.preventDefault();

    if (!validate()) return;

    const personnelData = {
        lastname: document.querySelector('#last-name').value,
        firstname: document.querySelector('#first-name').value,
        middlename: document.querySelector('#middle-name').value,
        birthdate: document.querySelector('#birthdate').value,
        gender: document.querySelector('#gender').value,
        address: document.querySelector('#address').value,
        phone: document.querySelector('#contact').value,
        email: document.querySelector('#email').value,
        position: document.querySelector('#position').value,
        username: document.querySelector('#username').value,
        password: document.querySelector('#password').value
    };

    try {

        const response = await fetch(
            'http://localhost:3001/api/personnel/register',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(personnelData)
            }
        );

        const data = await response.json();

        if (data.success) {

            idInput.value = data.account_id;

            modal.classList.add('visible');
            modal.setAttribute('aria-hidden', 'false');

        } else {

            alert(data.message);

        }

    } catch (err) {

        console.error(err);
        alert('Cannot connect to the server.');

    }

});
form.addEventListener('reset', () => {
  window.setTimeout(() => {
    form.querySelectorAll('.field').forEach((field) => field.classList.remove('invalid'));
    form.querySelectorAll('.error').forEach((error) => error.textContent = '');
    idInput.value = newPersonnelId();
  });
});
document.querySelector('#modal-close').addEventListener('click', () => { window.location.href = './login.html'; });
