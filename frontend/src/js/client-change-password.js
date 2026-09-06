document.addEventListener('DOMContentLoaded', () => {

    const newPasswordInput =
        document.getElementById('new-password');

    const confirmPasswordInput =
        document.getElementById('confirm-new-password');

    const changePasswordButton =
        document.getElementById('change-password-btn');

    const successModal =
        document.getElementById('success-modal');

    const successMessage =
        document.getElementById('success-message');

    const successOkBtn =
        document.getElementById('success-ok-btn');


    // =====================================
    // GET ACCOUNT ID FROM EMAIL LINK
    // =====================================

    const params =
        new URLSearchParams(window.location.search);

    const accountId =
        params.get('account_id');


    // =====================================
    // CHECK ACCOUNT ID
    // =====================================

    if (!accountId) {

        window.location.href =
            '../login.html';

        return;
    }


    // =====================================
    // SHOW / HIDE PASSWORD
    // =====================================

    document
        .querySelectorAll('.password-toggle')
        .forEach(button => {

            button.addEventListener('click', () => {

                const targetId =
                    button.dataset.target;

                const input =
                    document.getElementById(targetId);

                if (!input) return;

                if (input.type === 'password') {

                    input.type = 'text';
                    button.textContent = '🙈';

                } else {

                    input.type = 'password';
                    button.textContent = '👁';

                }

            });

        });


    // =====================================
    // CHANGE PASSWORD
    // =====================================

    if (changePasswordButton) {

        changePasswordButton.addEventListener(
            'click',
            async () => {

                const newPassword =
                    newPasswordInput.value.trim();

                const confirmPassword =
                    confirmPasswordInput.value.trim();


                // =================================
                // VALIDATION
                // =================================

                if (!newPassword) {

                    showMessage(
                        'Please enter your new password.'
                    );

                    newPasswordInput.focus();

                    return;
                }


                if (!confirmPassword) {

                    showMessage(
                        'Please confirm your new password.'
                    );

                    confirmPasswordInput.focus();

                    return;
                }


                if (newPassword !== confirmPassword) {

                    showMessage(
                        'New password and confirm password do not match.'
                    );

                    confirmPasswordInput.focus();

                    return;
                }


                if (newPassword.length < 6) {

                    showMessage(
                        'Password must be at least 6 characters.'
                    );

                    newPasswordInput.focus();

                    return;
                }


                // =================================
                // DISABLE BUTTON
                // =================================

                changePasswordButton.disabled = true;

                changePasswordButton.textContent =
                    'Changing...';


                try {

                    // =============================
                    // SEND REQUEST
                    // =============================

                    const response = await fetch(
                        'http://localhost:3001/api/auth/set-password',
                        {
                            method: 'PUT',

                            headers: {
                                'Content-Type':
                                    'application/json'
                            },

                            body: JSON.stringify({
                                account_id: accountId,
                                new_password: newPassword
                            })
                        }
                    );


                    const result =
                        await response.json();


                    console.log(
                        'SET PASSWORD RESPONSE:',
                        result
                    );


                    // =============================
                    // CHECK RESPONSE
                    // =============================

                    if (
                        !response.ok ||
                        !result.success
                    ) {

                        showMessage(
                            result.message ||
                            'Failed to change password.'
                        );

                        return;
                    }


                    // =============================
                    // SUCCESS MODAL
                    // =============================

                    newPasswordInput.value = '';
                    confirmPasswordInput.value = '';

                    if (
                        successModal &&
                        successMessage
                    ) {

                        successMessage.textContent =
                            'Your password has been successfully changed. Please login using your new password.';

                        successModal.classList.add('show');

                    }


                    // =============================
                    // OK → LOGIN
                    // =============================

                    if (successOkBtn) {

                        successOkBtn.onclick = () => {

                            window.location.href =
                                '../login.html';

                        };

                    }


                } catch (error) {

                    console.error(
                        'CHANGE PASSWORD ERROR:',
                        error
                    );

                    showMessage(
                        'Unable to connect to the server. Please make sure the backend server is running.'
                    );

                } finally {

                    changePasswordButton.disabled =
                        false;

                    changePasswordButton.textContent =
                        'Change Password';

                }

            }
        );

    }


    // =====================================
    // MESSAGE FUNCTION
    // =====================================

    function showMessage(message) {

        if (
            successModal &&
            successMessage
        ) {

            successMessage.textContent =
                message;

            successModal.classList.add('show');

        }

    }

});