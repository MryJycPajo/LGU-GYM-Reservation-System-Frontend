document.addEventListener('DOMContentLoaded', () => {

    const currentPasswordInput =
        document.getElementById('current-password');

    const newPasswordInput =
        document.getElementById('new-password');

    const confirmPasswordInput =
        document.getElementById('confirm-new-password');

    const changePasswordButton =
        document.getElementById('change-password-btn');

    // =====================================
    // GET ACCOUNT ID FROM EMAIL LINK
    // =====================================

    const params = new URLSearchParams(window.location.search);
    const accountId = params.get('account_id');

    // =====================================
    // CHECK IF THIS IS FIRST-TIME PASSWORD
    // =====================================

    const isFirstPasswordSetup = !!accountId;

    // =====================================
    // HIDE CURRENT PASSWORD FOR FIRST SETUP
    // =====================================

    if (isFirstPasswordSetup && currentPasswordInput) {

        const currentPasswordLabel =
            currentPasswordInput.closest('label');

        if (currentPasswordLabel) {
            currentPasswordLabel.style.display = 'none';
        }
    }

    // =====================================
    // PASSWORD SHOW / HIDE
    // =====================================

    document.querySelectorAll('.password-toggle').forEach(button => {

        button.addEventListener('click', () => {

            const targetId = button.dataset.target;
            const input = document.getElementById(targetId);

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

        changePasswordButton.addEventListener('click', async () => {

            const currentPassword =
                currentPasswordInput?.value.trim() || '';

            const newPassword =
                newPasswordInput?.value.trim() || '';

            const confirmPassword =
                confirmPasswordInput?.value.trim() || '';

            // =====================================
            // VALIDATION
            // =====================================

            if (!isFirstPasswordSetup && !currentPassword) {

                alert('Please enter your current password.');

                currentPasswordInput.focus();

                return;
            }

            if (!newPassword) {

                alert('Please enter your new password.');

                newPasswordInput.focus();

                return;
            }

            if (!confirmPassword) {

                alert('Please confirm your new password.');

                confirmPasswordInput.focus();

                return;
            }

            if (newPassword !== confirmPassword) {

                alert(
                    'New password and confirm password do not match.'
                );

                confirmPasswordInput.focus();

                return;
            }

            if (newPassword.length < 6) {

                alert(
                    'New password must be at least 6 characters.'
                );

                newPasswordInput.focus();

                return;
            }

            // =====================================
            // DISABLE BUTTON
            // =====================================

            changePasswordButton.disabled = true;
            changePasswordButton.textContent = 'Changing...';

            try {

                let response;

                // =====================================
                // FIRST-TIME PASSWORD SETUP
                // =====================================

                if (isFirstPasswordSetup) {

                    response = await fetch(
                        'http://localhost:3001/api/auth/set-password',
                        {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                account_id: accountId,
                                new_password: newPassword
                            })
                        }
                    );

                }

                // =====================================
                // NORMAL PASSWORD CHANGE
                // =====================================

                else {

                    // For normal logged-in client
                    const clientData =
                        localStorage.getItem('client');

                    if (!clientData) {

                        alert(
                            'Client session not found. Please login again.'
                        );

                        return;
                    }

                    const client =
                        JSON.parse(clientData);

                    if (!client.account_id) {

                        alert(
                            'Client account ID not found.'
                        );

                        return;
                    }

                    response = await fetch(
                        'http://localhost:3001/api/auth/change-password',
                        {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                account_id: client.account_id,
                                current_password: currentPassword,
                                new_password: newPassword
                            })
                        }
                    );
                }

                const result = await response.json();

                console.log(
                    'CHANGE PASSWORD RESPONSE:',
                    result
                );

                if (!response.ok || !result.success) {

                    alert(
                        result.message ||
                        'Failed to change password.'
                    );

                    return;
                }

                // =====================================
                // SUCCESS
                // =====================================

                alert(
                    'Password changed successfully!'
                );

                currentPasswordInput.value = '';
                newPasswordInput.value = '';
                confirmPasswordInput.value = '';

                // If first-time setup
                if (isFirstPasswordSetup) {

                    window.location.href =
                        '../login.html';
                }

            } catch (error) {

                console.error(
                    'CHANGE PASSWORD ERROR:',
                    error
                );

                alert(
                    'Unable to connect to the server. Please make sure the backend server is running.'
                );

            } finally {

                changePasswordButton.disabled = false;

                changePasswordButton.textContent =
                    'Change Password';
            }

        });

    } else {

        console.error(
            'Change Password button not found.'
        );
    }

});