const form = document.querySelector('#login-form');
const passwordInput = document.querySelector('#password');
const toggle = document.querySelector('.password-toggle');
const message = document.querySelector('#form-message');

toggle.addEventListener('click', () => {
  const visible = passwordInput.type === 'text';
  passwordInput.type = visible ? 'password' : 'text';
  toggle.setAttribute('aria-label', visible ? 'Show password' : 'Hide password');
  toggle.setAttribute('aria-pressed', String(!visible));
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  message.textContent = '';

  const username = document.querySelector('#username').value.trim();
  const password = document.querySelector('#password').value.trim();

  if (!username || !password) {
    message.textContent = 'Username and Password are required.';
    return;
  }

  try {
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username,
        password
      })
    });

    const data = await response.json();
    
    console.log('LOGIN RESPONSE:', data);

    if (data.success) {
      message.textContent = 'Login Successful!';

      // Save logged-in client information
if (data.role === 'client') {

  localStorage.setItem(
    'client',
    JSON.stringify({
      account_id: data.account_id,
      firstname: data.firstname,
      lastname: data.lastname,
      middlename: data.middlename,
      email: data.email,
      phone_number: data.phone_number
    })
  );

}

      if (data.role === 'admin') {
        window.location.href = '/src/pages/admin-dashboard.html';
      } else if (data.role === 'personnel') {
        window.location.href = '/src/pages/personnel-dashboard.html';
      } else if (data.role === 'client') {
        window.location.href = '/src/pages/client-dashboard.html';
      }

    } else {
      message.textContent = data.message;
    }

  } catch (err) {
    console.error(err);
    message.textContent = 'Cannot connect to the server.';
  }

});

document.querySelector('#forgot-link').addEventListener('click', (event) => {
  event.preventDefault();
  message.textContent =
    'Please contact the system administrator to reset your password.';
});