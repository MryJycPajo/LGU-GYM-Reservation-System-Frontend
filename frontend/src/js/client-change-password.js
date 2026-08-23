// =========================================
// SHOW / HIDE PASSWORD
// =========================================

const passwordToggleButtons =
    document.querySelectorAll('.password-toggle');

passwordToggleButtons.forEach((button) => {

    button.addEventListener('click', () => {

        const targetId =
            button.getAttribute('data-target');

        const passwordInput =
            document.getElementById(targetId);

        if (!passwordInput) {
            return;
        }

        if (passwordInput.type === 'password') {

            passwordInput.type = 'text';

            button.textContent = '🙈';

            button.setAttribute(
                'aria-label',
                'Hide password'
            );

        } else {

            passwordInput.type = 'password';

            button.textContent = '👁';

            button.setAttribute(
                'aria-label',
                'Show password'
            );

        }

    });

});

const currentPasswordInput =
    document.querySelector('#current-password');

const newPasswordInput =
    document.querySelector('#new-password');

const confirmPasswordInput =
    document.querySelector('#confirm-new-password');

const changePasswordButton =
    document.querySelector('#change-password-btn');

    const successModal =
    document.querySelector('#success-modal');

const successOkButton =
    document.querySelector('#success-ok-btn');

    function showSuccessModal() {
    successModal.classList.add('show');
}

function hideSuccessModal() {
    successModal.classList.remove('show');
}

successOkButton.addEventListener('click', () => {
    hideSuccessModal();
});


// ================================
// CHANGE PASSWORD
// ================================

changePasswordButton.addEventListener('click', async () => {

    const currentPassword =
        currentPasswordInput.value.trim();

    const newPassword =
        newPasswordInput.value.trim();

    const confirmPassword =
        confirmPasswordInput.value.trim();


    // ================================
    // CHECK EMPTY FIELDS
    // ================================

    if (!currentPassword || !newPassword || !confirmPassword) {

        alert('Please fill in all password fields.');

        return;
    }


    // ================================
    // CHECK PASSWORD CONFIRMATION
    // ================================

    if (newPassword !== confirmPassword) {

        alert('New password and confirm password do not match.');

        return;
    }


    // ================================
    // PREVENT SAME PASSWORD
    // ================================

    if (currentPassword === newPassword) {

        alert(
            'New password must be different from your current password.'
        );

        return;
    }


    try {

        // ================================
        // GET LOGGED-IN ACCOUNT ID
        // ================================

        const accountId =
            localStorage.getItem('account_id');


        console.log('ACCOUNT ID:', accountId);


        if (!accountId) {

            alert(
                'Your account session was not found. Please login again.'
            );

            window.location.href = '../login.html';

            return;
        }


        // ================================
        // SEND REQUEST TO BACKEND
        // ================================

        const response = await fetch(
            'http://localhost:3001/api/auth/change-password',
            {
                method: 'PUT',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify({
                    account_id: accountId,
                    current_password: currentPassword,
                    new_password: newPassword
                })
            }
        );


        const data = await response.json();


        console.log('CHANGE PASSWORD RESPONSE:', data);


        // ================================
        // SUCCESS
        // ================================

if (data.success) {

    currentPasswordInput.value = '';
    newPasswordInput.value = '';
    confirmPasswordInput.value = '';

    showSuccessModal();

}

        // ================================
        // FAILED
        // ================================

        else {

            alert(
                data.message ||
                'Failed to change password.'
            );

        }


    } catch (error) {

        console.error(
            'CHANGE PASSWORD ERROR:',
            error
        );

        alert(
            'Cannot connect to the server.'
        );

    }

});