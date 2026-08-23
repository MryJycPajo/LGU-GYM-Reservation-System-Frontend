const form = document.querySelector('#login-form');
const passwordInput = document.querySelector('#password');
const toggle = document.querySelector('.password-toggle');
const message = document.querySelector('#form-message');


// ================================
// SHOW / HIDE PASSWORD
// ================================

if (toggle) {

    toggle.addEventListener('click', () => {

        const visible = passwordInput.type === 'text';

        passwordInput.type = visible
            ? 'password'
            : 'text';

        toggle.setAttribute(
            'aria-label',
            visible ? 'Show password' : 'Hide password'
        );

        toggle.setAttribute(
            'aria-pressed',
            String(!visible)
        );

    });

}


// ================================
// LOGIN
// ================================

form.addEventListener('submit', async (event) => {

    event.preventDefault();

    message.textContent = '';

    const username =
        document.querySelector('#username').value.trim();

    const password =
        document.querySelector('#password').value.trim();


    // ================================
    // VALIDATION
    // ================================

    if (!username || !password) {

        message.textContent =
            'Username and Password are required.';

        return;
    }


    try {

        // ================================
        // SEND LOGIN REQUEST
        // ================================

        const response = await fetch(
            'http://localhost:3001/api/auth/login',
            {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify({
                    username,
                    password
                })
            }
        );


        const data = await response.json();

        console.log('LOGIN RESPONSE:', data);


        // ================================
        // LOGIN SUCCESS
        // ================================

        if (data.success) {

            message.textContent =
                'Login Successful!';


            // ================================
            // SAVE ACCOUNT ID
            // ================================

            if (data.user && data.user.account_id) {

                localStorage.setItem(
                    'account_id',
                    data.user.account_id
                );

            }


            // ================================
            // SAVE ROLE
            // ================================

            if (data.role) {

                localStorage.setItem(
                    'role',
                    data.role
                );

            }


            // ================================
            // SAVE CLIENT INFORMATION
            // ================================

            if (data.role === 'client' && data.user) {

                localStorage.setItem(
                    'client',
                    JSON.stringify({
                        account_id: data.user.account_id,
                        firstname: data.user.firstname,
                        lastname: data.user.lastname,
                        middlename: data.user.middlename,
                        email: data.user.email,
                        phone_number: data.user.phone_number
                    })
                );

            }

            
// ================================
// SAVE PERSONNEL INFORMATION
// ================================

if (data.role === 'personnel' && data.user) {

    localStorage.setItem(
        'personnel',
        JSON.stringify({
            account_id: data.user.account_id,
            personnel_id: data.user.personnel_id,
            firstname: data.user.firstname,
            lastname: data.user.lastname,
            middlename: data.user.middlename,
            birthdate: data.user.birthdate,
            gender: data.user.gender,
            address: data.user.address,
            email: data.user.email,
            phone_number: data.user.phone_number,
            username: data.user.username,
            position: data.user.position,
            role: data.user.role,
            status: data.user.status
        })
    );

     console.log(
        'PERSONNEL SAVED:',
        localStorage.getItem('personnel')
    );
}



            // ================================
            // REDIRECT
            // ================================

            if (data.role === 'admin') {

                window.location.href =
                    '/src/pages/admin-dashboard.html';

            }

            else if (data.role === 'personnel') {

                window.location.href =
                    '/src/pages/personnel-dashboard.html';

            }

            else if (data.role === 'client') {

                window.location.href =
                    '/src/pages/client-dashboard.html';

            }

        }


        // ================================
        // LOGIN FAILED
        // ================================

        else {

            message.textContent =
                data.message || 'Invalid username or password.';

        }


    } catch (err) {

        console.error('LOGIN ERROR:', err);

        message.textContent =
            'Cannot connect to the server.';

    }

});


// ================================
// FORGOT PASSWORD
// ================================

const forgotLink =
    document.querySelector('#forgot-link');

if (forgotLink) {

    forgotLink.addEventListener('click', (event) => {

        event.preventDefault();

        message.textContent =
            'Please contact the system administrator to reset your password.';

    });

}